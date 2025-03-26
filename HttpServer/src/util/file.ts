import fs from "fs";

/**
 * 获取config的json数据
 * @param name
 * @returns
 */
export function readJsonConfig(name: string): any {
	return JSON.parse(fs.readFileSync(`./${name}.json`, 'utf-8'));
}
