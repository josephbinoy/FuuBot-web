import Database from "better-sqlite3"
import logger from "./Logger.js"

export function getFuuBotClient(){
    let fuubotDbClient;
    try {
        fuubotDbClient = new Database(process.env.FUUBOT_DB_PATH, { 
            readonly: true,
            fileMustExist: true
        })
        logger.info('Successfully connected to FuuBot DB');
        
    } catch (error) {
        logger.error("Error connecting to FuuBot DB", error)
    }
    return fuubotDbClient;
}

export async function backupFuuBotDb(fuuClient){
    try{
        await fuuClient.backup(process.env.BACKUP_DB_PATH);
        logger.info('Successfully backed up FuuBot DB');

    } catch (error) {
        logger.error("Error backing up or vacuuming FuuBot DB", error);
    }
}

export function loadFromBackup(memClient){
    try{
        memClient.exec(`
            CREATE TABLE IF NOT EXISTS PICKS (
                BEATMAP_ID INTEGER,
                PICKER_ID INTEGER,
                PICK_DATE INTEGER,
                PRIMARY KEY (BEATMAP_ID, PICKER_ID)
            );
            CREATE INDEX IF NOT EXISTS idx_beatmap_id ON PICKS (BEATMAP_ID);
            CREATE INDEX IF NOT EXISTS idx_pick_date ON PICKS (PICK_DATE);
            CREATE INDEX IF NOT EXISTS idx_date_beatmap ON PICKS (PICK_DATE, BEATMAP_ID);
            ATTACH DATABASE 'backup.db' AS back;
            INSERT INTO main.PICKS SELECT * FROM back.PICKS;
            DETACH DATABASE back;
        `);
        logger.info('Successfully loaded FuuBot DB to memory');
    } catch (error) {
        logger.error("Error loading FuuBot DB to memory", error);
    }
}

export function getMemoryClient(){
    return new Database(':memory:');
}

export function vacuumBackup(){
    const backupClient = new Database('backup.db');
    try{
        backupClient.exec('VACUUM;');
        logger.info('Successfully vacuumed backup DB');
    } catch (error) {
        logger.error("Error vacuuming backup DB", error);
    }
    backupClient.close();
}

export async function getNewRows(fuuClient, lastUpdateTimestamp){
    try{
        const newRows = fuuClient.prepare(`
            SELECT * FROM PICKS
            WHERE PICK_DATE > ${lastUpdateTimestamp};
        `).all();
        logger.info(`Found ${newRows.length} new rows in FuuBot DB`);
        return newRows;
    } catch (error) {
        logger.error("Error fetchng new rows from FuuBot DB", error);
    }
}

export async function updateMemoryDb(memClient, newRows){
    try{
        const insert = memClient.prepare(`
            INSERT INTO PICKS (BEATMAP_ID, PICKER_ID, PICK_DATE) 
            VALUES (@BEATMAP_ID, @PICKER_ID, @PICK_DATE)
            ON CONFLICT(BEATMAP_ID, PICKER_ID) DO UPDATE SET PICK_DATE = excluded.PICK_DATE;
        `);
        for (const row of newRows) {
            insert.run(row);
        }
        logger.info('Successfully updated memory DB');
    } catch (error) {
        logger.error("Error updating memory DB", error);
    }
}