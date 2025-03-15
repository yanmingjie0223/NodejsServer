import { CRequest, CResponse } from "../interface/index";
import { C2S_Base, ProtocolCode, S2C_Base } from "../interface/protocol";

/**
 * /test协议的处理逻辑
 * @param req
 * @param res
 */
export async function test(req: CRequest, res: CResponse) {
	const c2s = await req.checkout.getData<C2S_Base>(req, res);
	console.log("c2s: ", c2s);

	const s2c: S2C_Base = {
		code: ProtocolCode.SUCC,
		message: ""
	};

	res.end(JSON.stringify(s2c));
}
