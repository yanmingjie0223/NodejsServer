import { config } from "../manager/cfg";

/**
 * 根据key获取global表int数据
 * @param key
 * @returns
 */
export function getGlobalInt(key: string): number {
	const tables = config.tables;
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

/**
 * 根据key获取global表float数据
 * @param key
 * @returns
 */
export function getGlobalFloat(key: string): number {
	const tables = config.tables;
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

/**
 * 根据key获取global表string数据
 * @param key
 * @returns
 */
export function getGlobalString(key: string): string {
	const tables = config.tables;
	const item = tables.TbGlobal.get(key);
	if (!item) {
		return '';
	}

	return item.content;
}
