import { activeGames } from "~/server/core/game";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const { gameId, playerId } = body;

	if (!gameId || !playerId) {
		throw createError({
			statusCode: 400,
			statusMessage: "Bad Request",
			message: "Missing gameId or playerId",
		});
	}

	if (!activeGames[gameId]) {
		throw createError({
			statusCode: 404,
			statusMessage: "Not Found",
			message: "Game not found",
		});
	}

	const isPlayerInGame = activeGames[gameId].players.some(
		(player) => player.id === playerId,
	);

	if (!isPlayerInGame) {
		throw createError({
			statusCode: 403,
			statusMessage: "You are not authorized to join this game",
		});
	}

	return {
		valid: true,
		opponent: activeGames[gameId].players.find(
			(player) => player.id !== playerId,
		)?.username,
	};
});
