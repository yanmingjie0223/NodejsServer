import { Schema, type } from "@colyseus/schema";

export class UserSchema extends Schema {
	@type({ map: "number" })
	public uid: number;

	@type({ map: "string" })
	public nickname: string;

	@type({ map: "string" })
	public openId: string;

	@type({ map: "number" })
	public createTime: number;

	@type({ map: "number" })
	public updateTime: number;
}
