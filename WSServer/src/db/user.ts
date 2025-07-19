import { Client, logger, Room } from "colyseus";
import { UserEntity } from "./user-entity";
import { db } from "../manager/db";
import * as proto from "../protocol/index";
import { MessageQueue } from "../rooms/message-queue";

export class User {

	/**The database entity corresponding to the user */
	private _entity: UserEntity;
	/**user data */
	private _userData: proto.user.UserData;
	/**user data dirty marking */
	private _dirty: boolean;
	/**The client connected by the user */
	private _client: Client;
	/**The room where the user is*/
	private _room: Room;
	/**user message queue */
	private _msgQueue: MessageQueue;

	public set client(value: Client) {
		this._client = value;
	}

	public get client(): Client {
		return this._client;
	}

	public get userData(): proto.user.UserData {
		return this._userData;
	}

	public get entity(): UserEntity {
		return this._entity;
	}

	public get room(): Room {
		return this._room;
	}

	public get msgQueue(): MessageQueue {
		return this._msgQueue;
	}

	public getOpenId(): string {
		if (!this._entity) {
			return "";
		}
		return this._entity.openId;
	}

	public setOpenId(openId: string): void {
		if (!this._entity) {
			return;
		}

		this._dirty = true;
		this._entity.openId = openId;
		this._userData.openId = openId;
	}

	public setAvatarUrl(avatarUrl: string): void {
		if (!avatarUrl) {
			return;
		}
		if (!this._entity) {
			return;
		}

		this._dirty = true;
		this._userData.avatarUrl = avatarUrl;
	}

	public setNickname(nickname: string): void {
		if (!this._entity) {
			return;
		}

		this._dirty = true;
		this._entity.nickname = nickname;
		this._userData.nickname = nickname;
	}

	public addMeesage(uint8s: Uint8Array, client: Client): void {
		this._msgQueue.push(uint8s, client);
	}

	public async initialize(openId: string, nickname: string, client: Client, room: Room): Promise<void> {
		this._client = client;
		this._room = room;
		this._msgQueue = new MessageQueue(room);

		if (!this._entity) {
			const userRepository = db.getConnection().getRepository(UserEntity);
			this._entity = await userRepository.createQueryBuilder("user")
				.where("user.openId = :openId", { openId: openId })
				.getOne();
			const ct = Date.now();
			if (!this._entity) {
				this._entity = new UserEntity();
				this._entity.createAt = ct;
				this._userData = proto.user.UserData.create();
				this.setOpenId(openId);
			}
			else {
				this._userData = this.getUserData(this._entity.data);
			}

			this.setNickname(nickname);
			this._entity.updateAt = ct;
			this._entity.connected = true;
			await this.save();
		}
	}

	public async save(): Promise<void> {
		if (!this._entity) {
			return;
		}
		if (!this._dirty) {
			return;
		}

		const userRepository = db.getConnection().getRepository(UserEntity);
		this.entity.data = this.getUserDataBuffer();
		if (this.entity.data) {
			await userRepository.save(this.entity);
			this._dirty = false;
		}
	}

	private getUserDataBuffer(): Buffer {
		try {
			const writer = proto.user.UserData.encode(this._userData);
			const uint8Array = writer.finish();
			const buffer = Buffer.from(uint8Array);
			return buffer;
		}
		catch (err) {
			logger.error(`err: buffer encode`, JSON.stringify(this._userData));
		}
		return null;
	}

	private getUserData(buffer: Buffer): proto.user.UserData {
		const uint8Array = new Uint8Array(buffer);
		const userData = proto.user.UserData.decode(uint8Array);
		return userData;
	}

}
