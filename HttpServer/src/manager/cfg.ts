import Singleton from "../base/singleton";
import ByteBuf from "../luban/bright/serialization/ByteBuf";
import * as cfg from "../luban/lubancode/schema";
import fs from "fs";

export class Config extends Singleton {

	public tables: cfg.Tables = null;
	private jsonFileNames: string[] = [];
	private dataMap = new Map<string, Uint8Array>();

	public override initialize(): void {
		this.jsonFileNames = cfg.Tables.getTableNames();

		for (const curFileName of this.jsonFileNames) {
			const bytes = fs.readFileSync(`./dist/src/luban/lubandata/${curFileName}.bytes`);
			this.dataMap.set(curFileName, new Uint8Array(bytes));
		}

		this.tables = new cfg.Tables(this.getFileData.bind(this));
		console.log("> config load complete ");
	}

	private getFileData(fileName: string): ByteBuf {
		if (this.dataMap.has(fileName)) {
			return new ByteBuf(this.dataMap.get(fileName));
		}
		return null;
	}

}

export const config: Config = Config.getInstance();
