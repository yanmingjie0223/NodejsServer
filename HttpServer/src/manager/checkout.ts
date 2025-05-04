import Singleton from "../base/singleton";
import * as encry from '../util/encry';
import * as proto from "../protocol/index";
import { CRequest, CResponse } from "../interface/index";
import { getProtocol, sendErrorProtocol } from "../util/protocol-utils";

export class Checkout extends Singleton {

	/**
	 * 检测校验用户并获取协议post的data json数据
	 * @param req
	 * @param res
	 * @returns
	 */
	public async getLoginData<T>(req: CRequest, res: CResponse): Promise<T | null> {
		const data: any = await this.getData<T>(req, res);
		if (!data) {
			return null;
		}

		const openId = data.openId;
		const token = data.token;
		const reidsKey = encry.getRedisKey(openId);
		const redis_token = await req.redis.get(reidsKey);

		if (token !== redis_token) {
			sendErrorProtocol(res, proto.msg.MsgId.NULL, 'token auth failed');
			return null;
		}

		return data as T;
	}

	/**
	 * 获取协议中post data的json数据
	 * @param req
	 * @param res
	 * @returns
	 */
	public async getData<T>(req: CRequest, res: CResponse): Promise<T | null> {
		if (!req.body) {
			sendErrorProtocol(res, proto.msg.MsgId.NULL, 'upload data is not json data');
			return null;
		}

		try {
			const data = getProtocol(req.body);
			return data as T;
		} catch (error) {
			sendErrorProtocol(res, proto.msg.MsgId.NULL, 'upload data is not json data');
			return null;
		}
	}

}
