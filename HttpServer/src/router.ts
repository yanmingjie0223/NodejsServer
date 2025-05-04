import polka from "polka";
import { login } from "./controller/user-controller";

/**
 * 路由器配置类
 * @param app
 * @returns
 */
export default function (app: polka.Polka): polka.Polka {

	app.post('/login', login as any);

	return app;
}
