import log4js from "log4js";

const infoLog = log4js.getLogger('info');
const errorLog = log4js.getLogger('error');

log4js.configure({
    appenders: {
        ruleConsole: { type: 'console' },
        ruleFile: {
            type: 'dateFile',
            filename: 'logs/server',
            pattern: 'yyyy-MM-dd.log',
            maxLogSize: 10 * 1000 * 1000,
            numBackups: 3,
            alwaysIncludePattern: true
        }
    },
    categories: {
        default: { appenders: ['ruleConsole', 'ruleFile'], level: 'info' }
    }
});

export class Logger {
    public static trace(...args: Array<any>): void {
        infoLog.trace.apply(infoLog, args)
    }

    public static debug(...args: Array<any>): void {
        infoLog.debug.apply(infoLog, args)
    }

    public static info(...args: Array<any>): void {
        infoLog.info.apply(infoLog, args)
    }

    public static log(...args: Array<any>): void {
        infoLog.info.apply(infoLog, args)
    }

    public static warn(...args: Array<any>): void {
        infoLog.warn.apply(infoLog, args)
    }

    public static error(...args: Array<any>): void {
        infoLog.error.apply(infoLog, args)
        errorLog.error.apply(errorLog, args)
    }

    public static fatal(...args: Array<any>): void {
        infoLog.fatal.apply(infoLog, args)
        errorLog.fatal.apply(errorLog, args)
    }
}
