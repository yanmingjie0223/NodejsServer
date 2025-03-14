import { Config } from "../manager/cfg";

export class ConfigUtils {

	public static getGlobalInt(key: string): number {
		const tables = Config.getInstance<Config>().tables;
		const item = tables.TbGlobal.get(key);
		if (!item) {
			return 0;
		}

		const value = item.content;
		if (!value) {
			return 0;
		}
		else {
			return parseInt(value, 10);
		}
	}

	public static getGlobalFloat(key: string): number {
		const tables = Config.getInstance<Config>().tables;
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
		const tables = Config.getInstance<Config>().tables;
		const item = tables.TbGlobal.get(key);
		if (!item) {
			return 0;
		}

		return item.content;
	}
}
