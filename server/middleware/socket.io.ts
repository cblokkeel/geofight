import { defineEventHandler } from "h3";
import { Server } from "socket.io";
import { handlePlayerDisconnect, handlePlayerGuess, handlePlayerReady } from "../core/game";
import { joinQueue, leaveQueue } from "../core/queue";

export let io: Server;

export default defineEventHandler((event) => {
	// @ts-ignore
	const server = event.node.res.socket?.server;

	if (!io) {
		io = new Server(server, {
			cors: {
				origin:
					process.env.NODE_ENV === "development"
						? "http://localhost:3000"
						: "TODO",
				methods: ["GET", "POST"],
				credentials: true,
			},
		});

		io.on("connection", (socket) => {
			console.log("User connected:", socket.id);

			socket.on("joinQueue", (username: string) => {
				joinQueue(username, socket.id, io);
			});

			socket.on("leaveQueue", () => {
				leaveQueue(socket.id);
			});

			socket.on("disconnect", () => {
				leaveQueue(socket.id);
				handlePlayerDisconnect(socket.id);
			});

            socket.on("playerReady", (gameId: string) => {
                handlePlayerReady(socket.id, gameId);
            });

            socket.on("submitGuess", ({ gameId, guess }) => {
                console.log("Guess received:", guess);
                handlePlayerGuess(socket.id, gameId, guess);
            });
		});
	}
});
