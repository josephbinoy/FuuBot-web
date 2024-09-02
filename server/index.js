import express from "express";
import 'dotenv/config'
import { getFuuBotClient, getMemoryClient, backupFuuBotDb, vacuumBackup, loadFromBackup } from "./utils/dbHelpers.js";
const app = express();

const fuuClient = getFuuBotClient();
const memClient = getMemoryClient();

async function main(){
    await backupFuuBotDb(fuuClient);
    vacuumBackup();
    loadFromBackup(memClient);
    memClient.pragma('journal_mode = WAL');
    
    app.get('/', (req, res) => {
        const result = memClient.prepare('SELECT * FROM PICKS').all();
        res.send(result);
    });
    
    app.listen(3000, () => {
        console.log(`Server running at 3000`);
    });
}

main();

process.on('SIGINT', () => {
    if (memClient) {
        memClient.close();
        console.log('Memory database connection closed.');
    }
    if (fuuClient) {
        fuuClient.close();
        console.log('FuuBot database connection closed.');
    }
    process.exit(0);
});