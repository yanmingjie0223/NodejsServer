import polka from "polka";
import { test } from "./controller/test-controller";

/**
 * 路由器配置类
 * @param app
 * @returns
 */
export default function (app: polka.Polka): polka.Polka {

	app.post('/test', test as any);

	return app;
}
