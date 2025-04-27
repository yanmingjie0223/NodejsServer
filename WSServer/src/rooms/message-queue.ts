import { Client, Room } from "colyseus";
import { dealProtocol } from "../utils/protocol-utils";

export interface MessageItem {
	client: Client;
	uint8s: Uint8Array;
}

export class MessageQueue {
	private _messageItems: MessageItem[] = [];
	private _dealing: boolean = false;
	private _isStop: boolean = false;
	private _room: Room;

	constructor(room: Room) {
		this._room = room;
	}

	public push(uint8s: Uint8Array, client: Client): void {
		this._messageItems.push({ client, uint8s });
		this.deal();
	}

	public pop(): MessageItem | null {
		return this._messageItems.pop();
	}

	public shift(): MessageItem | null {
		return this._messageItems.shift();
	}

	public stop(): void {
		this._isStop = true;
	}

	public resume(): void {
		this._isStop = false;
		this.deal();
	}

	private async deal(): Promise<void> {
		if (this._dealing) {
			return;
		}
		if (this._isStop) {
			return;
		}

		const messageItem = this.shift();
		if (messageItem) {
			this._dealing = true;
			await dealProtocol(this._room, messageItem.client, messageItem.uint8s);
			this._dealing = false;
			this.deal();
		}
		else {
			this._dealing = false;
		}
	}
}
