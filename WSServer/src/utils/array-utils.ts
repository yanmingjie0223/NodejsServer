/**
 * 打乱数组中的元素
 * @param {Array} arr
 */
export function upset(arr: Array<any>): void {
	arr.sort(() => Math.random() - 0.5);
}
