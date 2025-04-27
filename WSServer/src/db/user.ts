import { Client, Room } from "colyseus";
import { UserEntity } from "./user-entity";
import { db } from "../manager/db";
import * as proto from "../protocol/index";

export class User {

	/**用户对应的数据库对象 */
	private _entity: UserEntity;
	/**用户数据 */
	private _userData: proto.msg.UserData;
	/**用户连接的客户端 */
	private _client: Client;
	/**用户所在的房间 */
	private _room: Room;

	public get client(): Client {
		return this._client;
	}

	public get userData(): proto.msg.UserData {
		return this._userData;
	}

	public get entity(): UserEntity {
		return this._entity;
	}

	public get room(): Room {
		return this._room;
	}

	public async initialize(
		openId: string,
		nickname: string,
		client: Client,
		room: Room
	): Promise<void> {
		this._client = client;
		this._room = room;

		if (!this._entity) {
			const userRepository = db.getConnection().getRepository(UserEntity);
			this._entity = await userRepository.createQueryBuilder("user")
				.where("user.openId = :openId", { openId: openId })
				.getOne();
			const ct = Date.now();
			if (!this._entity) {
				this._entity = new UserEntity();
				this._entity.openId = openId;
				this._entity.nickname = nickname;
				this._entity.createTime = ct;
				this._userData = proto.msg.UserData.create();
				this.userData.nickname = nickname;
				this.userData.openId = openId;
			}
			else {
				this._userData = this.getUserData(this._entity.data);
			}
			this._entity.updateTime = ct;
			this._entity.connected = true;
			await this.save();
		}
	}

	public async save(): Promise<void> {
		if (!this._entity) {
			return;
		}

		const userRepository = db.getConnection().getRepository(UserEntity);
		this.entity.data = this.getUserDataBuffer();
		await userRepository.save(this.entity);
	}

	private getUserDataBuffer(): Buffer {
		const writer = proto.msg.UserData.encode(this._userData);
		const uint8Array = writer.finish();
		const buffer = Buffer.from(uint8Array);
		return buffer;
	}

	private getUserData(buffer: Buffer): proto.msg.UserData {
		const uint8Array = new Uint8Array(buffer);
		const userData = proto.msg.UserData.decode(uint8Array);
		return userData;
	}

}
