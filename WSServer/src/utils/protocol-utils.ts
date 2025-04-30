import { Client, logger, Room } from "colyseus";
import * as proto from "../protocol/index";
import { BinaryWriter, BinaryReader } from "@bufbuild/protobuf/wire";
import { MessageEvent } from "../rooms/message-event";
import { getProtocolMethod } from "../base/decorator";

/**
 * Parse the protocol object based on the Uint8Array data
 * @param uint8s
 * @returns
 */
export function getProtocol<T>(uint8s: Uint8Array): T {
	// 先解析协议id
	const reader = new BinaryReader(uint8s);
	reader.uint32();
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
	writer.uint32(8).int32(msgId);
	protoClass.encode(protoObj, writer);
	const uint8s = writer.finish();
	return uint8s;
}

/**
 * Process protocol data
 * @param room
 * @param client
 * @param uint8s
 * @returns
 */
export async function dealProtocol(room: Room, client: Client, uint8s: Uint8Array): Promise<void> {
	if (!room || !(room as any).active) {
		logger.error(`not active room ${room.roomId} `);
		return;
	}
	// 先解析协议id
	const reader = new BinaryReader(uint8s);
	reader.uint32();
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
	const protocolMethod = getProtocolMethod(msgId);
	if (protocolMethod) {
		await protocolMethod(protoObj, client, room);
	}
}

/**
 * Send protocol data
 * @param client
 * @param msgId
 * @param protoObj
 * @param event
 * @returns
 */
export function sendProtocol(
	client: Client,
	msgId: proto.msg.MsgId,
	protoObj: any,
	event: MessageEvent = MessageEvent.PROTO
): void {
	const uint8s = getProtocolUint8Array(msgId, protoObj);
	if (!uint8s) {
		return;
	}
	client.send(event, uint8s);
}

/**
 * 发送错误协议
 * @param client
 * @param c2sMsgId
 * @param message
 */
export function sendErrorProtocol(client: Client, c2sMsgId: proto.msg.MsgId, message: string = ''): void {
	const errorData = proto.msg.S2C_Msg.create();
	errorData.code = proto.msg.MsgCode.ERROR;
	errorData.message = message;
	errorData.mId = c2sMsgId;
	sendProtocol(client, proto.msg.MsgId.Msg_S2C_Msg, errorData);
}
