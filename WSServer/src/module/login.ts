import { Client, Room } from "colyseus";
import { protocolMethod } from "../base/decorator";
import * as proto from "../protocol/index";

export class ProtocolLogin {

	/**
	 * 登录协议处理
	 */
	@protocolMethod(proto.msg.MSG_ID.Login_C2S_Login)
	public onMessageLogin(room: Room, client: Client, protoObj: proto.login.C2S_Login) {
		console.log(room, protoObj);
	}

}
