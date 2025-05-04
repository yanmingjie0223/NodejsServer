import { serverConfig } from "../manager/server-config";
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

	const redis = req.redis;
	const urlData = querystring.stringify({
		appid: serverConfig.app.appid,
		secret: serverConfig.app.secret,
		js_code: reqData.code,
		grant_type: 'authorization_code'
	});

	// https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html
	request('https://api.weixin.qq.com/sns/jscode2session?' + urlData)
		.then(async (resData) => {
			resData = JSON.parse(resData);
			if (!!resData["session_key"] && !!resData['openid']) {
				const openId = resData['openid'];

				const userRepository = req.db.getRepository(UserEntity);
				let user: UserEntity = await getUserByOpenId(userRepository, 'user', openId);

				const ct = Date.now();
				if (!user) {
					user = new UserEntity();
					user.initialize();
					user.openId = openId;
					user.createTime = ct;
				}
				user.updateTime = ct;
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
			} else {
				sendErrorProtocol(res, proto.msg.MsgId.User_C2S_Login, 'wx return no sessionkey or openid');
			}
		})
		.catch((err) => {
			req.logger.log('err', err);
			sendErrorProtocol(res, proto.msg.MsgId.User_C2S_Login, 'wx jscode2session request failed');
		});
}
