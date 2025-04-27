import { Client, logger, Room } from "colyseus";
import { protocolMethod } from "../base/decorator";
import * as proto from "../protocol/index";
import { AppRoom } from "../rooms/app-room";
import request from 'request-promise';
import querystring from "querystring";
import { sendProtocol } from "../utils/protocol-utils";
import { User } from "../db/user";

export class ProtocolLogin {

	/**
	 * 登录协议处理
	 */
	@protocolMethod(proto.msg.MsgId.Login_C2S_Login)
	public async onMessageLogin(protoObj: proto.login.C2S_Login, client: Client, room: AppRoom) {
		const userMap = room.state.userMap;
		const sessionId = client.sessionId;
		if (!userMap.has(sessionId)) {
			let user: User;
			switch (protoObj.platform) {
				case proto.msg.PlatformType.LOCAL:
					user = await onNicknameLogin(protoObj.nickname, protoObj.nickname, client, room);
					break;
				case proto.msg.PlatformType.WX_MINI:
					user = await onWxOpenIdLogin(protoObj.code, protoObj.nickname, client, room);
					break;
				default:
					console.error(`unprocessed type: { PLATFORM_TYPE: ${protoObj.platform}}`);
					break;
			}
			if (user) {
				userMap.set(sessionId, user);
			}
			else {
				logger.error(`not found user: {account: ${protoObj.nickname}, code: ${protoObj.code}} `);
				const errorData = proto.msg.S2C_Msg.create();
				errorData.code = proto.msg.MsgCode.ERROR;
				sendProtocol(client, proto.msg.MsgId.Msg_S2C_Msg, errorData);
			}
		}
	}

}

/**
 * 用户名登录
 * @param openId
 * @param nickname
 * @param client
 * @param room
 * @returns
 */
async function onNicknameLogin(openId: string, nickname: string, client: Client, room: Room): Promise<User> {
	const user = new User();
	await user.initialize(openId, nickname, client, room);
	return user;
}

/**
 * 微信获取openid登录
 * @param code
 * @param nickname
 * @param client
 * @param room
 * @returns
 */
async function onWxOpenIdLogin(code: string, nickname: string, client: Client, room: Room): Promise<User> {
	const urlData = querystring.stringify({
		appid: process.env.WX_APP_ID,
		secret: process.env.WX_SECRET,
		js_code: code,
		grant_type: 'authorization_code'
	});

	let resData = await request('https://api.weixin.qq.com/sns/jscode2session?' + urlData);
	resData = JSON.parse(resData);
	if (!!resData["session_key"] && !!resData['openid']) {
		const openId = resData['openid'];
		const user = await onNicknameLogin(openId, nickname, client, room);
		return user;
	}
	return null;
}
