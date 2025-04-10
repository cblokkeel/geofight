import { io } from "socket.io-client";
import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin((_) => {
	const socket = io(process.server ? "" : window.location.origin, {
		autoConnect: true,
		reconnection: true,
	});

	return {
		provide: {
			socket,
		},
	};
});
