import { Client, Room } from "colyseus";
import { AppSchema } from "./app-schema";
import { dealProtocol } from "../utils/protocol-utils";
import { MessageEvent } from "./message-event";
import { checkoutSecret } from "../config/auth";
import { db } from "../manager/db";
import { UserEntity } from "../db/user-entity";

export class AppRoom extends Room {

	public state: AppSchema = new AppSchema();

	/**消息buff队列 */
	public msgBuffs: Array<Uint8Array> = [];
	/**消息client队列 */
	public msgClients: Array<Client> = [];
	/**是否在处理消息中 */
	public msging: boolean = false;

	public onCreate(): void {
		this.onMessage(MessageEvent.PROTO, (client: Client, buff: Uint8Array) => {
			this.msgClients.push(client);
			this.msgBuffs.push(buff);
			this.onDealMsg();
		});
	}

	public onDispose(): void {
		this.state.userMap.clear();
	}

	public async onAuth(client: Client<any, any>, options: any): Promise<boolean> {
		const sessionId = client.sessionId;
		const userMap = this.state.userMap;
		if (!userMap.has(sessionId) && checkoutSecret(options.secret)) {
			return true;
		}
		return false;
	}

	public async onLeave(client: Client, consented: boolean): Promise<void> {
		const userMap = this.state.userMap;
		const sessionId = client.sessionId;
		if (userMap.has(sessionId)) {
			const entity = userMap.get(sessionId);
			entity.connected = false;
			try {
				if (consented) {
					throw new Error("consented leave");
				}
				await this.allowReconnection(client, 20);
				entity.connected = true;
			} catch (e) {
				if (entity) {
					const userRepository = db.getConnection().getRepository(UserEntity);
					userRepository.save(entity);
				}
				userMap.delete(sessionId);

			}
		}
	}

	private async onDealMsg(): Promise<void> {
		if (this.msging) {
			return;
		}

		const client = this.msgClients.shift();
		const buff = this.msgBuffs.shift();
		if (client && buff) {
			this.msging = true;
			await dealProtocol(this, client, buff);
			this.onDealMsg();
		}
		else {
			this.msging = false;
		}
	}

}
