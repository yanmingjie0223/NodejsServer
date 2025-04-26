import { Client, logger } from "colyseus";
import { protocolMethod } from "../base/decorator";
import * as proto from "../protocol/index";
import { UserEntity } from "../db/user-entity";
import { db } from "../manager/db";
import { AppRoom } from "../rooms/app-room";
import request from 'request-promise';
import querystring from "querystring";
import { sendProtocol } from "../utils/protocol-utils";

export class ProtocolLogin {

	/**
	 * 登录协议处理
	 */
	@protocolMethod(proto.msg.MsgId.Login_C2S_Login)
	public async onMessageLogin(room: AppRoom, client: Client, protoObj: proto.login.C2S_Login) {
		const userMap = room.state.userMap;
		const sessionId = client.sessionId;
		if (!userMap.has(sessionId)) {
			let entity: UserEntity;
			switch (protoObj.platform) {
				case proto.msg.PlatformType.LOCAL:
					entity = await onNicknameLogin(protoObj.nickname);
					break;
				case proto.msg.PlatformType.WX_MINI:
					entity = await onWxOpenIdLogin(protoObj.nickname);
					break;
				default:
					console.error(`unprocessed type: { PLATFORM_TYPE: ${protoObj.platform}}`);
					break;
			}
			if (entity) {
				userMap.set(sessionId, entity);
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
 * @param nickname
 * @returns
 */
async function onNicknameLogin(nickname: string): Promise<UserEntity> {
	const userRepository = db.getConnection().getRepository(UserEntity);
	// eslint-disable-next-line newline-per-chained-call
	let entity: UserEntity = await userRepository.createQueryBuilder("user").where("user.openId = :openId", { openId: nickname }).getOne();
	const ct = Date.now();
	if (!entity) {
		entity = new UserEntity();
		entity.openId = nickname;
		entity.nickname = nickname;
		entity.createTime = ct;
	}
	entity.updateTime = ct;
	entity.connected = true;
	entity = await userRepository.save(entity);
	return entity;
}

/**
 * 微信获取openid登录
 * @param code
 * @returns
 */
async function onWxOpenIdLogin(code: string): Promise<UserEntity> {
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
		const entity = await onNicknameLogin(openId);
		return entity;
	}
	return null;
}
