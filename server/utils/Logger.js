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
    },
});

const logger = log4js.getLogger("server");
logger.addContext('date', new Date().toISOString().replace(/:/g, '-'));

export default logger;