import { CResponse } from "../interface";
import { logger } from "../manager/log";
import * as proto from "../protocol/index";
import { BinaryWriter, BinaryReader } from "@bufbuild/protobuf/wire";

/**
 * Parse the protocol object based on the Uint8Array data
 * @param uint8s
 * @returns
 */
export function getProtocol<T>(uint8s: Uint8Array): T {
	// 先解析协议id
	const reader = new BinaryReader(uint8s);
	const msgId = reader.int32();
	if (!msgId) {
		logger.error(`This Uint8Array parsing error checks whether the protocol id header has been written`);
		return null;
	}

	const protoClass = getProtocolClass(msgId);
	if (!protoClass) {
		return null;
	}

	const protoObj = protoClass.decode(reader);

	return protoObj as T;
}

/**
 * Obtain the protocol Class based on the protocol id
 * @param msgId
 * @returns
 */
export function getProtocolClass(msgId: proto.msg.MsgId): any {
	const idName = proto.msg.MsgId[msgId];
	if (!idName) {
		logger.error(`not found in msg.proto. id: ${msgId}`);
		return null;
	}

	const idNameArr = idName.split("_");
	if (idNameArr.length < 3) {
		logger.error(`Protocol naming: Protocol-pkg_end-to-end_protocol-name. for example: Login_C2S_Login`);
		return null;
	}

	const pkgName = idNameArr.shift().toLowerCase();
	const pkgClass = (proto as any)[pkgName];
	if (!pkgClass) {
		logger.error(`not found protocol pkg: ${pkgName}.proto`);
		return null;
	}

	const protoName = idNameArr.join('_');
	const protoClass = pkgClass[protoName];
	if (!protoClass) {
		logger.error(`not found in ${pkgName}.proto: ${protoName}`);
		return null;
	}

	return protoClass;
}

/**
 * Obtain the transmission Uint8Array based on the protocol id and protocol object
 * @param msgId
 * @param protoObj
 * @returns
 */
export function getProtocolUint8Array(msgId: proto.msg.MsgId, protoObj: any): Uint8Array {
	const protoClass = getProtocolClass(msgId);
	if (!protoClass) {
		return null;
	}
	// 先添加协议id为协议头
	const writer = new BinaryWriter();
	writer.int32(msgId);
	protoClass.encode(protoObj, writer);
	const uint8s = writer.finish();
	return uint8s;
}

/**
 * Send protocol data
 * @param res
 * @param msgId
 * @param protoObj
 * @returns
 */
export function sendProtocol(res: CResponse, msgId: proto.msg.MsgId, protoObj: any,): void {
	const uint8s = getProtocolUint8Array(msgId, protoObj);
	if (!uint8s) {
		return;
	}
	res.end(uint8s);
}

/**
 * 发送错误协议
 * @param res
 * @param c2sMsgId
 * @param message
 */
export function sendErrorProtocol(res: CResponse, c2sMsgId: proto.msg.MsgId, message: string = ''): void {
	const errorData = proto.msg.S2C_Msg.create();
	errorData.code = proto.msg.MsgCode.ERROR;
	errorData.message = message;
	errorData.mId = c2sMsgId;
	sendProtocol(res, proto.msg.MsgId.Msg_S2C_Msg, errorData);
}
