import Database from "better-sqlite3"
import { sqliteLogger } from "./Logger.js";

export async function backupFuuBotDb(){
    try{
        const fuuClient = new Database(process.env.FUUBOT_DB_PATH, { 
            readonly: true,
            fileMustExist: true
        })
        await fuuClient.backup(process.env.BACKUP_DB_PATH);
        fuuClient.close();
        sqliteLogger.info('Successfully backed up FuuBot DB');
    } catch (error) {
        sqliteLogger.error("Error backing up FuuBot DB", error);
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
            CREATE INDEX IF NOT EXISTS idx_date_beatmap ON PICKS (PICK_DATE, BEATMAP_ID);
            CREATE INDEX IF NOT EXISTS idx_picker_id_pick_date ON PICKS(PICKER_ID, PICK_DATE);
            CREATE INDEX IF NOT EXISTS idx_beatmap_date ON PICKS (BEATMAP_ID, PICK_DATE);
            ATTACH DATABASE '${process.env.BACKUP_DB_PATH}' AS back;
            INSERT INTO main.PICKS SELECT * FROM back.PICKS;
            DETACH DATABASE back;
        `);
        sqliteLogger.info('Successfully loaded FuuBot DB to memory');
    } catch (error) {
        sqliteLogger.error("Error loading FuuBot DB to memory", error);
    }
}

export function getMemoryClient(){
    return new Database(':memory:');
}

export function vacuumBackup(){
    const backupClient = new Database(process.env.BACKUP_DB_PATH);
    try{
        backupClient.exec('VACUUM;');
        sqliteLogger.info('Successfully vacuumed backup DB');
    } catch (error) {
        sqliteLogger.error("Error vacuuming backup DB", error);
    }
    backupClient.close();
}

export function updateMemoryDb(memClient, newRows){
    try{
        const insert = memClient.prepare(`
            INSERT INTO PICKS (BEATMAP_ID, PICKER_ID, PICK_DATE) 
            VALUES (@beatmapId, @pickerId, @pickDate)
            ON CONFLICT(BEATMAP_ID, PICKER_ID) DO UPDATE SET PICK_DATE = excluded.PICK_DATE;
        `);
        for (const row of newRows) {
            insert.run(row);
        }
        sqliteLogger.info('Successfully updated memory DB');
    } catch (error) {
        sqliteLogger.error("Error updating memory DB", error);
    }
}