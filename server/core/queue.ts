import type { Server } from "socket.io";
import { createGame } from "./game";

let queue: { id: string; username: string }[];

function getQueue() {
	if (!queue) {
		queue = [];
	}
	return queue;
}

export function joinQueue(username: string, socketId: string, io: Server) {
	const queue = getQueue();

	const existingIndex = queue.findIndex((user) => user.id === socketId);

	if (existingIndex !== -1) {
		queue.splice(existingIndex, 1);
	}

	queue.push({ id: socketId, username });
	console.log("Queue updated:", queue);

	if (queue.length < 2) {
		return;
	}
	const player1 = queue.shift()!;
	const player2 = queue.shift()!;

	const gameId = `game_${Date.now()}`;

	createGame(gameId, player1, player2);

	io.to(player1.id)
		.to(player2.id)
		.emit("gameMatched", {
			gameId,
			opponent: {
				[player1.id]: player2.username,
				[player2.id]: player1.username,
			},
		});
}

export function leaveQueue(socketId: string) {
    const queue = getQueue();

	const index = queue.findIndex((user) => user.id === socketId);
	if (index !== -1) {
		queue.splice(index, 1);
	}
}
