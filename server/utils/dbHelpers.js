import Database from "better-sqlite3"

export function getFuuBotClient(){
    let fuubotDbClient;
    try {
        fuubotDbClient = new Database(process.env.FUUBOT_DB_PATH, { 
            readonly: true,
            fileMustExist: true
        })
        console.log('Successfully connected to FuuBot DB');
        
    } catch (error) {
        console.error("Error connecting to FuuBot DB", error)
    }
    return fuubotDbClient;
}

export async function backupFuuBotDb(fuuClient){
    try{
        await fuuClient.backup('backup.db');
        console.log('Successfully backed up FuuBot DB');
    } catch (error) {
        console.error("Error backing up FuuBot DB", error);
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
            ATTACH DATABASE 'backup.db' AS fuudb;
            BEGIN;
            INSERT INTO main.PICKS SELECT * FROM fuudb.PICKS;
            COMMIT;
            DETACH DATABASE fuudb;
        `);
        console.log('Successfully loaded FuuBot DB to memory');
    } catch (error) {
        console.error("Error loading FuuBot DB to memory", error);
    }
}

export function getMemoryClient(){
    return new Database(':memory:');
}