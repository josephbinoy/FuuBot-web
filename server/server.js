import express from "express";
import 'dotenv/config'
import { getMemoryClient, backupFuuBotDb, vacuumBackup, loadFromBackup, updateMemoryDb } from "./utils/dbHelpers.js";
import { getRedisCacheClient, getRedisMetaClient, hydrateRedisFromBackup, hydrateRedis, hydrateRedisFromBlacklist, deleteCache, getGuestToken } from "./utils/redisHelpers.js";
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
let blacklist = [];
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
    switch (period) {
        case 'weekly':
            return `SELECT BEATMAP_ID, COUNT(*) as pick_count 
            FROM PICKS 
            WHERE PICK_DATE > (strftime('%s', 'now') - 7 * 86400) 
            GROUP BY BEATMAP_ID 
            ORDER BY pick_count DESC 
            LIMIT (?) 
            OFFSET (?)`;
        case 'monthly':
            return `SELECT BEATMAP_ID, COUNT(*) as pick_count 
            FROM PICKS 
            WHERE PICK_DATE > (strftime('%s', 'now') - 30 * 86400) 
            GROUP BY BEATMAP_ID 
            ORDER BY pick_count DESC 
            LIMIT (?) 
            OFFSET (?)`;
        case 'yearly':
            return `SELECT BEATMAP_ID, COUNT(*) as pick_count 
            FROM PICKS 
            WHERE PICK_DATE > (strftime('%s', 'now') - 365 * 86400) 
            GROUP BY BEATMAP_ID 
            ORDER BY pick_count DESC 
            LIMIT (?) 
            OFFSET (?)`;
        case 'alltime':
            return `SELECT BEATMAP_ID, COUNT(*) as pick_count 
            FROM PICKS 
            GROUP BY BEATMAP_ID 
            ORDER BY pick_count DESC 
            LIMIT (?) 
            OFFSET (?)`;
        default:
            return null;
    }
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

function getYesterdayLeaderboardQuery(period) {
    const sortColumn = period === 'weekly' ? 'weekly_pick_count' : 'alltime_pick_count';
    
    return `
        SELECT PICKER_ID, 
            SUM(CASE WHEN PICK_DATE < (strftime('%s', 'now', 'start of day', '-1 day')) THEN 1 ELSE 0 END) as alltime_pick_count,
            SUM(CASE WHEN PICK_DATE >= (strftime('%s', 'now', 'start of day', '-8 days')) AND PICK_DATE < (strftime('%s', 'now', 'start of day', '-1 day')) THEN 1 ELSE 0 END) as weekly_pick_count
        FROM PICKS 
        WHERE PICKER_ID != 0
        GROUP BY PICKER_ID 
        ORDER BY ${sortColumn} DESC 
        LIMIT 50`;
}

async function getBlacklist() {
    const data = await fs.readFile(process.env.BLACKLIST_TXT_PATH, 'utf-8');
    const blacklist = data.split('\n')
        .map(line => parseInt(line.trim()))
        .filter(id => !isNaN(id))
        .map(id => ({ beatmapId: id }));
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
            const query = `
                SELECT PICKER_ID, PICK_DATE
                FROM PICKS 
                WHERE BEATMAP_ID = ?
                AND PICK_DATE > (strftime('%s', 'now') - 7 * 86400)
                ORDER BY PICK_DATE DESC
            `;
            const rows = memClient.prepare(query).all(id);
            const history = [];
            const meta = await redisMeta.hGetAll(`fuubot:beatmap-${id}`);
            if (!meta.t) {  
                res.status(404).json({ error: 'Beatmap not found' });
                return;
            }
            for (const row of rows) {
                const player = await redisMeta.hGetAll(`fuubot:player-${row.PICKER_ID}`);
                history.push({ id: row.PICKER_ID, ...player, pickDate: row.PICK_DATE });
            }
            const result = { 
                beatmap: meta, 
                history: history 
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
            for (const row of blacklist) {
                const meta = await redisMeta.hGetAll(`fuubot:beatmap-${row.beatmapId}`);
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
                        country: player.con,
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
});