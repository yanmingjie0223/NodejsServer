import { Schema } from "@colyseus/schema";
import { User } from "../db/user";

export class AppSchema extends Schema {
	public userSessionMap: Map<string, User> = new Map();
	public userOpenIdMap: Map<string, User> = new Map();
}
