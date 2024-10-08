import express from "express";
import 'dotenv/config'
import { getMemoryClient, backupFuuBotDb, vacuumBackup, loadFromBackup, updateMemoryDb } from "./utils/dbHelpers.js";
import { getRedisCacheClient, getRedisMetaClient, hydrateRedisFromBackup, hydrateRedis, hydrateRedisFromBlacklist, deleteCache, getGuestToken, refreshPlayerData } from "./utils/redisHelpers.js";
import UpdateQueue from "./utils/UpdateQueue.js";
import { logger } from "./utils/Logger.js";
import { addCleanupListener, exitAfterCleanup } from "async-cleanup";
import readline from 'readline';
import { promises as fs } from 'fs';

const app = express();
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
    (async () => {
        const cors = await import('cors');
        app.use(cors.default());
    })();
}
const memClient = getMemoryClient();
const redisMeta = await getRedisMetaClient();
const redisCache = await getRedisCacheClient();
const updateQueue = new UpdateQueue();
let lastUpdateTimestamp = 0;
let isDeletingCache = false;
let blacklist = new Set();
let bearerToken = '';

async function updateAndHydrate(newRows) {
    updateMemoryDb(memClient, newRows);
    lastUpdateTimestamp = Math.floor(new Date().getTime() / 1000);
    isDeletingCache = true;
    await deleteCache(redisCache);
    isDeletingCache = false;
    bearerToken = await getGuestToken();
    await hydrateRedis(redisMeta, bearerToken, newRows);
    await updateBlacklist();
}

async function updateBlacklist(){
    try{
        const temp = await getBlacklist();
        if(temp.length!==blacklist.length){
            blacklist=temp;
            hydrateRedisFromBlacklist(redisMeta, bearerToken, blacklist);
        }
    } catch (error) {
        logger.error('Error reading blacklist:', error);
    }
}

function getBeatmapQuery(period) {
    let orderBy = '';
    switch (period) {
        case 'weekly':
            orderBy = 'weekly_count';
            break;
        case 'monthly':
            orderBy = 'monthly_count';
            break;
        case 'yearly':
            orderBy = 'yearly_count';
            break;
        case 'alltime':
            orderBy = 'alltime_count';
            break;
        default:
            return '';
    }
    return `
    SELECT BEATMAP_ID, 
           COUNT(*) as alltime_count,
           SUM(CASE WHEN PICK_DATE > (strftime('%s', 'now') - 7 * 86400) THEN 1 ELSE 0 END) as weekly_count,
           SUM(CASE WHEN PICK_DATE > (strftime('%s', 'now') - 30 * 86400) THEN 1 ELSE 0 END) as monthly_count,
           SUM(CASE WHEN PICK_DATE > (strftime('%s', 'now') - 365 * 86400) THEN 1 ELSE 0 END) as yearly_count
    FROM PICKS
    GROUP BY BEATMAP_ID
    ORDER BY ${orderBy} DESC 
    LIMIT (?) 
    OFFSET (?)`;
}

function getLeaderboardQuery(period) {
    const sortColumn = period === 'weekly' ? 'weekly_pick_count' : 'alltime_pick_count';
    
    return `
        SELECT PICKER_ID, 
            COUNT(*) as alltime_pick_count,
            SUM(CASE WHEN PICK_DATE > (strftime('%s', 'now') - 7 * 86400) THEN 1 ELSE 0 END) as weekly_pick_count
        FROM PICKS
        WHERE PICKER_ID != 0
        GROUP BY PICKER_ID 
        ORDER BY ${sortColumn} DESC 
        LIMIT 50`;
}


