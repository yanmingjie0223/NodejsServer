import config from "@colyseus/tools";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { LobbyRoom } from "colyseus";

export default config({
	options: {
		// devMode: true,
		// driver: new RedisDriver(),
		// presence: new RedisPresence(),
	},

	initializeTransport: (options) => new WebSocketTransport(options),

	initializeGameServer: (gameServer) => {
		/**
		 * Define your room handlers:
		 */

		gameServer.define('lobby', LobbyRoom);
	},

	initializeExpress: (app) => {

	},

	beforeListen: () => {

	}
});
