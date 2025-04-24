import { Client, Room } from "colyseus.js";
import { cli, Options } from "@colyseus/loadtest";
import { MSG_ID } from "../../src/protocol/msg";
import { C2S_Login } from "../../src/protocol/login";

/**
 * 连接测试
 * @param options
 */
export async function main(options: Options) {
	const client = new Client(options.endpoint);
	const room: Room = await client.joinOrCreate(options.roomName, {
		// your join options here...
	});

	console.log("joined successfully!");

	const loginData = C2S_Login.create();
	loginData.account = "ymj";
	const binaryWriter = C2S_Login.encode(loginData);
	room.send("proto", { id: MSG_ID.Login_C2S_Login, buff: binaryWriter.finish() });

	room.onMessage("message-type", (payload) => {
		// logic
	});

	room.onStateChange((state) => {
		console.log("state change:", state);
	});

	room.onLeave((code) => {
		console.log("left");
	});
}

cli(main);
