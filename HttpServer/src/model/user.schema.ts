import { EntitySchema } from "typeorm";
import { User } from "./user.model";

export default new EntitySchema({
    name: "User",
    target: User,
    columns: {
        uid: {
            primary: true,
            type: "bigint",
            generated: true
        },
        nickname: {
            type: "varchar",
            nullable: true
        },
        openId: {
            type: "varchar"
        },
        createTime: {
            type: "bigint",
            nullable: true
        },
        updateTime: {
            type: "bigint",
            nullable: true
        },
    }
});