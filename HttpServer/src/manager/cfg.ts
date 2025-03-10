import ByteBuf from "../bright/serialization/ByteBuf";
import * as cfg from "../lubancode/schema";
import fs from "fs";

export class Config {
    private static _instance: Config;

    public tables: cfg.Tables = null;
    private jsonFileNames: string[] = [];
    private dataMap = new Map<string, Uint8Array>();

    public static getInstance(): Config {
        if (!this._instance) {
            this._instance = new Config();
            this._instance.initialize();
        }
        return this._instance;
    }

    public initialize() {
        this.jsonFileNames = cfg.Tables.getTableNames();

        for (let curFileName of this.jsonFileNames) {
            const bytes = fs.readFileSync(`./dist/src/lubandata/${curFileName}.bytes`);
            this.dataMap.set(curFileName, new Uint8Array(bytes));
        }

        this.tables = new cfg.Tables(this.getFileData.bind(this));
        console.log("> config load complete ");
    }

    private getFileData(fileName: string): ByteBuf {
        if (this.dataMap.has(fileName)) {
            return new ByteBuf(this.dataMap.get(fileName));
        }
        return null;
    }

}

export class ConfigUtils {

    public static getGlobalInt(key: string): number {
        const tables = Config.getInstance().tables;
        const item = tables.TbGlobal.get(key);
        if (!item) {
            return 0;
        }

        const value = item.content;
        if (!value) {
            return 0;
        }
        else {
            return parseInt(value);
        }
    }

    public static getGlobalFloat(key: string): number {
        const tables = Config.getInstance().tables;
        const item = tables.TbGlobal.get(key);
        if (!item) {
            return 0;
        }

        const value = item.content;
        if (!value) {
            return 0;
        }
        else {
            return parseFloat(value);
        }
    }

    public static getGlobalString(key: string) {
        const tables = Config.getInstance().tables;
        const item = tables.TbGlobal.get(key);
        if (!item) {
            return 0;
        }

        return item.content;
    }
}

export const config: Config = Config.getInstance();
