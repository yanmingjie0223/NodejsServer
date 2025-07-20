import md5 from "blueimp-md5";

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
	return `user-${process.env.APP_NAME}-${openId}-hope`;
}

/**
 * 获取应用ID
 * @returns
 */
export function getAppId(): string {
	return process.env.APP_ID;
}

/**
 * 获取应用密钥
 * @returns
 */
export function getAppSecret(): string {
	return process.env.SECRET_KEY;
}

/**
 * 获取应用名字
 * @returns
 */
export function getAppName(): string {
	return process.env.APP_NAME;
}

/**
 * 获取应用平台
 * @returns
 */
export function getAppPlatform(): "local" | "wx" | "dy" {
	return process.env.PLATFORM as any;
}
