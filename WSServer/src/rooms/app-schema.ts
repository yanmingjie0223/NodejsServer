import { Schema } from "@colyseus/schema";
import { User } from "../db/user";

export class AppSchema extends Schema {
	public userMap: Map<string, User> = new Map();
}
