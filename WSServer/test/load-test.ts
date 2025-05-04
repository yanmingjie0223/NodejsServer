import { Client, Room } from "colyseus.js";
import { cli, Options } from "@colyseus/loadtest";
import * as proto from "../src/protocol/index";
import { getProtocol, sendProtocol } from "../src/utils/protocol-utils";
import { MessageEvent } from "../src/rooms/message-event";

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
		const protoObj = getProtocol<proto.user.S2C_Login>(buff);
		console.log(protoObj);

		room.onLeave((code) => {
			console.log("leave");
		});
	});

	room.onStateChange((state) => {
		// console.log("state change:", state);
	});

	const loginData = proto.user.C2S_Login.create();
	loginData.nickname = "ymj";
	sendProtocol(room as any, proto.msg.MsgId.User_C2S_Login, loginData, MessageEvent.LOGIN);
}

cli(main);
