import { Room, Client } from "colyseus";
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
		console.error(`该buff解析错误 检查是否为已写入协议id头的buff`);
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
		console.error(`msg.proto中未找到协议 id: ${id}`);
		return null;
	}

	const idNameArr = idName.split("_");
	if (idNameArr.length < 3) {
		console.error(`协议名定义: 协议包_协议发送方式c2s或者s2c_协议名字 例如: Login_C2S_Login`);
		return null;
	}

	const pkgName = idNameArr.shift().toLowerCase();
	const pkgClass = (proto as any)[pkgName];
	if (!pkgClass) {
		console.error(`未找到定义文件的协议包: ${pkgName}.proto`);
		return null;
	}

	const protoName = idNameArr.join('_');
	const protoClass = pkgClass[protoName];
	if (!protoClass) {
		console.error(`未在${pkgName}.proto找到协议: ${protoName}`);
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
		console.error(`该buff解析错误 检查是否为已写入协议id头的buff`);
		return null;
	}

	const protoClass = getProtocolClass(id);
	if (!protoClass) {
		return null;
	}

	const protoObj = protoClass.decode(reader);
	const protocolMethod = getProtocolMethod(id);
	if (protocolMethod) {
		await protocolMethod(room, client, protoObj);
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
