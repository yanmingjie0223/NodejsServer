export enum ProtocolCode {
	ERRO = -1,
	SUCC = 0,
}

export interface S2C_Base {
	code: ProtocolCode;
	message: string;
}
export interface C2S_Base { }

export interface C2S_Base_Login extends C2S_Base {
	openId: string;
	token: string;
}
