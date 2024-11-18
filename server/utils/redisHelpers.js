import { createClient, SchemaFieldTypes } from 'redis';
import Database from 'better-sqlite3';
import axios from 'axios';
import { redisLogger } from './Logger.js';

const beatmapDeleteList = [];

export async function getRedisCacheClient() {
    const client = createClient({
        url: process.env.REDIS_CACHE_URL
    });
    client.on('error', async err => {
        redisLogger.error('Redis Cache Client Error:', err);
        throw new Error('Redis Cache Client Error', err);
    });
    await client.connect();
    if (client.isReady) {
        redisLogger.info('Redis Cache Client connected successfully');
        return client;
    } else {
        redisLogger.error('Redis Cache Client failed to connect');
    }
}

export async function getRedisMetaClient() {
    const client = createClient({
        url: process.env.REDIS_META_URL
    });
    client.on('error', async err => {
        redisLogger.error('Redis Metadata Client Error:', err);
        throw new Error('Redis Metadata Client Error', err);
    });
    await client.connect();
    if (client.isReady) {
        redisLogger.info('Redis Metadata Client connected successfully');
        return client;
    } else {
        redisLogger.error('Redis Meta Client failed to connect');
    }
}


export async function getGuestToken() {
    try {
        const response = await axios.post('https://osu.ppy.sh/oauth/token', {
            grant_type: 'client_credentials',
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            scope: 'public'
        });

        if (response.status == 200 && response.data) {
            redisLogger.info('Fetched guest token.');
            return response.data.access_token;
        } else {
            redisLogger.error(`Error: couldn't get guest token. Received status code ${response.status}`);
        }
    } catch (error) {
        redisLogger.error(`Error couldn't get guest token: ${error.message}`);
    }
}

async function fetchPlayerData(playerIds, bearerToken) {
    let result=[];
    try {
        const url = 'https://osu.ppy.sh/api/v2/users?' + playerIds.map(id => `ids[]=${id}`).join('&');
    
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
          },
        });
    
        const players = response.data;
        if (response.status == 200) {
            if (players.users) {
                for (let i = 0; i < players.users.length; i++) {
                    result.push({
                        id: players.users[i].id,
                        n: players.users[i].username,
                        cv: players.users[i].cover.url,
                        con_c: players.users[i].country.code,
                        con_n: players.users[i].country.name,
                        sp: players.users[i].is_supporter,
                        gr: players.users[i].statistics_rulesets.osu.global_rank,
                        pp: players.users[i].statistics_rulesets.osu.pp,
                        acc: players.users[i].statistics_rulesets.osu.hit_accuracy,
                        pc: players.users[i].statistics_rulesets.osu.play_count,
                        pt: players.users[i].statistics_rulesets.osu.play_time,
                    });
                }
            }
        } else {
            redisLogger.error(`Error: Received status code ${response.status}`);
        }
    } catch (error) {
        redisLogger.error(`Error while fetching player data: ${error.message}`);
    }
    return result;
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
                  mid: response.data.user.id,
                  fc: response.data.favourite_count,
                  pc: response.data.play_count,
                  s: response.data.status,
                  sdate:response.data.submitted_date
              }
          }
      } else {
         redisLogger.error(`Error: Received status code ${response.status}`);
      }
      } catch (error) {
         if (error.response && error.response.status === 404) {
            redisLogger.error(`Error: Beatmapset ${beatmapsetId} does not exist. Queueing for deletion...`);
            beatmapDeleteList.push(beatmapsetId);
         }
      }
}

