import { Client, logger } from "colyseus";
import { protocolMethod } from "../base/decorator";
import * as proto from "../protocol/index";
import { AppRoom } from "../rooms/app-room";
import request from 'request-promise';
import querystring from "querystring";
import { sendErrorProtocol, sendProtocol } from "../utils/protocol-utils";
import { User } from "../db/user";

export class ProtocolLogin {

	/**
	 * Login protocol processing
	 */
	@protocolMethod(proto.msg.MsgId.User_C2S_Login)
	public async onMessageLogin(protoObj: proto.user.C2S_Login, client: Client, room: AppRoom): Promise<void> {
		const sessionId = client.sessionId;
		let user: User = room.state.getUserBySessionId(sessionId);
		if (!user) {
			switch (protoObj.platform) {
				case proto.msg.PlatformType.H5:
					user = await onOpenIdAndNicknameLogin(protoObj.nickname, protoObj.nickname, client, room);
					break;
				case proto.msg.PlatformType.WX:
					user = await onWXOpenIdLogin(protoObj.code, protoObj.nickname, client, room);
					break;
				case proto.msg.PlatformType.DY:
					user = await onDYOpenIdLogin(protoObj.code, protoObj.nickname, client, room);
					break;
				default:
					console.error(`unprocessed type: { PLATFORM_TYPE: ${protoObj.platform}}`);
					break;
			}
			if (user.client && user.client.sessionId !== sessionId) {
				user.client.leave();
			}
			if (user) {
				user.setAvatarUrl(protoObj.avatarUrl);
				user.setNickname(protoObj.nickname);
				user.client = client;
				room.state.set(sessionId, user.getOpenId(), user);
				const s2c = proto.user.S2C_Login.create();
				s2c.openId = user.getOpenId();
				s2c.user = user.userData;
				sendProtocol(client, proto.msg.MsgId.User_S2C_Login, s2c);
			}
			else {
				logger.error(`not found user: {account: ${protoObj.nickname}, code: ${protoObj.code}} `);
				sendErrorProtocol(client, proto.msg.MsgId.User_C2S_Login);
				client.leave();
			}
		}
	}

}

/**
 * use nickname login
 * @param openId
 * @param nickname
 * @param client
 * @param room
 * @returns
 */
async function onOpenIdAndNicknameLogin(openId: string, nickname: string, client: Client, room: AppRoom): Promise<User> {
	let user = room.state.getUserByOpenId(openId);
	if (!user) {
		user = new User();
		await user.initialize(openId, nickname, client, room);
	}
	return user;
}

/**
 * use wechat code login
 * @param code
 * @param nickname
 * @param client
 * @param room
 * @returns
 */
async function onWXOpenIdLogin(code: string, nickname: string, client: Client, room: AppRoom): Promise<User> {
	const urlData = querystring.stringify({
		appid: process.env.WX_APP_ID,
		secret: process.env.WX_SECRET,
		js_code: code,
		grant_type: 'authorization_code'
	});

	let resData = await request('https://api.weixin.qq.com/sns/jscode2session?' + urlData);
	if (resData) {
		resData = JSON.parse(resData);
		if (!!resData["session_key"] && !!resData['openid']) {
			const openId = resData['openid'];
			const user = await onOpenIdAndNicknameLogin(openId, nickname, client, room);
			return user;
		}
	}
	return null;
}

/**
 * use tiktok code login
 * @param code
 * @param nickname
 * @param client
 * @param room
 * @returns
 */
async function onDYOpenIdLogin(code: string, nickname: string, client: Client, room: AppRoom): Promise<User> {
	const urlData = querystring.stringify({
		appid: process.env.DY_APP_ID,
		secret: process.env.DY_SECRET,
		code: code,
		anonymousCode: ''
	});

	let resData = await request('https://minigame.zijieapi.com/mgplatform/api/apps/jscode2session?' + urlData);
	if (resData) {
		resData = JSON.parse(resData);
		if (!!resData["session_key"] && !!resData['openid']) {
			const openId = resData['openid'];
			const user = await onOpenIdAndNicknameLogin(openId, nickname, client, room);
			return user;
		}
	}
	return null;
}
