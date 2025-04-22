import { Schema, type } from "@colyseus/schema";
import { User } from "../player/User";

export class AppSchema extends Schema {
	@type({ map: "string" })
	public userMap: Map<string, User> = new Map();
}
