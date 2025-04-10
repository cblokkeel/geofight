import type { Server } from "socket.io";

interface PlayerInfos {
	id: string;
	username: string;
	score: number;
}

interface Game {
	players: PlayerInfos[];
	currentFlag?: string;
	startTime?: number;
}

const activeGames: Record<string, Game> = {};

export function createGame(
	gameId: string,
	player1: Omit<PlayerInfos, "score">,
	player2: Omit<PlayerInfos, "score">,
) {
	activeGames[gameId] = {
		players: [
			{ ...player1, score: 0 },
			{ ...player2, score: 0 },
		],
	};
}

export function handlePlayerDisconnect(socketId: string, io: Server) {
	for (const gameId in activeGames) {
		const game = activeGames[gameId];
		const playerIndex = game.players.findIndex((p) => p.id === socketId);

		if (playerIndex !== -1) {
			const otherPlayer = game.players[playerIndex === 0 ? 1 : 0];
			io.to(otherPlayer.id).emit("opponentDisconnected");

			delete activeGames[gameId];
		}
	}
}
