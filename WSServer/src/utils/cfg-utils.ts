import { ncb } from "../luban/lubancode/schema";
import { config } from "../manager/cfg";

/**
 * Obtain the global singleton data
 * @param key
 * @returns
 */
export function getGlobal(): ncb.Global {
	const tables = config.tables;
	return tables.TbGlobal.getDataList()[0];
}
