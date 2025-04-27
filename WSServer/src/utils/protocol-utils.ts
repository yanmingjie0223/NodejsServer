import { Room, Client, logger } from "colyseus";
import * as proto from "../protocol/index";
import { BinaryWriter, BinaryReader } from "@bufbuild/protobuf/wire";
import { MessageEvent } from "../rooms/message-event";
import { getProtocolMethod } from "../base/decorator";

/**
 * 根据buff数据解析协议对象
 * @param buff
 * @returns
 */
export function getProtocol<T>(buff: Uint8Array): T {
	// 先解析协议id
	const reader = new BinaryReader(buff);
	reader.uint32();
	const id = reader.int32();
	if (!id) {
		logger.error(`This buff parsing error checks whether the protocol id header has been written`);
		return null;
	}

	const protoClass = getProtocolClass(id);
	if (!protoClass) {
		return null;
	}

	const protoObj = protoClass.decode(reader);

	return protoObj as T;
}

/**
 * 根据协议id获取协议Class
 * @param id
 * @returns
 */
export function getProtocolClass(id: proto.msg.MsgId): any {
	const idName = proto.msg.MsgId[id];
	if (!idName) {
		logger.error(`not found in msg.proto. id: ${id}`);
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
 * 根据协议id和协议对象获取传输buff
 * @param id
 * @param protoObj
 * @returns
 */
export function getProtocolBuff(id: proto.msg.MsgId, protoObj: any): Uint8Array {
	const protoClass = getProtocolClass(id);
	if (!protoClass) {
		return null;
	}
	// 先添加协议id为协议头
	const writer = new BinaryWriter();
	writer.uint32(8).int32(id);
	protoClass.encode(protoObj, writer);
	const buff = writer.finish();
	return buff;
}

/**
 * 处理协议 装饰方法下运行
 * @param room
 * @param client
 * @param buff
 * @returns
 */
export async function dealProtocol(room: Room, client: Client, buff: Uint8Array): Promise<void> {
	// 先解析协议id
	const reader = new BinaryReader(buff);
	reader.uint32();
	const id = reader.int32();
	if (!id) {
		logger.error(`This buff parsing error checks whether the protocol id header has been written`);
		return null;
	}

	const protoClass = getProtocolClass(id);
	if (!protoClass) {
		return null;
	}

	const protoObj = protoClass.decode(reader);
	const protocolMethod = getProtocolMethod(id);
	if (protocolMethod) {
		await protocolMethod(protoObj, client, room);
	}
}

/**
 * 发送协议
 * @param client
 * @param id
 * @param protoObj
 * @returns
 */
export function sendProtocol(client: Client, id: proto.msg.MsgId, protoObj: any): void {
	const buff = getProtocolBuff(id, protoObj);
	if (!buff) {
		return;
	}
	client.send(MessageEvent.PROTO, buff);
}
