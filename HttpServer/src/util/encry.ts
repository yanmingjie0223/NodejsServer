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

/**
 * 根据数组获取存储字符串
 * @param arrStr
 * @returns
 */
export function getArrayIntByDBVachar(arrStr: string): number[] {
	if (!arrStr) {
		return [];
	}
	const arr = arrStr.split(';');
	const intArr: number[] = [];
	for (let i = 0, len = arr.length; i < len; i++) {
		intArr.push(parseInt(arr[i], 10));
	}
	return intArr;
}

/**
 * 根据字符串获取number数组
 * @param arr
 * @returns
 */
export function getVacharByArrayInt(arr: Array<string | number>): string {
	const vc = arr.join(";");
	return vc;
}
