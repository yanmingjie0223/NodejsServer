import querystring from "querystring";
import * as encry from '../util/encry';
import request from 'request-promise';
import { CRequest, CResponse } from "../interface";
import * as proto from '../protocol/index';
import { UserEntity } from "../model/user-entity";
import { getUserByOpenId } from "../util/user-utils";
import { sendErrorProtocol, sendProtocol } from "../util/protocol-utils";

/**
 * 登录
 * @param req
 * @param res
 * @returns
 */
export async function login(req: CRequest, res: CResponse): Promise<void> {
	const reqData = await req.checkout.getData<proto.user.C2S_Login>(req, res);
	if (!reqData) {
		return;
	}

	const platform = encry.getAppPlatform();
	if (platform === 'wx') {
		const urlData = querystring.stringify({
			appid: encry.getAppId(),
			secret: encry.getAppSecret(),
			js_code: reqData.code,
			grant_type: 'authorization_code'
		});
		// https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html
		request('https://api.weixin.qq.com/sns/jscode2session?' + urlData)
			.then(async (resData) => {
				resData = JSON.parse(resData);
				if (!!resData["session_key"] && !!resData['openid']) {
					const openId = resData['openid'];
					loginOpenId(openId, req, res);
				} else {
					sendErrorProtocol(res, proto.msg.MsgId.User_C2S_Login, 'wx return no sessionkey or openid');
				}
			})
			.catch((err) => {
				req.logger.error('err', err);
				sendErrorProtocol(res, proto.msg.MsgId.User_C2S_Login, 'wx jscode2session request failed');
			});
	}
	else if (platform === 'dy') {
		// https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/server/log-in/code-2-session
		const urlData = querystring.stringify({
			appid: encry.getAppId(),
			secret: encry.getAppSecret(),
			code: reqData.code,
			anonymousCode: ''
		});
		request('https://minigame.zijieapi.com/mgplatform/api/apps/jscode2session?' + urlData)
			.then(async (resData) => {
				resData = JSON.parse(resData);
				if (!!resData["session_key"] && !!resData['openid']) {
					const openId = resData['openid'];
					loginOpenId(openId, req, res);
				} else {
					sendErrorProtocol(res, proto.msg.MsgId.User_C2S_Login, 'dy return no sessionkey or openid');
				}
			})
			.catch((err) => {
				req.logger.error('err', err);
				sendErrorProtocol(res, proto.msg.MsgId.User_C2S_Login, 'dy jscode2session request failed');
			});
	}
	else {
		const openId = reqData.nickname;
		if (!openId) {
			sendErrorProtocol(res, proto.msg.MsgId.User_C2S_Login, 'nickname is empty');
			return;
		}

		loginOpenId(openId, req, res);
	}
}

/**
 * 登录OpenId
 * @param openId
 */
async function loginOpenId(openId: string, req: CRequest, res: CResponse) {
	const reqData = await req.checkout.getData<proto.user.C2S_Login>(req, res);
	const redis = req.redis;
	const userRepository = req.db.getRepository(UserEntity);
	let user: UserEntity = await getUserByOpenId(userRepository, 'user', openId);

	const ct = Date.now();
	if (!user) {
		user = new UserEntity();
		user.initialize();
		user.setOpenId(openId);
		user.createAt = ct;
	}
	user.setUpdateTime(ct);
	user.setNickname(reqData.nickname);
	user.setAvatarUrl(reqData.avatarUrl);
	await user.save(userRepository);

	const reidsKey = encry.getRedisKey(openId);
	const token = encry.getToken(openId, ct);
	redis.set(reidsKey, token);
	redis.expire(reidsKey, 24 * 60 * 60);

	const s2c = proto.user.S2C_Login.create();
	s2c.code = proto.msg.MsgCode.SUCC;
	s2c.openId = openId;
	s2c.token = token;
	s2c.user = user.copyUserData();
	sendProtocol(res, proto.msg.MsgId.User_S2C_Login, s2c);
}
