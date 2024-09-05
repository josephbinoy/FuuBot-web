import express from "express";
import 'dotenv/config'
import { getFuuBotClient, getMemoryClient, backupFuuBotDb, vacuumBackup, loadFromBackup, getNewRows, updateMemoryDb } from "./utils/dbHelpers.js";
import { getRedisCacheClient, getRedisMetaClient, hydrateRedisFromBackup, hydrateRedisFromFuuBot, deleteCache } from "./utils/redisHelpers.js";
import logger from "./utils/Logger.js";
import { addCleanupListener } from "async-cleanup";

const app = express();
const fuuClient = getFuuBotClient();
const memClient = getMemoryClient();
const redisMeta = await getRedisMetaClient();
const redisCache = await getRedisCacheClient();
let lastUpdateTimestamp = 0;
let isDeletingCache = false;

async function updateAndHydrate() {
    const newRows = await getNewRows(fuuClient, lastUpdateTimestamp);
    updateMemoryDb(memClient, newRows);
    lastUpdateTimestamp = Math.floor(new Date().getTime() / 1000);
    isDeletingCache = true;
    await deleteCache(redisCache);
    isDeletingCache = false;
    hydrateRedisFromFuuBot(redisMeta, newRows);
}

function getQuery(period) {
    switch (period) {
        case 'weekly':
            return `SELECT BEATMAP_ID, COUNT(BEATMAP_ID) as pick_count 
            FROM PICKS 
            WHERE PICK_DATE > (strftime('%s', 'now') - 7 * 86400) 
            GROUP BY BEATMAP_ID 
            ORDER BY pick_count DESC 
            LIMIT (?) 
            OFFSET (?)`;
        case 'monthly':
            return `SELECT BEATMAP_ID, COUNT(BEATMAP_ID) as pick_count 
            FROM PICKS 
            WHERE PICK_DATE > (strftime('%s', 'now') - 30 * 86400) 
            GROUP BY BEATMAP_ID 
            ORDER BY pick_count DESC 
            LIMIT (?) 
            OFFSET (?)`;
        case 'yearly':
            return `SELECT BEATMAP_ID, COUNT(BEATMAP_ID) as pick_count 
            FROM PICKS 
            WHERE PICK_DATE > (strftime('%s', 'now') - 365 * 86400) 
            GROUP BY BEATMAP_ID 
            ORDER BY pick_count DESC 
            LIMIT (?) 
            OFFSET (?)`;
        case 'alltime':
            return `SELECT BEATMAP_ID, COUNT(BEATMAP_ID) as pick_count 
            FROM PICKS 
            GROUP BY BEATMAP_ID 
            ORDER BY pick_count DESC 
            LIMIT (?) 
            OFFSET (?)`;
        default:
            return null;
    }
}

async function main(){
    await backupFuuBotDb(fuuClient);
    lastUpdateTimestamp = Math.floor(new Date().getTime() / 1000);
    setInterval(updateAndHydrate, 3600000);
    vacuumBackup();
    await deleteCache(redisCache);
    await hydrateRedisFromBackup(redisMeta);
    loadFromBackup(memClient);
    memClient.pragma('journal_mode = WAL');

    app.get('/api/stats', (req, res) => {
        res.json({ dbv: lastUpdateTimestamp });
    });

    app.get('/api/:period', async (req, res) => {
        const { period } = req.params;
        const pageNo = parseInt(req.query.pageNo) || 0;
        const dbv = parseInt(req.query.dbv) || -1;
        if (dbv !=-1 && dbv != lastUpdateTimestamp) {
            res.status(409).json({ error: 'dbv mismatch' });
            return;
        }
        const cacheKey = `fuubot:${period}-${pageNo}`;   
        try {
            if (!isDeletingCache) {
                const cachedResult = await redisCache.get(cacheKey);
                if (cachedResult) {
                    res.json(JSON.parse(cachedResult));
                    return;
                }
            }
            const query = getQuery(period);
            if (!query) {
                return;
            }
            const rows = memClient.prepare(query).all(10, pageNo * 10);
            const result = [];
            for (const row of rows) {
                const meta = await redisMeta.hGetAll(`osubeatmap:${row.BEATMAP_ID}`);
                if (meta) {
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

    if (fuuClient) {
        fuuClient.close();
        logger.info('FuuBot database connection closed.');
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