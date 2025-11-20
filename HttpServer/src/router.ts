import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { login } from "./controller/user-controller";

/**
 * 路由器配置类
 * @param app
 * @returns
 */
export default function (app: FastifyInstance): FastifyInstance {

	app.get('/ping', (request: FastifyRequest, reply: FastifyReply) => {
		reply.send({ code: 0 });
	});
	app.post('/login', login);

	return app;
}
