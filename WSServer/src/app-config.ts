import config from "@colyseus/tools";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { LobbyRoom } from "colyseus";
import { AppRoom } from "./rooms/app-room";

export default config({

	options: {},

	initializeTransport: (options) => new WebSocketTransport(options),

	initializeGameServer: (gameServer) => {
		/**
		 * Define your room handlers:
		 */
		gameServer.define('app-room', AppRoom);

		gameServer.define('lobby', LobbyRoom);
	},

	initializeExpress: (app) => { },

	beforeListen: () => { }

});
