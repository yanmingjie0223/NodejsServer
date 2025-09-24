import { login } from "./controller/user-controller";
import { Express } from 'express';

/**
 * 路由器配置类
 * @param app
 * @returns
 */
export default function (app: Express): Express {

	app.post('/login', login as any);

	return app;
}
