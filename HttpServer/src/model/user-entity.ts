import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}
