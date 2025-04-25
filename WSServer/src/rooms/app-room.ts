import { AuthContext, Client, Room } from "colyseus";
import { AppSchema } from "./app-schema";
import { UserSchema } from "../user/user-schema";
import { dealProtocol } from "../utils/protocol-utils";
import { MessageEvent } from "./message-event";
import { checkoutSecret } from "../config/auth";

export class AppRoom extends Room {

	public state: AppSchema = new AppSchema();

	public override onCreate(): void {
		this.onMessage(MessageEvent.PROTO, this.onProtocol.bind(this));
	}

	public async onAuth(client: Client<any, any>, options: any, context: AuthContext): Promise<boolean> {
		const sessionId = client.sessionId;
		const userMap = this.state.userMap;
		if (!userMap.has(sessionId) && checkoutSecret(options.secret)) {
			return true;
		}
		return null;
	}

	public override onJoin(client: Client): void {
		const sessionId = client.sessionId;
		const userMap = this.state.userMap;
		if (!userMap.has(sessionId)) {
			const user = new UserSchema();
			user.connected = true;
			userMap.set(client.sessionId, user);
		}
	}

	public override async onLeave(client: Client, consented: boolean): Promise<void> {
		const userMap = this.state.userMap;
		const sessionId = client.sessionId;
		if (userMap.has(sessionId)) {
			userMap.get(client.sessionId).connected = false;
			try {
				if (consented) {
					throw new Error("consented leave");
				}
				await this.allowReconnection(client, 20);
				userMap.get(client.sessionId).connected = true;
			} catch (e) {
				userMap.delete(client.sessionId);
			}
		}
	}

	private onProtocol(client: Client, buff: Uint8Array): void {
		dealProtocol(this, client, buff);
	}

}
