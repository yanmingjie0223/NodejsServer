import { Column, Entity, PrimaryGeneratedColumn, Repository } from "typeorm";
import { logger } from "../manager/log";
import * as proto from '../protocol/index';

@Entity({ name: "user" })
export class UserEntity {
	@PrimaryGeneratedColumn()
	public uid: number
	@Column('varchar')
	public nickname: string;
	@Column('varchar')
	public openId: string;
	@Column('bigint')
	public createTime: number;
	@Column('bigint')
	public updateTime: number;
	@Column('blob')
	public userData: Buffer;

	private _userData: proto.user.UserData;

	constructor(
		uid?: number,
		nickname: string = '',
		openId: string = '',
		createTime: number = 0,
		updateTime: number = 0,
		userData: Buffer = null
	) {
		this.uid = uid;
		this.nickname = nickname;
		this.openId = openId;
		this.createTime = createTime;
		this.updateTime = updateTime;
		this.userData = userData;
	}

	public getUserData(): proto.user.UserData {
		if (!this._userData) {
			this.initialize();
		}
		return this._userData;
	}

	public copyUserData(): proto.user.UserData {
		if (!this._userData) {
			this.initialize();
		}
		proto.user.UserData.create(this._userData);
		return proto.user.UserData.create(this._userData);
	}

	public setAvatarUrl(avatarUrl: string): void {
		if (!avatarUrl) {
			return;
		}
		if (!this._userData) {
			this.initialize();
		}
		this._userData.avatarUrl = avatarUrl;
	}

	public setNickname(nickname: string): void {
		if (!this._userData) {
			this.initialize();
		}
		if (!nickname) {
			return;
		}
		this._userData.nickname = nickname;
		this.nickname = nickname;
	}

	public initialize(): void {
		this._userData = this.getUserDataByBuffer(this.userData);
	}

	public reset(): void {
		if (!this._userData) {
			this.initialize();
		}
		const userData = this._userData;
		this.resetUserData(userData);
	}

	public async save(userRepository: Repository<UserEntity>): Promise<void> {
		this.userData = this.getUserDataBuffer();
		await userRepository.save(this);
	}

	private resetUserData(userData: proto.user.UserData): void {

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

	private getUserDataByBuffer(buffer: Buffer): proto.user.UserData {
		let userData: proto.user.UserData;
		if (!buffer) {
			userData = proto.user.UserData.create();
			this.resetUserData(userData);
			return userData;
		}

		const uint8Array = new Uint8Array(buffer);
		userData = proto.user.UserData.decode(uint8Array);
		return userData;
	}
}
