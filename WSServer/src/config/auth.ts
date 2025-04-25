const secret_key = "d8c7a4f4a3e7b5c6a9d8b7c6a5d4e3f2";

/**
 * 检查token
 * @param secret
 * @returns
 */
export function checkoutSecret(secret: string): boolean {
	return secret === secret_key;
}
