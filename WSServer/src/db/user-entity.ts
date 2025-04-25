import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity {
	@PrimaryGeneratedColumn()
	public uid: number

	@Column()
	public nickname: string;

	@Column()
	public openId: string;

	@Column("bigint")
	public createTime: number;

	@Column("bigint")
	public updateTime: number;
}