function getSideboardQuery(type) {
    if (type !== 'unique' && type !== 'overplayed') {
        return null;
    }
    
    if(type === 'unique'){
        return `
        SELECT PICKER_ID, COUNT(*) as PICK_COUNT
        FROM PICKS
        WHERE BEATMAP_ID IN (
            SELECT BEATMAP_ID
            FROM PICKS
            GROUP BY BEATMAP_ID
            HAVING COUNT(*) = 1
        )
        AND PICKER_ID != 0
        GROUP BY PICKER_ID
        ORDER BY PICK_COUNT DESC
        LIMIT 10;`
    }
    else{
        return `
        WITH OverplayedMaps AS (
        SELECT DISTINCT BEATMAP_ID, PICKER_ID 
        FROM PICKS 
        WHERE BEATMAP_ID IN (
            SELECT BEATMAP_ID
            FROM PICKS
            WHERE PICK_DATE > (strftime('%s', 'now') - 7 * 86400)
            GROUP BY BEATMAP_ID
            HAVING COUNT(*) >= ${process.env.WEEKLY_LIMIT}

            UNION

            SELECT BEATMAP_ID
            FROM PICKS
            WHERE PICK_DATE > (strftime('%s', 'now') - 30 * 86400)
            GROUP BY BEATMAP_ID
            HAVING COUNT(*) >= ${process.env.MONTHLY_LIMIT}

            UNION

            SELECT BEATMAP_ID
            FROM PICKS
            WHERE PICK_DATE > (strftime('%s', 'now') - 365 * 86400)
            GROUP BY BEATMAP_ID
            HAVING COUNT(*) >= ${process.env.YEARLY_LIMIT}

            UNION

            SELECT BEATMAP_ID
            FROM PICKS
            GROUP BY BEATMAP_ID
            HAVING COUNT(*) >= ${process.env.ALLTIME_LIMIT}
        )
        )

        SELECT PICKER_ID, COUNT(*) AS PICK_COUNT
        FROM OverplayedMaps
        WHERE PICKER_ID != 0
        GROUP BY PICKER_ID
        ORDER BY PICK_COUNT DESC
        LIMIT 10;`
    }
}

function showStats(){
    const query = `
    SELECT COUNT(*) as alltime_count,
    SUM (CASE WHEN PICK_DATE > (strftime('%s', 'now') - 7 * 86400) THEN 1 ELSE 0 END) as weekly_count,
    SUM (CASE WHEN PICK_DATE > (strftime('%s', 'now') - 30 * 86400) THEN 1 ELSE 0 END) as monthly_count,
    SUM (CASE WHEN PICK_DATE > (strftime('%s', 'now') - 365 * 86400) THEN 1 ELSE 0 END) as yearly_count
    FROM PICKS;`
    const row = memClient.prepare(query).get();
    logger.info(`All-time count: ${row.alltime_count}`);
    logger.info(`Weekly count: ${row.weekly_count}`);
    logger.info(`Monthly count: ${row.monthly_count}`);
    logger.info(`Yearly count: ${row.yearly_count}`);
}

async function setAlltimeLimits(){
    const query = `
    SELECT BEATMAP_ID, COUNT(*) as alltime_count
    FROM PICKS
    GROUP BY BEATMAP_ID
    ORDER BY alltime_count DESC
    LIMIT 1 OFFSET 100;`
    const row = memClient.prepare(query).get();
    if (row.alltime_count) {
        process.env.ALLTIME_LIMIT = row.alltime_count;
        await deleteCache(redisCache);
        logger.info(`Set New Alltime Limit: ${row.alltime_count}`);
    }
    else {
        logger.error('Error calculating new alltime limit');
    }
}

function getYesterdayLeaderboardQuery(period) {
    const sortColumn = period === 'weekly' ? 'weekly_pick_count' : 'alltime_pick_count';
    
    return `
        SELECT PICKER_ID, 
            SUM(CASE WHEN PICK_DATE < (strftime('%s', 'now', 'start of day', '-1 day', 'utc')) THEN 1 ELSE 0 END) as alltime_pick_count,
            SUM(CASE WHEN PICK_DATE >= (strftime('%s', 'now', 'start of day', '-8 days', 'utc')) AND PICK_DATE < (strftime('%s', 'now', 'start of day', '-1 day', 'utc')) THEN 1 ELSE 0 END) as weekly_pick_count
        FROM PICKS 
        WHERE PICKER_ID != 0
        GROUP BY PICKER_ID 
        ORDER BY ${sortColumn} DESC 
        LIMIT 50`;
}

async function getBlacklist() {
    const data = await fs.readFile(process.env.BLACKLIST_TXT_PATH, 'utf-8');
    const blacklist = new Set(data.split('\n')
        .map(line => parseInt(line.trim()))
        .filter(id => !isNaN(id)));
    return blacklist;
}

