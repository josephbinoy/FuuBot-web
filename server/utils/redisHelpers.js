import { createClient } from 'redis';
import Database from 'better-sqlite3';
import axios from 'axios';
import logger from './Logger.js';

export async function getRedisCacheClient() {
    const client = createClient({
        url: process.env.REDIS_CACHE_URL
    });
    client.on('error', async err => {
        logger.error('Redis Cache Client Error:', err);
        throw new Error('Redis Cache Client Error', err);
    });
    await client.connect();
    if (client.isReady) {
        logger.info('Redis Cache Client connected successfully');
        return client;
    } else {
        logger.error('Redis Cache Client failed to connect');
    }
}

export async function getRedisMetaClient() {
    const client = createClient({
        url: process.env.REDIS_META_URL
    });
    client.on('error', async err => {
        logger.error('Redis Metadata Client Error:', err);
        throw new Error('Redis Metadata Client Error', err);
    });
    await client.connect();
    if (client.isReady) {
        logger.info('Redis Metadata Client connected successfully');
        return client;
    } else {
        logger.error('Redis Meta Client failed to connect');
    }
}


async function getGuestToken() {
    try {
        const response = await axios.post('https://osu.ppy.sh/oauth/token', {
            grant_type: 'client_credentials',
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            scope: 'public'
        });

        if (response.status == 200 && response.data) {
            logger.info('Fetched guest token.');
            return response.data.access_token;
        } else {
            logger.error(`Error: couldn't get guest token. Received status code ${response.status}`);
        }
    } catch (error) {
        logger.error(`Error couldn't get guest token: ${error.message}`);
    }
}

export async function fetchBeatmapsetMetadata(beatmapsetId, bearerToken) {
    try {
      const url = 'https://osu.ppy.sh/api/v2/beatmapsets/' + beatmapsetId;
  
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
      });
  
      if (response.status == 200) {
          if (response.data) {
              return {
                  a: response.data.artist,
                  t: response.data.title,
                  m: response.data.creator,
              }
          } else {
              return {
                a: 'Missing',
                t: 'Missing',
                m: 'Missing',
              };
          }
      } else {
         logger.info(`Error: Received status code ${response.status}`);
      }
      } catch (error) {
         logger.info(`Error: ${error.message}`);
      }
}

function updateProgressBar(current, total) {
    const barWidth = 50;
    const progress = (current / total) * barWidth;
    const progressBar = '█'.repeat(Math.round(progress)) + ' '.repeat(barWidth - Math.round(progress));
    process.stdout.write(`\r[${progressBar}] ${Math.round((current / total) * 100)}%`);
    if (current === total) {
        process.stdout.write('\n\n');
    }
}

export async function hydrateRedisFromFuuBot(redisClient, rows){
    const bearerToken = await getGuestToken();
    if (!bearerToken) return;
    logger.info('Hydrating Redis with beatmap metadata...');
    let a, t, m;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const beatmapId = Number(row.BEATMAP_ID);
        try {
            if (!(await redisClient.exists(`osubeatmap:${beatmapId}`))) {
                ({ a, t, m } = await fetchBeatmapsetMetadata(beatmapId, bearerToken));
                await redisClient.hSet(`osubeatmap:${beatmapId}`, {
                    t: t,
                    a: a,
                    m: m
                });
                await new Promise(resolve => setTimeout(resolve, 70));
            }
        } catch (error) {
            logger.info(`Error: ${error.message}`);
            return;
        }
    }
    logger.info('Hydration complete');
}

export async function hydrateRedisFromBackup(redisClient){
    const bearerToken = await getGuestToken();
    if (!bearerToken) return;
    const db = new Database(process.env.BACKUP_DB_PATH, { 
        readonly: true,
        fileMustExist: true
     });

    let rows = [];
    try{
        rows = db.prepare('SELECT DISTINCT BEATMAP_ID FROM PICKS;').all();
        logger.info(`Found ${rows.length} unique beatmaps`);
    } catch (error) {
        logger.error(`Error: ${error.message}`);
        return;
    }
    const totalRows = rows.length;
    logger.info('Hydrating Redis with beatmap metadata...');
    let a, t, m;
    for (let i = 0; i < totalRows; i++) {
        const row = rows[i];
        const beatmapId = Number(row.BEATMAP_ID);
        try {
            if (!(await redisClient.exists(`osubeatmap:${beatmapId}`))) {
                ({ a, t, m } = await fetchBeatmapsetMetadata(beatmapId, bearerToken));
                await redisClient.hSet(`osubeatmap:${beatmapId}`, {
                    t: t,
                    a: a,
                    m: m
                });
                await new Promise(resolve => setTimeout(resolve, 70));
            }
        } catch (error) {
            logger.info(`Error: ${error.message}`);
            return;
        }
        // updateProgressBar(i + 1, totalRows);
    }
    logger.info('Hydration complete');
    db.close();
}

export async function deleteCache(redisClient) {
    try {
        const keysToDelete = [];
        for await (const key of redisClient.scanIterator({MATCH: 'fuubot:*', COUNT: 50})) {
            keysToDelete.push(key);
        }
        if (keysToDelete.length === 0) {
            logger.info('Cache already empty');
            return;
        }
        await redisClient.del(keysToDelete);
        logger.info('Successfully deleted cache');
    } catch (error) {
        logger.error('Error deleting cache:', error);
    }
}
