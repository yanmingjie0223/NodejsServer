import * as proto from "../protocol/index";

/**
 * 获取协议解析对象
 * @param id
 * @param buff
 * @returns
 */
export function getProtocol<T>(id: proto.msg.MSG_ID, buff: Uint8Array): T {
	const idName = proto.msg.MSG_ID[id];
	if (!idName) {
		console.error(`msg.proto中未找到协议 id: ${id}`);
		return null;
	}

	const idNameArr = idName.split("_");
	if (idNameArr.length < 3) {
		console.error(`协议名定义: ID_协议文件模块_协议名字 例如: ID_Login_C2S_Login`);
		return null;
	}

	const pkgName = idNameArr.shift().toLowerCase();
	const protoName = idNameArr.join('_');
	const protoClass = (proto as any)[pkgName][protoName];
	if (!protoClass) {
		console.error(`未找到定义的协议`);
		return null;
	}

	const protoObj = protoClass.decode(buff);

	return protoObj as T;
}
