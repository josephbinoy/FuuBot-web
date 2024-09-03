import express from "express";
import 'dotenv/config'
import { getFuuBotClient, getMemoryClient, backupFuuBotDb, vacuumBackup, loadFromBackup, getNewRows, updateMemoryDb } from "./utils/dbHelpers.js";
import { getRedisClient, hydrateRedisFromBackup, hydrateRedisFromFuuBot } from "./utils/redisHelpers.js";
import logger from "./utils/Logger.js";

const app = express();
const fuuClient = getFuuBotClient();
const memClient = getMemoryClient();
const redisClient = await getRedisClient();
let lastUpdateTimestamp = 0;
async function main(){
    await backupFuuBotDb(fuuClient);
    lastUpdateTimestamp = Math.floor(new Date().getTime() / 1000);
    setInterval(async () => {
        const newRows = await getNewRows(fuuClient, lastUpdateTimestamp);
        lastUpdateTimestamp = Math.floor(new Date().getTime() / 1000);
        updateMemoryDb(memClient, newRows);
        hydrateRedisFromFuuBot(redisClient, newRows);
    }, 3600000);
    vacuumBackup();
    await hydrateRedisFromBackup(redisClient);
    loadFromBackup(memClient);
    memClient.pragma('journal_mode = WAL');
    
    app.get('/weekly', (req, res) => {
        const dbVersion = req.body.dbVersion;
        const pageNo = req.body.pageNo;
        const result = memClient.prepare('SELECT * FROM PICKS').all();
        res.send(result);
    });

    app.get('/monthly', (req, res) => {
        const result = memClient.prepare('SELECT * FROM PICKS').all();
        res.send(result);
    });

    app.get('/yearly', (req, res) => {
        const result = memClient.prepare('SELECT * FROM PICKS').all();
        res.send(result);
    });

    app.get('/alltime', (req, res) => {
        const result = memClient.prepare('SELECT * FROM PICKS').all();
        res.send(result);
    });
    
    app.listen(3000, () => {
        console.log(`Server running on port 3000`);
    });
}

main();

process.on('SIGINT', async () => {
    logger.error('Received SIGINT. Closing connections and exiting...');
    if (memClient) {
        memClient.close();
        console.log('\nMemory database connection closed.');
    }
    if (fuuClient) {
        fuuClient.close();
        console.log('\nFuuBot database connection closed.');
    }
    if (redisClient) {
        await redisClient.quit();
        console.log('\nRedis connection closed.');
    }
    process.exit(0);
});