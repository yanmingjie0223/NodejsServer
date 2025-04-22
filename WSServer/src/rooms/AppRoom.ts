import { Client, Room } from "colyseus";
import { AppSchema } from "./AppSchema";
import { User } from "../player/User";

export class AppRoom extends Room {

	public override onCreate(options: any): void {
		this.setState(new AppSchema());

		// 处理玩家加入
		this.onMessage("move", (client, data) => {
			const user = this.state.userMap[client.sessionId];
		});
	}

	public override onJoin(client: Client<any, any>): void {
		this.state.userMap[client.sessionId] = new User();
	}

	public override onLeave(client: Client<any, any>): void {
		delete this.state.userMap[client.sessionId];
	}

}
