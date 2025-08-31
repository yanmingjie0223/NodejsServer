import { logger } from "colyseus";
import Singleton from "../base/singleton";
import ByteBuf from "../luban/bright/serialization/ByteBuf";
import type { Tables } from "../luban/lubancode/schema";
import fs from "fs";

/**
 * 配置自动重新更新原有的表数据时间间隔，单位：毫秒
 */
const RELOAD_TIME = 5 * 60 * 1000;

export class Config extends Singleton {

	public tables: Tables = null;
	private jsonFileNames: string[] = [];
	private dataMap = new Map<string, Uint8Array>();
	private reloadInterval: NodeJS.Timeout = null;

	public override initialize(): void {
		this.loadConfig();
		logger.info("✅ Config load complete ");

		// 定时重新加载配置
		this.reloadInterval = setInterval(() => {
			this.loadConfig();
			logger.info("✅ Config reloaded by timer");
		}, RELOAD_TIME);
	}

	public override destroy(): void {
		if (this.reloadInterval) {
			clearInterval(this.reloadInterval);
			this.reloadInterval = null;
		}
	}

	private loadConfig(): void {
		// 清除缓存，重新加载最新的配置表，实现热更新配置数据
		delete require.cache[require.resolve("../luban/lubancode/schema")];
		// eslint-disable-next-line global-require
		const newCfg = require("../luban/lubancode/schema");

		this.jsonFileNames = newCfg.Tables.getTableNames();
		for (const curFileName of this.jsonFileNames) {
			const bytes = fs.readFileSync(`./src/luban/lubandata/${curFileName}.bytes`);
			this.dataMap.set(curFileName, new Uint8Array(bytes));
		}
		this.tables = new newCfg.Tables(this.getFileData.bind(this));
	}

	private getFileData(fileName: string): ByteBuf {
		if (this.dataMap.has(fileName)) {
			return new ByteBuf(this.dataMap.get(fileName));
		}
		return null;
	}

}

export const config: Config = Config.getInstance();
