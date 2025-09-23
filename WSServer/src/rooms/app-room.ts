import { Client, Room } from "colyseus";
import { AppSchema } from "./app-schema";
import { MessageEvent } from "./message-event";
import { checkoutSecret } from "../config/auth";
import { MessageQueue } from "./message-queue";

export class AppRoom extends Room {

	/**room state */
	public state: AppSchema;

	/**login message queue */
	private _msgQueue: MessageQueue;
	/**Whether active or not */
	private _active: boolean;

	public get active(): boolean {
		return this._active;
	}

	public override onBeforeShutdown(): void {
		this._active = false;
		const delay = this.clock.setInterval(() => {
			const hasMessageCount = this.state.onBeforeShutdown();
			if (hasMessageCount <= 0) {
				this.delayDisconnect();
				delay.clear();
			}
		}, 3 * 1000);
	}

	public onCreate(): void {
		this._active = true;
		this.autoDispose = false;
		this.state = new AppSchema();
		this._msgQueue = new MessageQueue(this);
		this.onMessage(MessageEvent.LOGIN, (client: Client, uint8s: Uint8Array) => {
			this._msgQueue.push(uint8s, client);
		});
		this.onMessage(MessageEvent.PROTO, (client: Client, uint8s: Uint8Array) => {
			const sessionId = client.sessionId;
			const user = this.state.getUserBySessionId(sessionId);
			if (user) {
				user.addMeesage(uint8s, client);
			}
		});
	}

	public onDispose(): void {
		this.state.clear();
		this._msgQueue.destroy();
	}

	public async onAuth(client: Client<any, any>, options: any): Promise<boolean> {
		const sessionId = client.sessionId;
		const user = this.state.getUserBySessionId(sessionId);
		if (!user && checkoutSecret(options.secret)) {
			return true;
		}
		return false;
	}

	public async onLeave(client: Client, consented: boolean): Promise<void> {
		const sessionId = client.sessionId;
		const user = this.state.getUserBySessionId(sessionId);
		if (user) {
			const entity = user.entity;
			if (entity) {
				user.entity.connected = false;
			}
			try {
				if (consented) {
					throw new Error("consented leave");
				}
				user.save();
				await this.allowReconnection(client, 20);
				if (entity) {
					user.entity.connected = true;
					user.save();
				}
			} catch (e) {
				user.save();
				this.state.delete(sessionId, user.getOpenId());
			}
		}
	}

	private delayDisconnect(): void {
		this.clock.setTimeout(() => {
			this.disconnect();
		}, 5 * 60 * 1000);
	}

}
