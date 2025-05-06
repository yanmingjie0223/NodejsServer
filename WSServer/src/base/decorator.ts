import * as proto from "../protocol/index";
import { Room, Client } from "colyseus";
type protocolMethodFunc = (protoObj: any, client: Client, room: Room) => Promise<void>;

const protocol_methods = new Map<number, protocolMethodFunc>();

/**
 * Protocol decorator
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
 * Obtain the function based on the ID
 * @param {proto.msg.MsgId} msgId
 * @returns
 */
export function getProtocolMethod(msgId: proto.msg.MsgId): protocolMethodFunc | undefined {
	return protocol_methods.get(msgId);
}
