import { ncb } from "../luban/lubancode/schema";
import { config } from "../manager/cfg";

/**
 * 根据key获取global全局单例数据
 * @param key
 * @returns
 */
export function getGlobal(): ncb.Global {
	const tables = config.tables;
	return tables.TbGlobal.getDataList()[0];
}
