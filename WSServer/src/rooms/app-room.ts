import { Client, Room } from "colyseus";
import { AppSchema } from "./app-schema";
import { MessageEvent } from "./message-event";
import { checkoutSecret } from "../config/auth";
import { MessageQueue } from "./message-queue";

export class AppRoom extends Room {

	/**房间状态数据 */
	public state: AppSchema = new AppSchema();
	/**消息buffer队列 */
	public msgQueue: MessageQueue;

	public onCreate(): void {
		this.msgQueue = new MessageQueue(this);
		this.onMessage(MessageEvent.LOGIN, (client: Client, uint8s: Uint8Array) => {
			this.msgQueue.push(uint8s, client);
		});
		this.onMessage(MessageEvent.PROTO, (client: Client, uint8s: Uint8Array) => {
			const sessionId = client.sessionId;
			const user = this.state.userSessionMap.get(sessionId);
			if (user) {
				user.addMeesage(uint8s, client);
			}
		});
	}

	public onDispose(): void {
		this.state.userSessionMap.clear();
		this.state.userOpenIdMap.clear();
	}

	public async onAuth(client: Client<any, any>, options: any): Promise<boolean> {
		const sessionId = client.sessionId;
		const userMap = this.state.userSessionMap;
		if (!userMap.has(sessionId) && checkoutSecret(options.secret)) {
			return true;
		}
		return false;
	}

	public async onLeave(client: Client, consented: boolean): Promise<void> {
		const userMap = this.state.userSessionMap;
		const sessionId = client.sessionId;
		if (userMap.has(sessionId)) {
			const user = userMap.get(sessionId);
			const entity = user.entity;
			entity.connected = false;
			try {
				if (consented) {
					throw new Error("consented leave");
				}
				await this.allowReconnection(client, 20);
				entity.connected = true;
			} catch (e) {
				user.save();
				this.state.userOpenIdMap.delete(user.userData.openId);
				userMap.delete(sessionId);

			}
		}
	}

}
