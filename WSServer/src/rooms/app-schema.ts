import { MapSchema, Schema, type } from "@colyseus/schema";
import { UserSchema } from "../user/user-schema";

export class AppSchema extends Schema {
	@type({ map: UserSchema })
	public userMap: MapSchema<UserSchema, string> = new MapSchema();
	@type({ map: UserSchema })
	public jointUserMap: MapSchema<UserSchema, string> = new MapSchema();
}
