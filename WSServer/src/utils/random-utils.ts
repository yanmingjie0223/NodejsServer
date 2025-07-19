/**
 * 获取一个区间的随机数 [min, max)
 * @param {number} from 最小值
 * @param {number} end 最大值
 * @returns {number}
 */
export function random(from: number, end: number): number {
	const min: number = Math.min(from, end);
	const max: number = Math.max(from, end);
	const range: number = max - min;
	return min + Math.random() * range;
}

/**
 * 获取一个区间的随机数 [min, max)
 * @param {number} from 最小值
 * @param {number} end 最大值
 * @returns {number}
 */
export function randomInt(from: number, end: number): number {
	return Math.floor(random(from, end));
}

/**
 * 获取数组中随机一个单元
 * @param arr 数组数据源
 * @param isPutback 是否随机后放回 默认放回
 */
export function randomArray<T>(arr: Array<T>, isPutback: boolean = true): T | null {
	if (!arr || arr.length === 0) {
		return null;
	}
	const index: number = Math.floor(random(0, arr.length));
	if (isPutback) {
		return arr[index];
	} else {
		return arr.splice(index, 1)[0];
	}
}
