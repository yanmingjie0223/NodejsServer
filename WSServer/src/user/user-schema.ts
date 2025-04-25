import { Schema, type } from "@colyseus/schema";

export class UserSchema extends Schema {
	@type("number")
	public uid: number;

	@type("string")
	public nickname: string;

	@type("string")
	public openId: string;

	@type("number")
	public createTime: number;

	@type("number")
	public updateTime: number;

	@type("boolean")
	public connected: boolean;
}
