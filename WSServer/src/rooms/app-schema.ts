import { Schema } from "@colyseus/schema";
import { UserEntity } from "../db/user-entity";

export class AppSchema extends Schema {
	public userMap: Map<string, UserEntity> = new Map();
}
