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

export function getYesterdayLeaderboardQuery(period) {
    const sortColumn = period === 'weekly' ? 'weekly_pick_count' : 'alltime_pick_count';
    
    return `
        SELECT PICKER_ID, 
            SUM(CASE WHEN PICK_DATE < (strftime('%s', 'now', 'start of day', '-1 day', 'utc')) THEN 1 ELSE 0 END) as alltime_pick_count,
            SUM(CASE WHEN PICK_DATE >= (strftime('%s', 'now', 'start of day', '-8 days', 'utc')) AND PICK_DATE < (strftime('%s', 'now', 'start of day', '-1 day', 'utc')) THEN 1 ELSE 0 END) as weekly_pick_count
        FROM PICKS 
        WHERE PICKER_ID != 0
        GROUP BY PICKER_ID 
        ORDER BY ${sortColumn} DESC 
        LIMIT 50`;
}

export function getStatQuery(){
    return `
    SELECT COUNT(*) as alltime_count,
    SUM (CASE WHEN PICK_DATE > (strftime('%s', 'now') - 7 * 86400) THEN 1 ELSE 0 END) as weekly_count,
    SUM (CASE WHEN PICK_DATE > (strftime('%s', 'now') - 30 * 86400) THEN 1 ELSE 0 END) as monthly_count,
    SUM (CASE WHEN PICK_DATE > (strftime('%s', 'now') - 365 * 86400) THEN 1 ELSE 0 END) as yearly_count
    FROM PICKS;`
}

export function getSideboardQuery(type, weekly, monthly, yearly, alltime) {
    if (type !== 'unique' && type !== 'overplayed') {
        return null;
    }
    
    if(type === 'unique'){
        return `
        SELECT PICKER_ID, COUNT(*) as PICK_COUNT
        FROM PICKS
        WHERE BEATMAP_ID IN (
            SELECT BEATMAP_ID
            FROM PICKS
            GROUP BY BEATMAP_ID
            HAVING COUNT(*) = 1
        )
        AND PICKER_ID != 0
        GROUP BY PICKER_ID
        ORDER BY PICK_COUNT DESC
        LIMIT 10;`
    }
    else{
        return `
        WITH OverplayedMaps AS (
        SELECT DISTINCT BEATMAP_ID, PICKER_ID 
        FROM PICKS 
        WHERE BEATMAP_ID IN (
            SELECT BEATMAP_ID
            FROM PICKS
            WHERE PICK_DATE > (strftime('%s', 'now') - 7 * 86400)
            GROUP BY BEATMAP_ID
            HAVING COUNT(*) >= ${weekly}

            UNION

            SELECT BEATMAP_ID
            FROM PICKS
            WHERE PICK_DATE > (strftime('%s', 'now') - 30 * 86400)
            GROUP BY BEATMAP_ID
            HAVING COUNT(*) >= ${monthly}

            UNION

            SELECT BEATMAP_ID
            FROM PICKS
            WHERE PICK_DATE > (strftime('%s', 'now') - 365 * 86400)
            GROUP BY BEATMAP_ID
            HAVING COUNT(*) >= ${yearly}

            UNION

            SELECT BEATMAP_ID
            FROM PICKS
            GROUP BY BEATMAP_ID
            HAVING COUNT(*) >= ${alltime}
        )
        )

        SELECT PICKER_ID, COUNT(*) AS PICK_COUNT
        FROM OverplayedMaps
        WHERE PICKER_ID != 0
        GROUP BY PICKER_ID
        ORDER BY PICK_COUNT DESC
        LIMIT 10;`
    }
}

export function getLeaderboardQuery(period) {
    const sortColumn = period === 'weekly' ? 'weekly_pick_count' : 'alltime_pick_count';
    
    return `
        SELECT PICKER_ID, 
            COUNT(*) as alltime_pick_count,
            SUM(CASE WHEN PICK_DATE > (strftime('%s', 'now') - 7 * 86400) THEN 1 ELSE 0 END) as weekly_pick_count
        FROM PICKS
        WHERE PICKER_ID != 0
        GROUP BY PICKER_ID 
        ORDER BY ${sortColumn} DESC 
        LIMIT 50`;
}

export function getBeatmapQuery(period) {
    let orderBy = '';
    switch (period) {
        case 'weekly':
            orderBy = 'weekly_count';
            break;
        case 'monthly':
            orderBy = 'monthly_count';
            break;
        case 'yearly':
            orderBy = 'yearly_count';
            break;
        case 'alltime':
            orderBy = 'alltime_count';
            break;
        default:
            return '';
    }
    return `
    SELECT BEATMAP_ID, 
           COUNT(*) as alltime_count,
           SUM(CASE WHEN PICK_DATE > (strftime('%s', 'now') - 7 * 86400) THEN 1 ELSE 0 END) as weekly_count,
           SUM(CASE WHEN PICK_DATE > (strftime('%s', 'now') - 30 * 86400) THEN 1 ELSE 0 END) as monthly_count,
           SUM(CASE WHEN PICK_DATE > (strftime('%s', 'now') - 365 * 86400) THEN 1 ELSE 0 END) as yearly_count
    FROM PICKS
    GROUP BY BEATMAP_ID
    ORDER BY ${orderBy} DESC 
    LIMIT (?) 
    OFFSET (?)`;
}