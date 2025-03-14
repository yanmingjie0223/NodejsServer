import { ProtocolCode } from "./protocol-code";

export interface S2C_Base {
	code: ProtocolCode;
	message: string;
}

export interface C2S_Base {

}

export interface C2S_Base_Login extends C2S_Base {
	openId: string;
	token: string;
}
