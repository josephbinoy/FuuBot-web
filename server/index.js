import express from "express";
import 'dotenv/config'
import { getFuuBotClient, getMemoryClient, backupFuuBotDb, loadFromBackup } from "./utils/dbHelpers.js";
const app = express();

// Initialize the databases
const fuuClient = getFuuBotClient();
const memClient = getMemoryClient();
await backupFuuBotDb(fuuClient);
loadFromBackup(memClient);
memClient.pragma('journal_mode = WAL');

app.get('/', (req, res) => {
    const result = memClient.prepare('SELECT * FROM PICKS').all();
    res.send(result);
});

app.listen(3000, () => {
    console.log(`Server running at 3000`);
});

// Handle ctrl+c abrupt shutdown
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