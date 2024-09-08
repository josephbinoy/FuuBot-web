import log4js from "log4js";

log4js.configure({
    appenders: {
        console: { type: "console" },
        file: {
            type: 'multiFile', 
            base: 'logs/', 
            property: 'date', 
            extension: '.log'
        }
    },
    categories: {
        default: { appenders: ["console", "file"], level: "all" },
        server: { appenders: ["console", "file"], level: "all" },
        sqlite: { appenders: ["console", "file"], level: "all" },
        redis: { appenders: ["console", "file"], level: "all" }
    },
});

const logger = log4js.getLogger("server");
const sqliteLogger = log4js.getLogger("sqlite");
const redisLogger = log4js.getLogger("redis");

const date = new Date().toISOString().replace(/:/g, '-');
logger.addContext('date', date);
sqliteLogger.addContext('date', date);
redisLogger.addContext('date', date);

export { logger, sqliteLogger, redisLogger };