async function main(){
    await backupFuuBotDb();
    lastUpdateTimestamp = Math.floor(new Date().getTime() / 1000);
    vacuumBackup();
    await deleteCache(redisCache);
    bearerToken = await getGuestToken();
    await hydrateRedisFromBackup(redisMeta, bearerToken);
    loadFromBackup(memClient);
    memClient.pragma('journal_mode = WAL');
    try{
        blacklist = await getBlacklist();
        await hydrateRedisFromBlacklist(redisMeta, bearerToken, blacklist);
    } catch (error) {
        logger.error('Error reading blacklist:', error);
    }
    app.get('/api/dbv', (req, res) => {
        res.json({ dbv: lastUpdateTimestamp });
    });

    app.get('/api/history/:id', async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid parameters' });
            return;
        }
        const cacheKey = `fuubot:cache-history-${id}`;
        try {
            if (!isDeletingCache) {
                const cachedResult = await redisCache.get(cacheKey);
                if (cachedResult) {            
                    res.json(JSON.parse(cachedResult));
                    return;
                }
            }
            const query1 = `
                SELECT COUNT(*) AS total_count
                FROM PICKS
                WHERE BEATMAP_ID = ?
            `;
            const countResult = memClient.prepare(query1).get(id);
            const query2 = `
                SELECT PICKER_ID, PICK_DATE
                FROM PICKS 
                WHERE BEATMAP_ID = ?
                AND PICK_DATE > (strftime('%s', 'now') - 7 * 86400)
                ORDER BY PICK_DATE DESC
            `;
            const query3 = `
                SELECT COUNT(*) AS total_count
                FROM PICKS 
                WHERE PICKER_ID = ?
            `;

            const rows = memClient.prepare(query2).all(id);
            const history = [];
            const meta = await redisMeta.hGetAll(`fuubot:beatmap-${id}`);
            if (!meta.t) {  
                res.status(404).json({ error: 'Beatmap not found' });
                return;
            }
            for (const row of rows) {
                const player = await redisMeta.hGetAll(`fuubot:player-${row.PICKER_ID}`);
                let pickCount = memClient.prepare(query3).get(row.PICKER_ID);
                if (!pickCount) {
                    pickCount = 0;
                }
                history.push({ 
                    id: row.PICKER_ID, 
                    n: player.n,
                    con_c: player.con_c,
                    cv: player.cv,
                    gr: player.gr,
                    pt: player.pt,
                    pickCount: pickCount.total_count,
                    pickDate: row.PICK_DATE });
            }
            const result = { 
                beatmap: meta, 
                history: history,
                alltimeCount: countResult.total_count
            };
            if (!isDeletingCache) {
                await redisCache.set(cacheKey, JSON.stringify(result));
            }        
            res.json(result);
        } catch (error) {
            logger.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/api/blacklist', async (req, res) => {
        const cacheKey = 'fuubot:cache-blacklist';
        try {
            if (!isDeletingCache) {
                const cachedResult = await redisCache.get(cacheKey);
                if (cachedResult) {            
                    res.json(JSON.parse(cachedResult));
                    return;
                }
            }
            const result = [];
            for (const beatmapId of blacklist) {
                const meta = await redisMeta.hGetAll(`fuubot:beatmap-${beatmapId}`);
                if (meta.t) {
                    result.push({ beatmapId: beatmapId , ...meta });
                }
            }
            if (!isDeletingCache) {
                await redisCache.set(cacheKey, JSON.stringify(result));
            }
            res.json(result);
        } catch (error) {
            logger.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/api/beatmaps/:period', async (req, res) => {
        const { period } = req.params;
        const pageNo = parseInt(req.query.pageNo);
        const dbv = parseInt(req.query.dbv);
        if (isNaN(dbv) || isNaN(pageNo) || pageNo < 0) {
            res.status(400).json({ error: 'Invalid parameters' });
            return;
        }
        else if (dbv === -1 && pageNo !== 0) {
            res.status(409).json({ error: 'Incompatible page requested' });
            return;
        }
        else if (dbv !== -1 && dbv !== lastUpdateTimestamp) {
            res.status(409).json({ error: 'dbv mismatch' });
            return;
        }
        const cacheKey = `fuubot:cache-beatmap-${period}-${pageNo}`;   
        try {
            if (!isDeletingCache) {
                const cachedResult = await redisCache.get(cacheKey);
                if (cachedResult) {                  
                    res.json(JSON.parse(cachedResult));
                    return;
                }
            }
            const query = getBeatmapQuery(period);
            if (!query) {
                return;
            }
            const rows = memClient.prepare(query).all(10, pageNo * 10);
            const result = [];
            for (const row of rows) {
                const meta = await redisMeta.hGetAll(`fuubot:beatmap-${row.BEATMAP_ID}`);
                if (meta.t) {
                    let isBlacklisted = blacklist.has(row.BEATMAP_ID);
                    result.push({ ...row, ...meta, isBlacklisted: isBlacklisted });
                }
            }
            if (!isDeletingCache) {
                await redisCache.set(cacheKey, JSON.stringify(result));
            }        
            res.json(result);
        } catch (error) {
            logger.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.post('/api/update', async (req, res, next) => {
        const allowedHosts = ['127.0.0.1', '::1', 'localhost'];
        const requestHost = req.hostname;

        if (!requestHost) {
            return res.status(400).send('Bad Request');
        }
        
        if (!allowedHosts.includes(requestHost)) {
            return res.status(403).send('Forbidden');
        }
        next();
        }, async (req, res) => {
            try{
                const newRows = req.body.picks;
                if (!newRows || !Array.isArray(newRows) || newRows.length === 0) {
                    res.status(400).json({ error: 'Invalid parameters' });
                    return;
                }
                updateQueue.addToQueue(async () => {
                    logger.info(`Received ${newRows.length} new rows`);
                    await updateAndHydrate(newRows);
                });
                res.status(200).json({ message: 'received' });
            } catch (error) {
                logger.error('Error updating with new rows:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

    app.get('/api/limits', async (req, res, next) => {
        const allowedHosts = ['127.0.0.1', '::1', 'localhost'];
        const requestHost = req.hostname;

        if (!requestHost) {
            return res.status(400).send('Bad Request');
        }
        
        if (!allowedHosts.includes(requestHost)) {
            return res.status(403).send('Forbidden');
        }
        next();
        }, async (req, res) => {
            try{
                const limit = Number(process.env.ALLTIME_LIMIT);
                if (!isNaN(limit)) {
                    res.json(limit);
                }
                else {
                    res.status(500).json({ error: 'ALLTIME_LIMIT is not a number' });
                }
            } catch (error) {
                logger.error('Error sending limit:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

    app.get('/api/leaderboard/:period', async (req, res) => {
        const { period } = req.params;
        const cacheKey = `fuubot:cache-leaderboard-${period}`;   
        try {
            if (!isDeletingCache) {
                const cachedResult = await redisCache.get(cacheKey);
                if (cachedResult) {                  
                    res.json(JSON.parse(cachedResult));
                    return;
                }
            }
            const query1 = getLeaderboardQuery(period);
            const query2 = getYesterdayLeaderboardQuery(period);
            const todayRows = memClient.prepare(query1).all();
            const yesterdayRows = memClient.prepare(query2).all();
            const yesterdayRanks = {};
            yesterdayRows.forEach((row, index) => {
                yesterdayRanks[row.PICKER_ID] = index;
            });
            const result = [];
            for (let i = 0; i < todayRows.length; i++) {
                const row = todayRows[i];
                const player = await redisMeta.hGetAll(`fuubot:player-${row.PICKER_ID}`);
                if (player.n) {
                    const currentRank = i;
                    const previousRank = yesterdayRanks[row.PICKER_ID] || currentRank;
                    const rankChange = previousRank - currentRank;
                    result.push({
                        id: row.PICKER_ID,
                        name: player.n,
                        country: player.con_c,
                        alltimeCount: row.alltime_pick_count, 
                        weeklyCount: row.weekly_pick_count,
                        delta: rankChange
                    });
                }
            }
            if (!isDeletingCache) {
                await redisCache.set(cacheKey, JSON.stringify(result));
            }            
            res.json(result);
        } catch (error) {
            logger.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/api/sideboard/:type', async (req, res) => {
        const { type } = req.params;
        const cacheKey = `fuubot:cache-sideboard-${type}`;   
        try {
            if (!isDeletingCache) {
                const cachedResult = await redisCache.get(cacheKey);
                if (cachedResult) {     
                    res.json(JSON.parse(cachedResult));      
                    return;
                }
            }
            const query = getSideboardQuery(type);
            if (!query) {
                res.status(400).json({ error: 'Invalid parameters' });
            }
            const rows = memClient.prepare(query).all();
            const result = [];
            for (const row of rows) {
                const player = await redisMeta.hGetAll(`fuubot:player-${row.PICKER_ID}`);
                if (player.n) {
                    result.push({
                        id: row.PICKER_ID,
                        name: player.n,
                        country: player.con_c,
                        pickCount: row.PICK_COUNT, 
                    });
                }
            }
            if (!isDeletingCache) {
                await redisCache.set(cacheKey, JSON.stringify(result));
            }            
            res.json(result);
        } catch (error) {
            logger.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/api/profile/picks/:id', async (req, res) => {
        const id = parseInt(req.params.id);
        const pageNo = parseInt(req.query.pageNo);
        const dbv = parseInt(req.query.dbv);
        if (isNaN(dbv) || isNaN(pageNo) || pageNo < 0) {
            res.status(400).json({ error: 'Invalid parameters' });
            return;
        }
        else if (dbv === -1 && pageNo !== 0) {
            res.status(409).json({ error: 'Incompatible page requested' });
            return;
        }
        else if (dbv !== -1 && dbv !== lastUpdateTimestamp) {
            res.status(409).json({ error: 'dbv mismatch' });
            return;
        }
        const cacheKey = `fuubot:cache-picks-${id}-${pageNo}`;   
        try {
            if (!isDeletingCache) {
                const cachedResult = await redisCache.get(cacheKey);
                if (cachedResult) {    
                    res.json(JSON.parse(cachedResult));         
                    return;
                }
            }
            const query = `
                SELECT BEATMAP_ID, PICK_DATE 
                FROM PICKS 
                WHERE PICKER_ID = ? 
                ORDER BY PICK_DATE DESC 
                LIMIT ? 
                OFFSET ?`
            const rows = memClient.prepare(query).all(id, 15, pageNo * 15);
            const result = [];
            for (const row of rows) {
                const meta = await redisMeta.hGetAll(`fuubot:beatmap-${row.BEATMAP_ID}`);
                if (meta.t) {
                    result.push({ ...row, ...meta });
                }
            }
            if (!isDeletingCache) {
                await redisCache.set(cacheKey, JSON.stringify(result));
            }        
            res.json(result);
        } catch (error) {
            logger.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/api/profile/:id', async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid parameters' });
            return;
        }
        const cacheKey = `fuubot:cache-profile-${id}`;   
        try {
            if (!isDeletingCache) {
                const cachedResult = await redisCache.get(cacheKey);
                if (cachedResult) {
                    res.json(JSON.parse(cachedResult));
                    return;
                }
            }
            const query = `
                SELECT
                    COUNT(*) as alltime_pick_count,
                    SUM(CASE WHEN PICK_DATE > (strftime('%s', 'now') - 7 * 86400) THEN 1 ELSE 0 END) as weekly_pick_count
                FROM PICKS
                WHERE PICKER_ID = ?`;
            const row = memClient.prepare(query).get(id);
            const player = await redisMeta.hGetAll(`fuubot:player-${id}`);
            const result = {
                player: player,
                alltimeCount: row.alltime_pick_count,
                weeklyCount: row.weekly_pick_count
            }    
            if (!isDeletingCache) {
                await redisCache.set(cacheKey, JSON.stringify(result));
            }        
            res.json(result);
        } catch (error) {
            logger.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.listen(process.env.PORT, () => {
        logger.info(`Server running on port ${process.env.PORT}!`);
    });
}

main();
  
addCleanupListener(async () => {
    if (memClient) {
        memClient.close();
        logger.info('Memory database connection closed.');
    }

    if (redisCache) {
        await redisCache.quit();
        logger.info('Redis cache connection closed.');
    }

    if (redisMeta) {
        await redisMeta.quit();
        logger.info('Redis meta connection closed.');
    }
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', async (input) => {
    if (input.trim().toLowerCase() === 'close') {
        await exitAfterCleanup(0);
    }
    if (input.trim().toLowerCase() === 'refresh') {
        await refreshPlayerData(redisMeta, memClient);
    }
    if (input.trim().toLowerCase() === 'stats') {
        showStats();
    }
    if (input.trim().toLowerCase() === 'update limit') {
        setAlltimeLimits();
    }
});

