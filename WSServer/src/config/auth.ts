/**
 * Check the game key to prevent malicious connections from other software
 * @param secret
 * @returns
 */
export function checkoutSecret(secret: string): boolean {
	return secret === process.env.SECRET_KEY;
}
