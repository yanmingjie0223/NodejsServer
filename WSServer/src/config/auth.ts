/**
 * 检查游戏密钥，防止其他软件恶意连接
 * @param secret
 * @returns
 */
export function checkoutSecret(secret: string): boolean {
	return secret === process.env.SECRET_KEY;
}
