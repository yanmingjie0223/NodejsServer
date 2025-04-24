import { Client, Room } from "colyseus";
import { AppSchema } from "./app-schema";
import { UserSchema } from "../user/user-schema";
import { getProtocol } from "../utils/protocol-utils";

export class AppRoom extends Room {

	public state: AppSchema = new AppSchema();

	public override onCreate(options: any): void {
		this.onMessage("proto", this.onProtocol.bind(this));
	}

	public override onJoin(client: Client<any, any>): void {
		const sessionId = client.sessionId;
		const userMap = this.state.userMap;
		const jointUserMap = this.state.jointUserMap;
		if (!userMap.has(sessionId) && !jointUserMap.has(sessionId)) {
			jointUserMap.set(client.sessionId, new UserSchema());
		}
	}

	public override onLeave(client: Client<any, any>): void {
		const sessionId = client.sessionId;
		if (this.state.jointUserMap.has(sessionId)) {
			this.state.jointUserMap.delete(sessionId);
		}
	}

	private onProtocol(client: Client<any, any>, data: { id: number, buff: Uint8Array }): void {
		console.log(client, data);
		const protoObj = getProtocol(data.id, data.buff);
		console.log(protoObj);
	}

}
