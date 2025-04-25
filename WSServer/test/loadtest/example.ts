import { Client, Room } from "colyseus.js";
import { cli, Options } from "@colyseus/loadtest";
import * as proto from "../../src/protocol/index";
import { getProtocol, getProtocolBuff } from "../../src/utils/protocol-utils";
import { MessageEvent } from "../../src/rooms/message-event";

/**
 * 连接测试
 * @param options
 */
export async function main(options: Options) {
	const client = new Client(options.endpoint);
	const room: Room = await client.joinOrCreate(options.roomName, {
		secret: "d8c7a4f4a3e7b5c6a9d8b7c6a5d4e3f2",
	});

	console.log("joined successfully!");

	room.onMessage("proto", (buff: Uint8Array) => {
		// logic
		const protoObj = getProtocol<proto.login.S2C_Login>(buff);
		console.log(protoObj);

		room.onLeave((code) => {
			console.log("leave");
		});
	});

	room.onStateChange((state) => {
		// console.log("state change:", state);
	});

	const loginData = proto.login.C2S_Login.create();
	loginData.account = "ymj";
	sendProtocol(room, proto.msg.MSG_ID.Login_C2S_Login, loginData);
}

/**
 * 客户端发送协议
 * @param room
 * @param id
 * @param protoObj
 * @returns
 */
function sendProtocol(room: Room, id: proto.msg.MSG_ID, protoObj: any): void {
	const buff = getProtocolBuff(id, protoObj);
	if (!buff) {
		return;
	}
	room.send(MessageEvent.PROTO, buff);
}

cli(main);
