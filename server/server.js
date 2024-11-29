import express from "express";
import 'dotenv/config'
import { getMemoryClient, 
    backupFuuBotDb, 
    vacuumBackup, 
    loadFromBackup, 
    updateMemoryDb,
    getYesterdayLeaderboardQuery,
    getStatQuery,
    getSideboardQuery,
    getLeaderboardQuery,
    getSearchBeatmapQuery,
    getBeatmapQuery } from "./utils/dbHelpers.js";
import { 
    getRedisCacheClient, 
    getRedisMetaClient, 
    hydrateRedisFromBackup, 
    hydrateRedis, 
    hydrateRedisFromBlacklist, 
    deleteCache, 
    getGuestToken, 
    refreshPlayerData,
    createBeatmapIndexes,
    searchBeatmapIndexes } from "./utils/redisHelpers.js";
import UpdateQueue from "./utils/UpdateQueue.js";
import { logger } from "./utils/Logger.js";
import { addCleanupListener, exitAfterCleanup } from "async-cleanup";
import readline from 'readline';
import { promises as fs } from 'fs';
import cron from 'node-cron';

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
let weeklyLimit = Number(process.env.WEEKLY_LIMIT) || 999;
let monthlyLimit = Number(process.env.MONTHLY_LIMIT) || 999;
let yearlyLimit = Number(process.env.YEARLY_LIMIT) || 999;
let alltimeLimit = Number(process.env.ALLTIME_LIMIT) || 999;

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


function showStats(){
    const query = getStatQuery();
    const row = memClient.prepare(query).get();
    logger.info(`Weekly count: ${row.weekly_count}`);
    logger.info(`Monthly count: ${row.monthly_count}`);
    logger.info(`Yearly count: ${row.yearly_count}`);
    logger.info(`All-time count: ${row.alltime_count}`);
}

function setOtherLimits(){
    try {
        const query2 = `SELECT SUM (CASE WHEN PICK_DATE > (strftime('%s', 'now') - 30 * 86400) THEN 1 ELSE 0 END) as monthly_count,
            SUM (CASE WHEN PICK_DATE > (strftime('%s', 'now') - 365 * 86400) THEN 1 ELSE 0 END) as yearly_count
            FROM PICKS;`
        const counts = memClient.prepare(query2).get();
        if (counts.monthly_count !== undefined){
            monthlyLimit = Math.floor(counts.monthly_count / 30 * 0.03);
            logger.info(`Set New Monthly Limit: ${monthlyLimit}`);
        }
        if (counts.yearly_count !== undefined){
            yearlyLimit = Math.floor(counts.yearly_count / 365 * 0.4);
            logger.info(`Set New Yearly Limit: ${yearlyLimit}`);
        }
    } catch (error) {
        logger.error('Error setting other limits:', error);
    }
}

