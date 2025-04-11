import { io } from "../middleware/socket.io";
import { getRandomFlag } from "./flags";

interface PlayerInfos {
	id: string;
	username: string;
	score: number;
	ready?: boolean;
}

interface Game {
	players: PlayerInfos[];
	currentFlag?: {
		code: string;
		name: string;
		imageUrl: string;
	};
	startTime?: number;
	guesses: Record<string, { guess: string; time: number }>;
	roundTimeout?: NodeJS.Timeout;
	roundNumber: number;
}

export const activeGames: Record<string, Game> = {};

export function createGame(
	gameId: string,
	player1: Omit<PlayerInfos, "score" | "ready">,
	player2: Omit<PlayerInfos, "score" | "ready">,
) {
	activeGames[gameId] = {
		players: [
			{ ...player1, score: 0 },
			{ ...player2, score: 0 },
		],
		guesses: {},
		roundNumber: 0,
	};
}

export function handlePlayerDisconnect(socketId: string) {
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

function startGame(gameId: string) {
	if (!activeGames[gameId]) {
		return;
	}

	const game = activeGames[gameId];

	game.players.forEach((player) => {
		io.to(player.id).emit("gameStarting", {
			opponent: game.players.find((p) => p.id !== player.id)?.username,
		});
	});

	setTimeout(() => {
		startRound(gameId);
	}, 3000);
}

function startRound(gameId: string) {
	const game = activeGames[gameId];
	if (!game) return;

	game.roundNumber++;

	const randomFlag = getRandomFlag();
	game.currentFlag = randomFlag;
	game.startTime = Date.now();
	game.guesses = {};

	game.players.forEach((player) => {
		io.to(player.id).emit("newRound", {
			roundNumber: game.roundNumber,
			flagUrl: randomFlag.imageUrl,
		});
	});

	game.roundTimeout = setTimeout(() => {
		endRound(gameId);
	}, 5000);
}

function endRound(gameId: string, winnerId?: string) {
	const game = activeGames[gameId];
	if (!game || !game.currentFlag) {
		return;
	}

	const roundWinner = winnerId || null;

	game.players.forEach((player) => {
		io.to(player.id).emit("roundEnd", {
			correctAnswer: game.currentFlag?.name,
			winner: roundWinner
				? game.players.find((p) => p.id === roundWinner)?.username
				: null,
			scores: {
				[player.username]: player.score,
				[game.players.find((p) => p.id !== player.id)?.username || ""]:
					game.players.find((p) => p.id !== player.id)?.score || 0,
			},
			yourGuess: game.guesses[player.id]?.guess || null,
			opponentGuess:
				game.guesses[game.players.find((p) => p.id !== player.id)?.id || ""]
					?.guess || null,
			winnerId: roundWinner
				? game.players.find((p) => p.id === roundWinner)?.username
				: null,
		});
	});

	const gameWinner = game.players.find((p) => p.score >= 5);

	if (!gameWinner) {
		setTimeout(() => {
			startRound(gameId);
		}, 3000);
		return;
	}

	game.players.forEach((player) => {
		io.to(player.id).emit("gameOver", {
			winner: gameWinner.username,
			finalScores: {
				[player.username]: player.score,
				[game.players.find((p) => p.id !== player.id)?.username || ""]:
					game.players.find((p) => p.id !== player.id)?.score || 0,
			},
		});
	});

	setTimeout(() => {
		delete activeGames[gameId];
	}, 10000);
}

export function handlePlayerReady(socketId: string, gameId: string) {
	if (!activeGames[gameId]) {
		return;
	}

	const game = activeGames[gameId];
	const playerIndex = game.players.findIndex((p) => p.id === socketId);

	if (playerIndex === -1) {
		return;
	}

	if (!game.players[playerIndex].ready) {
		game.players[playerIndex].ready = true;
	}

	if (game.players.every((p) => p.ready)) {
		startGame(gameId);
	}
}

export function handlePlayerGuess(
	socketId: string,
	gameId: string,
	guess: string,
) {
	const game = activeGames[gameId];
	if (!game || !game.currentFlag) {
		console.log("Game not found:", gameId);
		return;
	}

	const playerIndex = game.players.findIndex((p) => p.id === socketId);
	if (playerIndex === -1) {
		console.log("Player not found:", socketId);
		return;
	}

	game.guesses[socketId] = {
		guess,
		time: Date.now() - (game.startTime || 0),
	};

	const isCorrect =
		guess.trim().toLowerCase() === game.currentFlag.name.trim().toLowerCase();

	if (!isCorrect) {
		return;
	}

	if (game.roundTimeout) {
		clearTimeout(game.roundTimeout);
	}

	game.players[playerIndex].score++;

	endRound(gameId, socketId);
}