export async function hydrateRedis(redisClient, bearerToken, rows){
    if (!bearerToken) return;
    redisLogger.info('Hydrating Redis with beatmap metadata from new rows...');
    const newPlayerIds = new Set();
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const beatmapId = Number(row.beatmapId);
        const pickerId = Number(row.pickerId);
        newPlayerIds.add(pickerId);
        try {
            if (!(await redisClient.exists(`fuubot:beatmap-${beatmapId}`))) {
                const metadata = await fetchBeatmapsetMetadata(beatmapId, bearerToken);
                if (!metadata){
                    redisLogger.error(`Error hydrating beatmap ${beatmapId}`);
                    continue;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
                await redisClient.hSet(`fuubot:beatmap-${beatmapId}`, {
                    t: metadata.t,
                    a: metadata.a,
                    m: metadata.m,
                    mid: metadata.mid,
                    fc: metadata.fc,
                    pc: metadata.pc,
                    s: metadata.s,
                    sdate: metadata.sdate
                });
            }
        } catch (error) {
            redisLogger.error(`Error hydrating beatmap ${beatmapId}: ${error.message}`);
        }
    }
    deleteNotFoundBeatmaps();
    redisLogger.info('Hydrating Redis with player data from new rows...');
    const playerBuffer = [];
    const apiLimit = 30;
    for (const playerId of newPlayerIds) {
        if(playerId != 0) {
            if (!(await redisClient.exists(`fuubot:player-${playerId}`)))
                playerBuffer.push(playerId);
        }
        if (playerBuffer.length === apiLimit) {
            try {
                const players = await fetchPlayerData(playerBuffer, bearerToken);
                if (!players){
                    redisLogger.error(`Error hydrating players: ${players}`);
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, 1500));
                for (let j = 0; j < players.length; j++) {
                    const player = players[j];
                    if (!player.n) continue;
                    await redisClient.hSet(`fuubot:player-${player.id}`, {
                        n: player.n,
                        cv: player.cv,
                        con_c: player.con_c,
                        con_n: player.con_n,
                        sp: player.sp.toString(),
                        gr: player.gr,
                        pp: player.pp,
                        acc: player.acc,
                        pc: player.pc,
                        pt: player.pt
                    });
                }
            } catch (error) {
                redisLogger.error(`Error hydrating players: ${error.message}`);
            }
            playerBuffer.length = 0;
        }
    }
    if (playerBuffer.length > 0) {
        try {
            const players = await fetchPlayerData(playerBuffer, bearerToken);
            if (!players){
                redisLogger.error(`Error hydrating players: ${players}`);
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            for (let j = 0; j < players.length; j++) {
                const player = players[j];
                if (!player.n) continue;
                await redisClient.hSet(`fuubot:player-${player.id}`, {
                    n: player.n,
                    cv: player.cv,
                    con_c: player.con_c,
                    con_n: player.con_n,
                    sp: player.sp.toString(),
                    gr: player.gr,
                    pp: player.pp,
                    acc: player.acc,
                    pc: player.pc,
                    pt: player.pt
                });
            }
        } catch (error) {
            redisLogger.error(`Error hydrating remaining players: ${error.message}`);
        }
    }
}