function setWeeklyAndAlltimeLimits(){
    try {
        const query1 = `
        SELECT BEATMAP_ID, COUNT(*) as alltime_count
        FROM PICKS
        GROUP BY BEATMAP_ID
        ORDER BY alltime_count DESC
        LIMIT 1 OFFSET 100;`
        const row = memClient.prepare(query1).get();
        const query2 = `SELECT SUM (CASE WHEN PICK_DATE > (strftime('%s', 'now') - 7 * 86400) THEN 1 ELSE 0 END) as weekly_count FROM PICKS;`
        const counts = memClient.prepare(query2).get();
        if (counts.weekly_count !== undefined){
            weeklyLimit = Math.floor(counts.weekly_count / 7 * 0.015);
            logger.info(`Set New Weekly Limit: ${weeklyLimit}`);
        }
        if (row.alltime_count !== undefined) {
            alltimeLimit = row.alltime_count;
            logger.info(`Set New Alltime Limit: ${alltimeLimit}`);
        }
    } catch (error) {
        logger.error('Error setting weekly or alltime limit: ', error);
    }
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
    await createBeatmapIndexes(redisMeta);
    setOtherLimits();
    setWeeklyAndAlltimeLimits();
    cron.schedule('0 0 * * *', () => {
        logger.info('Updating weekly and alltime limits');
        setWeeklyAndAlltimeLimits();
        }, {
        timezone: "UTC"
    });
        
    logger.info('Scheduled Cron Job to update weekly and alltime limits daily (everyday at 00:00 UTC)');
        
    cron.schedule('0 0 * * 0', () => {
        logger.info('Updating other limits');
        setOtherLimits();
        }, {
        timezone: "UTC"
    });
    
    logger.info('Scheduled Cron Job to update other limits weekly (every Sunday 00:00 UTC)');
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
            const query = `
                SELECT COUNT(*) AS total_count
                FROM PICKS
                WHERE BEATMAP_ID = ?
            `;
            const countResult = memClient.prepare(query).get(id);
            const meta = await redisMeta.hGetAll(`fuubot:beatmap-${id}`);
            if (!meta.t) {  
                res.status(404).json({ error: 'Beatmap not found' });
                return;
            }
            const result = { 
                beatmap: meta, 
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

    app.get('/api/history/players/:id', async (req, res) => {
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
        const cacheKey = `fuubot:cache-history-players-${id}-${pageNo}`;
        try {
            if (!isDeletingCache) {
                const cachedResult = await redisCache.get(cacheKey);
                if (cachedResult) {            
                    res.json(JSON.parse(cachedResult));
                    return;
                }
            }
            const query = `
                SELECT PICKER_ID, PICK_DATE 
                FROM PICKS 
                WHERE BEATMAP_ID = ? 
                ORDER BY PICK_DATE DESC 
                LIMIT ? 
                OFFSET ?`

            const query2 = `
                SELECT COUNT(*) AS total_count
                FROM PICKS 
                WHERE PICKER_ID = ?
            `;

            const rows = memClient.prepare(query).all(id, 10, pageNo * 10);
            const result = [];
            for (const row of rows) {
                const player = await redisMeta.hGetAll(`fuubot:player-${row.PICKER_ID}`);
                let pickCount = memClient.prepare(query2).get(row.PICKER_ID);
                if (!pickCount) {
                    pickCount = { total_count: 0 };
                }
                result.push({ 
                    id: row.PICKER_ID, 
                    n: player.n,
                    con_c: player.con_c,
                    cv: player.cv,
                    gr: player.gr,
                    pt: player.pt,
                    pickCount: pickCount.total_count,
                    pickDate: row.PICK_DATE 
                });
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
        const pageSize = parseInt(req.query.pageSize);
        const dbv = parseInt(req.query.dbv);
        if (isNaN(dbv) || isNaN(pageNo) || isNaN(pageSize) || pageNo < 0 || pageSize <= 0) {
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
            const rows = memClient.prepare(query).all(pageSize, pageNo * pageSize);
            const result = [];
            for (const row of rows) {
                const meta = await redisMeta.hGetAll(`fuubot:beatmap-${row.BEATMAP_ID}`);
                if (meta.t) {
                    let isBlacklisted = blacklist.has(row.BEATMAP_ID);
                    result.push({ ...row, 
                        t: meta.t,
                        a: meta.a,
                        m: meta.m,
                        isBlacklisted: isBlacklisted });
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

    app.get('/api/pickcounts', async (req, res) => {
        const cacheKey = `fuubot:cache-pickcounts`;   
        try {
            if (!isDeletingCache) {
                const cachedResult = await redisCache.get(cacheKey);
                if (cachedResult) {                  
                    res.json(JSON.parse(cachedResult));
                    return;
                }
            }
            const query = getStatQuery();
            const counts = memClient.prepare(query).get();
            if (!isDeletingCache) {
                await redisCache.set(cacheKey, JSON.stringify(counts));
            }        
            res.json(counts);
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

    app.get('/api/limits', async (req, res) => {
        try{
            res.json({
                weeklyLimit: weeklyLimit,
                monthlyLimit: monthlyLimit,
                yearlyLimit: yearlyLimit,
                alltimeLimit: alltimeLimit
            });
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
            const query = getSideboardQuery(type, weeklyLimit, monthlyLimit, yearlyLimit, alltimeLimit);
            if (!query) {
                res.status(400).json({ error: 'Invalid parameters' });
            }
            const rows = memClient.prepare(query).all();
            const result = [];
            for (let i = 0; i < rows.length && result.length < 10; i++) {
                const row = rows[i];
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

    app.get('/api/search/:term/:page', async (req, res) => {
        const term = req.params.term;
        const page = parseInt(req.params.page);
        if (!term) {
            res.status(400).json({ error: 'Query parameter is required' });
            return;
        }
        const cacheKey = `fuubot:cache-search-${term}-${page}`;
        try {
            if (!isDeletingCache) {
                const cachedResult = await redisCache.get(cacheKey);
                if (cachedResult) {
                    res.json(JSON.parse(cachedResult));
                    return;
                }
            }
            const maps = await searchBeatmapIndexes(redisMeta, term, page);
            const beatmapIds = maps.map(map => map.id.split('-')[1]);
            const query = getSearchBeatmapQuery(beatmapIds);
            const counts = memClient.prepare(query).all(beatmapIds);
            const countsMap = Object.fromEntries(counts.map(count => [count.BEATMAP_ID, count]));

            const result = maps.map((map, index) => {
                const beatmapId = beatmapIds[index];
                const countData = countsMap[beatmapId] || {
                    alltime_count: 0,
                    weekly_count: 0,
                    monthly_count: 0,
                    yearly_count: 0,
                };
                return { 
                    BEATMAP_ID: beatmapId,
                    t: map.value.t,
                    a: map.value.a,
                    m: map.value.m,
                    alltime_count: countData.alltime_count,
                    weekly_count: countData.weekly_count,
                    monthly_count: countData.monthly_count,
                    yearly_count: countData.yearly_count,
                };
            });

            if (!isDeletingCache) {
                await redisCache.set(cacheKey, JSON.stringify(result));
            }   
            res.json(result);
        } catch (error) {
            console.error('Error searching titles:', error);
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
    if (input.trim().toLowerCase() === 'update limits') {
        await deleteCache(redisCache);
        setOtherLimits();
        setWeeklyAndAlltimeLimits();
    }
});

