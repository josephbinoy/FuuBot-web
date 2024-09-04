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

async function updateAndHydrate() {
    const newRows = await getNewRows(fuuClient, lastUpdateTimestamp);
    updateMemoryDb(memClient, newRows);
    lastUpdateTimestamp = Math.floor(new Date().getTime() / 1000);
    await deleteCache(redisCache);
    hydrateRedisFromFuuBot(redisMeta, newRows);
}

async function main(){
    await backupFuuBotDb(fuuClient);
    lastUpdateTimestamp = Math.floor(new Date().getTime() / 1000);
    setInterval(updateAndHydrate, 3600000);
    vacuumBackup();
    await deleteCache(redisCache);
    logger.info('Deleted redis cache');
    await hydrateRedisFromBackup(redisMeta);
    loadFromBackup(memClient);
    memClient.pragma('journal_mode = WAL');

    app.get('/api/weekly', async (req, res) => {
        const pageNo = parseInt(req.query.pageNo) || 0;
        const dbv = parseInt(req.query.dbv) || -1;
        if (dbv !=-1 && dbv != lastUpdateTimestamp) {
            res.status(409).json({ error: 'dbv mismatch' });
            return;
        }
        const cacheKey = `fuubot:weekly-${pageNo}`;    
        try {
            const cachedResult = await redisCache.get(cacheKey);
            if (cachedResult) {
                res.json(JSON.parse(cachedResult));      
                return;
            }
        
            const rows = memClient.prepare(`
                SELECT BEATMAP_ID, COUNT(BEATMAP_ID) as pick_count 
                FROM PICKS 
                WHERE PICK_DATE > (strftime('%s', 'now') - 7 * 86400) 
                GROUP BY BEATMAP_ID 
                ORDER BY pick_count DESC 
                LIMIT (?) 
                OFFSET (?)
            `).all(10, pageNo * 10);
        
            const result = [];
            for (const row of rows) {
                const meta = await redisMeta.hGetAll(`${row.BEATMAP_ID}`);
                if (meta) {
                    result.push({ ...row, ...meta });
                }
            }

            if (result.length === 0) { 
                res.status(404).json({ error: 'No data found' });          
            }
            else{
                await redisCache.set(cacheKey, JSON.stringify({ dbv: lastUpdateTimestamp, data: result }));
                res.json({ dbv: lastUpdateTimestamp, data: result });
            }
        } catch (error) {
            logger.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/api/monthly', async (req, res) => {
        const pageNo = parseInt(req.query.pageNo) || 0;
        const dbv = parseInt(req.query.dbv) || -1;
        if (dbv !=-1 && dbv != lastUpdateTimestamp) {
            res.status(409).json({ error: 'dbv mismatch' });
            return;
        }
        const cacheKey = `fuubot:monthly-${pageNo}`;    
        try {
            const cachedResult = await redisCache.get(cacheKey);
            if (cachedResult) {
                res.json(JSON.parse(cachedResult));
                return;
            }

            const rows = memClient.prepare(`
                SELECT BEATMAP_ID, COUNT(BEATMAP_ID) as pick_count 
                FROM PICKS 
                WHERE PICK_DATE > (strftime('%s', 'now') - 30 * 86400) 
                GROUP BY BEATMAP_ID 
                ORDER BY pick_count DESC 
                LIMIT (?) 
                OFFSET (?)
            `).all(10, pageNo * 10);
        
            const result = [];
            for (const row of rows) {
                const meta = await redisMeta.hGetAll(`${row.BEATMAP_ID}`);
                if (meta) {
                    result.push({ ...row, ...meta });
                }
            }       

            if (result.length === 0) {  
                res.status(404).json({ error: 'No data found' });        
            }
            else{
                await redisCache.set(cacheKey, JSON.stringify({ dbv: lastUpdateTimestamp, data: result }));
                res.json({ dbv: lastUpdateTimestamp, data: result });
            }
        } catch (error) {
            logger.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/api/yearly', async (req, res) => {
        const pageNo = parseInt(req.query.pageNo) || 0;
        const dbv = parseInt(req.query.dbv) || -1;
        if (dbv !=-1 && dbv != lastUpdateTimestamp) {
            res.status(409).json({ error: 'dbv mismatch' });
            return;
        }
        const cacheKey = `fuubot:yearly-${pageNo}`;    
        try {
            const cachedResult = await redisCache.get(cacheKey);
            if (cachedResult) {
                res.json(JSON.parse(cachedResult));
                return;
            }
        
            const rows = memClient.prepare(`
                SELECT BEATMAP_ID, COUNT(BEATMAP_ID) as pick_count 
                FROM PICKS 
                WHERE PICK_DATE > (strftime('%s', 'now') - 365 * 86400) 
                GROUP BY BEATMAP_ID 
                ORDER BY pick_count DESC 
                LIMIT (?) 
                OFFSET (?)
            `).all(10, pageNo * 10);
        
            const result = [];
            for (const row of rows) {
                const meta = await redisMeta.hGetAll(`${row.BEATMAP_ID}`);
                if (meta) {
                    result.push({ ...row, ...meta });
                }
            } 

            if (result.length === 0) {   
                res.status(404).json({ error: 'No data found' });         
            }
            else{
                await redisCache.set(cacheKey, JSON.stringify({ dbv: lastUpdateTimestamp, data: result }));
                res.json({ dbv: lastUpdateTimestamp, data: result });
            }
        } catch (error) {
            logger.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/api/alltime', async (req, res) => {
        const pageNo = parseInt(req.query.pageNo) || 0;
        const dbv = parseInt(req.query.dbv) || -1;
        if (dbv !=-1 && dbv != lastUpdateTimestamp) {
            res.status(409).json({ error: 'dbv mismatch' });
            return;
        }
        const cacheKey = `fuubot:alltime-${pageNo}`;    
        try {
            const cachedResult = await redisCache.get(cacheKey);
            if (cachedResult) {
                res.json(JSON.parse(cachedResult));
                return;
            }
        
            const rows = memClient.prepare(`
                SELECT BEATMAP_ID, COUNT(BEATMAP_ID) as pick_count 
                FROM PICKS 
                GROUP BY BEATMAP_ID 
                ORDER BY pick_count DESC 
                LIMIT (?) 
                OFFSET (?)
            `).all(10, pageNo * 10);
        
            const result = [];
            for (const row of rows) {
                const meta = await redisMeta.hGetAll(`${row.BEATMAP_ID}`);
                if (meta) {
                    result.push({ ...row, ...meta });
                }
            }       

            if (result.length === 0) {  
                res.status(404).json({ error: 'No data found' });         
            }
            else{
                await redisCache.set(cacheKey, JSON.stringify({ dbv: lastUpdateTimestamp, data: result }));
                res.json({ dbv: lastUpdateTimestamp, data: result });
            }
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