export async function hydrateRedisFromBlacklist(redisClient, bearerToken, blacklist){
    if (!bearerToken) return;
    redisLogger.info('Hydrating Redis with beatmap metadata from blacklist...');
    for (const beatmapId of blacklist) {
        try {
            if (!(await redisClient.exists(`fuubot:beatmap-${beatmapId}`))) {
                const metadata = await fetchBeatmapsetMetadata(beatmapId, bearerToken);
                if (!metadata){
                    redisLogger.error(`Error hydrating beatmap ${beatmapId}`);
                    continue;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
                await redisClient.hSet(`fuubot:beatmap-${beatmapId}`, {
                    t: metadata.t,
                    a: metadata.a,
                    m: metadata.m,
                    mid: metadata.mid,
                    fc: metadata.fc,
                    pc: metadata.pc,
                    s: metadata.s,
                    sdate: metadata.sdate
                });
            }
        } catch (error) {
            redisLogger.error(`Error hydrating beatmap ${beatmapId}: ${error.message}`);
        }
    }
    deleteNotFoundBeatmaps();
}

export async function hydrateRedisFromBackup(redisClient, bearerToken){
    if (!bearerToken) return;
    const db = new Database(process.env.BACKUP_DB_PATH, { 
        readonly: true,
        fileMustExist: true
     });

    let rows = [];

    try {
        rows = db.prepare('SELECT DISTINCT BEATMAP_ID FROM PICKS;').all();
        redisLogger.info(`Found ${rows.length} unique beatmaps`);
    } catch (error) {
        redisLogger.error(`Error fetching beatmap IDs: ${error.message}`);
        return;
    }

    let totalRows = rows.length;
    redisLogger.info('Hydrating Redis with beatmap metadata from backup DB...');
    for (let i = 0; i < totalRows; i++) {
        const row = rows[i];
        const beatmapId = Number(row.BEATMAP_ID);
        try {
            if (!(await redisClient.exists(`fuubot:beatmap-${beatmapId}`))) {
                const metadata = await fetchBeatmapsetMetadata(beatmapId, bearerToken);
                if (!metadata){
                    redisLogger.error(`Error hydrating beatmap ${beatmapId}`);
                    continue;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
                await redisClient.hSet(`fuubot:beatmap-${beatmapId}`, {
                    t: metadata.t,
                    a: metadata.a,
                    m: metadata.m,
                    mid: metadata.mid,
                    fc: metadata.fc,
                    pc: metadata.pc,
                    s: metadata.s,
                    sdate: metadata.sdate
                });
            }
        } catch (error) {
            redisLogger.error(`Error hydrating beatmap ${beatmapId}: ${error.message}`);
        }
        if (i % Math.ceil(totalRows / 10) === 0) {
            redisLogger.info(`${Math.floor((i / totalRows) * 100)}% complete...`);
        }
    }
    redisLogger.info('100% complete...');
    deleteNotFoundBeatmaps();
    try {
        rows = db.prepare('SELECT DISTINCT PICKER_ID FROM PICKS;').all();
        redisLogger.info(`Found ${rows.length} unique players`);
    } catch (error) {
        redisLogger.error(`Error fetching player IDs: ${error.message}`);
        return;
    }

    totalRows = rows.length;
    redisLogger.info('Hydrating Redis with player data from backup DB...');
    const playerBuffer = [];
    const apiLimit = 30;
    for (let i = 0; i < totalRows; i++) {
        const pickerId = Number(rows[i].PICKER_ID);
        if (pickerId != 0) {
            if (!(await redisClient.exists(`fuubot:player-${pickerId}`))) {
                playerBuffer.push(pickerId);
            }
        }
        if (playerBuffer.length === apiLimit) {
            try {
                const players = await fetchPlayerData(playerBuffer, bearerToken);
                if (!players){
                    redisLogger.error(`Error hydrating players: ${players}`);
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, 1500));
                for (let j = 0; j < players.length; j++) {
                    const player = players[j];
                    if (!player.n) continue;
                    await redisClient.hSet(`fuubot:player-${player.id}`, {
                        n: player.n,
                        cv: player.cv,
                        con_c: player.con_c,
                        con_n: player.con_n,
                        sp: player.sp.toString(),
                        gr: player.gr,
                        pp: player.pp,
                        acc: player.acc,
                        pc: player.pc,
                        pt: player.pt
                    });
                }
            } catch (error) {
                redisLogger.error(`Error hydrating players: ${error.message}`);
            }
            playerBuffer.length = 0;
        }
        if (i % Math.ceil(totalRows / 10) === 0) {
            redisLogger.info(`${Math.floor((i / totalRows) * 100)}% complete...`);
        }
    }
    if (playerBuffer.length > 0) {
        try {
            const players = await fetchPlayerData(playerBuffer, bearerToken);
            if (!players){
                redisLogger.error(`Error hydrating players: ${players}`);
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            for (let j = 0; j < players.length; j++) {
                const player = players[j];
                if (!player.n) continue;
                await redisClient.hSet(`fuubot:player-${player.id}`, {
                    n: player.n,
                    cv: player.cv,
                    con_c: player.con_c,
                    con_n: player.con_n,
                    sp: player.sp.toString(),
                    gr: player.gr,
                    pp: player.pp,
                    acc: player.acc,
                    pc: player.pc,
                    pt: player.pt
                });
            }
        } catch (error) {
            redisLogger.error(`Error hydrating remaining players: ${error.message}`);
        }
    }
    redisLogger.info('100% complete...');
    redisLogger.info('Hydration complete');
    db.close();
}

export async function deleteCache(redisClient) {
    try {
        const keysToDelete = [];
        for await (const key of redisClient.scanIterator({MATCH: 'fuubot:cache-*', COUNT: 50})) {
            keysToDelete.push(key);
        }
        if (keysToDelete.length === 0) {
            redisLogger.info('Cache already empty');
            return;
        }
        await redisClient.del(keysToDelete);
        redisLogger.info('Successfully deleted cache');
    } catch (error) {
        redisLogger.error('Error deleting cache:', error);
    }
}


export async function refreshPlayerData(redisClient, sqlClient){
    const bearerToken = await getGuestToken();
    if (!bearerToken) {
        redisLogger.error('Error fetching guest token');
        return;
    }
    redisLogger.info('Refreshing player data...');
    let rows = [];
    try {
        rows = sqlClient.prepare('SELECT DISTINCT PICKER_ID FROM PICKS;').all();
        redisLogger.info(`Found ${rows.length} unique players`);
    } catch (error) {
        redisLogger.error(`Error fetching player IDs: ${error.message}`);
        return;
    }

    const totalRows = rows.length;
    redisLogger.info('Hydrating Redis with player data...');
    const playerBuffer = [];
    const apiLimit = 30;
    for (let i = 0; i < totalRows; i++) {
        const pickerId = Number(rows[i].PICKER_ID);
        if (pickerId != 0) {
            playerBuffer.push(pickerId);
        }
        if (playerBuffer.length === apiLimit) {
            try {
                const players = await fetchPlayerData(playerBuffer, bearerToken);
                if (!players){
                    redisLogger.error(`Error hydrating players: ${players}`);
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, 1500));
                for (let j = 0; j < players.length; j++) {
                    const player = players[j];
                    if (!player.n) continue;
                    await redisClient.hSet(`fuubot:player-${player.id}`, {
                        n: player.n,
                        cv: player.cv,
                        con_c: player.con_c,
                        con_n: player.con_n,
                        sp: player.sp.toString(),
                        gr: player.gr,
                        pp: player.pp,
                        acc: player.acc,
                        pc: player.pc,
                        pt: player.pt
                    });
                }
            } catch (error) {
                redisLogger.error(`Error hydrating players: ${error.message}`);
            }
            playerBuffer.length = 0;
        }
        if (i % Math.ceil(totalRows / 10) === 0) {
            redisLogger.info(`${Math.floor((i / totalRows) * 100)}% complete...`);
        }
    }
    if (playerBuffer.length > 0) {
        try {
            const players = await fetchPlayerData(playerBuffer, bearerToken);
            if (!players){
                redisLogger.error(`Error hydrating players: ${players}`);
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            for (let j = 0; j < players.length; j++) {
                const player = players[j];
                if (!player.n) continue;
                await redisClient.hSet(`fuubot:player-${player.id}`, {
                    n: player.n,
                    cv: player.cv,
                    con_c: player.con_c,
                    con_n: player.con_n,
                    sp: player.sp.toString(),
                    gr: player.gr,
                    pp: player.pp,
                    acc: player.acc,
                    pc: player.pc,
                    pt: player.pt
                });
            }
        } catch (error) {
            redisLogger.error(`Error hydrating remaining players: ${error.message}`);
        }
    }
    redisLogger.info('100% complete...');
    redisLogger.info('Player data refresh complete');
}

export async function createBeatmapIndexes(redisClient) {
    try{
        // await redisClient.ft.dropIndex('fuubot:idx-beatmap');
        // redisLogger.info('Dropped old indexes');
        await redisClient.ft.create('fuubot:idx-beatmap', {
            t: {
              type: SchemaFieldTypes.TEXT,
              WEIGHT: 4,
              WITHSUFFIXTRIE: true
            //   SORTABLE: true (sorting needs to be added in future to make limit deterministic (not returning duplicates))
            },
            a: {
                type: SchemaFieldTypes.TEXT,
                NOSTEM: true,
                WEIGHT: 2,
                WITHSUFFIXTRIE: true
            },
            m: {
                type: SchemaFieldTypes.TEXT,
                NOSTEM: true,
                WEIGHT: 1,
                WITHSUFFIXTRIE: true
            }   
          }, {
            ON: 'HASH',
            PREFIX: 'fuubot:beatmap-'
            // NOHL: true
          });
        redisLogger.info('Search indexes created successfully');
    } catch (error) {
        if (error.message === 'Index already exists')
            redisLogger.info('Search Indexes exist already, skipped creation');
        else
            redisLogger.error('Errow while creating search indexes', error);
    }
}

export async function searchBeatmapIndexes(redisClient, searchTerm, offset) {
    if (!searchTerm) {
        return [];
    }
    // if (searchField !== 't' && searchField !== 'a' && searchField !== 'm') {
    //     return [];
    // }

    let terms = searchTerm.split(' ');
    terms = terms.map(term => term.length > 2 ? `*${term}*` : term);
    searchTerm = terms.join(' ');
    try {
        // const query = `@${searchField}: ${searchTerm}`;
        const result = await redisClient.ft.search(
            'fuubot:idx-beatmap', 
            searchTerm,
            { 
                LIMIT: 
                { 
                    from: offset*10, 
                    size: 10 
                },
                RETURN: ['t', 'a', 'm'],
                SLOP: 5
            });
        if (result.total === 0) {
            return [];
        }
        else
            return result.documents;
    } catch (error) {
        redisLogger.error('Error searching indexes:', error);
        return [];
    }
}

export function deleteNotFoundBeatmaps() {
    if (beatmapDeleteList.length === 0) {
        return;
    }
    try {
        const fuuClient = new Database(process.env.FUUBOT_DB_PATH, { 
            fileMustExist: true
        });
        const placeholders = beatmapDeleteList.map(() => '?').join(',');
        const deleteStmt = fuuClient.prepare(`DELETE FROM PICKS WHERE BEATMAP_ID IN (${placeholders})`);
        deleteStmt.run(...beatmapDeleteList);
        fuuClient.close();
        redisLogger(`Successfully deleted ${beatmapDeleteList.length} maps`);
        beatmapDeleteList.length = 0;
    } catch (error) {
        redisLogger('Error deleting maps:', error);
    }
}