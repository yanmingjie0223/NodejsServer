import { Client, Room } from "colyseus";
import { AppSchema } from "./app-schema";
import { UserSchema } from "../user/user-schema";

export class AppRoom extends Room {

	public state: AppSchema = new AppSchema();

	public override onCreate(options: any): void {
		// 处理玩家加入
		this.onMessage("move", (client, data) => {
			const user = this.state.userMap.get(client.sessionId);
		});
	}

	public override onJoin(client: Client<any, any>): void {
		this.state.userMap.set(client.sessionId, new UserSchema());
	}

	public override onLeave(client: Client<any, any>): void {
		this.state.userMap.delete(client.sessionId);
	}

}
