import * as typeorm from "typeorm";
import { serverConfig } from "./server.config";
import { Logger } from "./log";
import userSchema from "../model/user.schema";

export class DB {

    private static _instance: DB;

    private ioDB;

    public static getInstance(): DB {
        if (!this._instance) {
            this._instance = new DB();
            this._instance.initialize();
        }
        return this._instance;
    }

    public initialize(): void {
        typeorm.createConnection({
            type: serverConfig.db.type,
            host: serverConfig.db.host,
            port: serverConfig.db.port,
            username: serverConfig.db.username,
            password: serverConfig.db.password,
            database: serverConfig.db.database,
            synchronize: true,
            logging: false,
            entities: [
                userSchema,
            ]
        }).then((connection) => {
            this.ioDB = connection;
            console.log(`> Connecting ${serverConfig.db.type} on ${serverConfig.db.host}:${serverConfig.db.port}`);
        }).catch(e => {
            Logger.error('数据库启动失败:', e);
        });
    }

    public getConnection(): void {
        return this.ioDB;
    }

}

export const db: DB = DB.getInstance(); 
