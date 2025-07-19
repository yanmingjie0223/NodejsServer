import { Schema } from "@colyseus/schema";
import { User } from "../db/user";

export class AppSchema extends Schema {

	/**
	 * client session id user map
	 */
	private _userSessionMap: Map<string, User> = new Map();
	/**
	 * openId user map
	 */
	private _userOpenIdMap: Map<string, User> = new Map();

	public set(sessionId: string, openId: string, user: User): void {
		this._userSessionMap.set(sessionId, user);
		this._userOpenIdMap.set(openId, user);
	}

	public getUserBySessionId(sessionId: string): User | undefined {
		return this._userSessionMap.get(sessionId);
	}

	public getUserByOpenId(openId: string): User | undefined {
		return this._userOpenIdMap.get(openId);
	}

	public delete(sessionId: string, openId: string): void {
		this._userSessionMap.delete(sessionId);
		this._userOpenIdMap.delete(openId);
	}

	public clear(): void {
		this._userSessionMap.clear();
		this._userOpenIdMap.clear();
	}

	/**
	 * on before shut down
	 * @returns The number of users with messages
	 */
	public onBeforeShutdown(): number {
		let hasMessageCount = 0;
		const userMap = this._userSessionMap;
		userMap.forEach((value: User) => {
			if (value.msgQueue && !value.msgQueue.checkHasMessage()) {
				value.save();
			}
			else {
				hasMessageCount += 1;
			}
		});
		return hasMessageCount;
	}

}
