import * as proto from "../protocol/index";
import { Room, Client } from "colyseus";
type protocol_method = (protoObj: any, client: Client, room: Room) => void;

const protocol_methods = new Map<number, protocol_method>();

/**
 * 协议装饰器
 * @export
 * @param {proto.msg.MsgId} msgId
 * @return {Function}
 */
export function protocolMethod(msgId: proto.msg.MsgId): Function {
	return function (target: any, context?: any) {
		const method = target[context];
		if (method) {
			protocol_methods.set(msgId, method);
		}
	};
}

/**
 * 根据 ID 获取函数
 * @param id 函数 ID
 * @returns 对应的函数或 undefined
 */
export function getProtocolMethod(msgId: proto.msg.MsgId): protocol_method | undefined {
	return protocol_methods.get(msgId);
}
