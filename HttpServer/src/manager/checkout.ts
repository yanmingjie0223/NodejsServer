import Singleton from "../base/singleton";
import { CRequest, CResponse } from "../interface/index";
import { C2S_Base, C2S_Base_Login } from "../interface/protocol";

export class Checkout extends Singleton {

	/**
	 * 检测校验用户并获取协议post的data json数据
	 * @param req
	 * @param res
	 * @returns
	 */
	async getLoginData<T extends C2S_Base_Login>(req: CRequest, res: CResponse): Promise<T | null> {
		const data = await this.getData<C2S_Base_Login>(req, res);
		if (!data) {
			return null;
		}

		const openId = data.openId;
		const token = data.token;
		const redis_token = await req.redis.get(`user-${openId}-hope`);

		if (token !== redis_token) {
			res.end(JSON.stringify({ code: -1, errMsg: 'token auth failed' }));
			return null;
		}

		return data as T;
	};

	/**
	 * 获取协议中post data的json数据
	 * @param req
	 * @param res
	 * @returns
	 */
	async getData<T extends C2S_Base>(req: CRequest, res: CResponse): Promise<T | null> {
		const kvBody = req.body;
		try {
			const data = JSON.parse(kvBody.data);
			return data as T;
		} catch (error) {
			res.end(JSON.stringify({ code: -1, errMsg: 'upload data is not json data' }));
			return null;
		}
	};

}
