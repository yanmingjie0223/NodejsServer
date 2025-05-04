import md5 from "blueimp-md5";
import { serverConfig } from "../manager/server-config";

/**
 * 根据openId和添加元素获取生成的token值
 * @param openId
 * @param salt
 * @returns
 */
export function getToken(openId: string, salt: number): string {
	return md5(md5(openId + salt) + salt + openId[0]);
}

/**
 * 获取redis存储key
 * @param openId
 * @returns
 */
export function getRedisKey(openId: string): string {
	return `user-${serverConfig.app.appname}-${openId}-hope`;
}
