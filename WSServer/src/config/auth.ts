/**
 * 检查token
 * @param secret
 * @returns
 */
export function checkoutSecret(secret: string): boolean {
	return secret === process.env.SECRET_KEY;
}
