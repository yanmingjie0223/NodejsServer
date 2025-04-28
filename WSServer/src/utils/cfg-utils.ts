import { config } from "../manager/cfg";

/**
 * get global table int data
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
 * get global table float data
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
 * get global table string data
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
