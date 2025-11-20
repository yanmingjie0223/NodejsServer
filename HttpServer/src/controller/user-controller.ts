import querystring from "querystring";
import * as encry from '../util/encry';
import * as proto from '../protocol/index';
import { UserEntity } from "../model/user-entity";
import { getUserByOpenId } from "../util/user-utils";
import { sendErrorProtocol, sendProtocol } from "../util/protocol-utils";
import { FastifyReply, FastifyRequest } from "fastify";
import { Checkout } from "../manager/checkout";
import { redis } from "../manager/redis";
import { db } from "../manager/db";

/**
 * 登录
 * @param req
 * @param res
 * @returns
 */
export async function login(req: FastifyRequest, res: FastifyReply): Promise<void> {
	const reqData = await Checkout.getInstance<Checkout>().getData<proto.user.C2S_Login>(req, res);
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
		const response = await fetch('https://api.weixin.qq.com/sns/jscode2session?' + urlData);
		if (!response.ok) {
			sendErrorProtocol(res, proto.msg.MsgId.User_C2S_Login, 'wx jscode2session request failed');
		}
		else {
			const resData = await response.json();
			if (!!resData["session_key"] && !!resData['openid']) {
				const openId = resData['openid'];
				loginOpenId(openId, req, res);
			} else {
				sendErrorProtocol(res, proto.msg.MsgId.User_C2S_Login, 'wx return no sessionkey or openid');
			}
		}
	}
	else if (platform === 'dy') {
		const urlData = querystring.stringify({
			appid: encry.getAppId(),
			secret: encry.getAppSecret(),
			code: reqData.code,
			anonymousCode: ''
		});
		// https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/server/log-in/code-2-session
		const response = await fetch('https://minigame.zijieapi.com/mgplatform/api/apps/jscode2session?' + urlData);
		if (!response.ok) {
			sendErrorProtocol(res, proto.msg.MsgId.User_C2S_Login, 'dy jscode2session request failed');
		}
		else {
			const resData = await response.json();
			if (!!resData["session_key"] && !!resData['openid']) {
				const openId = resData['openid'];
				loginOpenId(openId, req, res);
			} else {
				sendErrorProtocol(res, proto.msg.MsgId.User_C2S_Login, 'dy return no sessionkey or openid');
			}
		}
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
async function loginOpenId(openId: string, req: FastifyRequest, res: FastifyReply) {
	const reqData = await Checkout.getInstance<Checkout>().getData<proto.user.C2S_Login>(req, res);
	const ioredis = redis.getConnection();
	const userRepository = db.getConnection().getRepository(UserEntity);
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
	ioredis.set(reidsKey, token);
	ioredis.expire(reidsKey, 24 * 60 * 60);

	const s2c = proto.user.S2C_Login.create();
	s2c.code = proto.msg.MsgCode.SUCC;
	s2c.openId = openId;
	s2c.token = token;
	s2c.user = user.copyUserData();
	sendProtocol(res, proto.msg.MsgId.User_S2C_Login, s2c);
}
