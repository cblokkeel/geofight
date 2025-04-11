import { defineNuxtRouteMiddleware } from "#app";

export default defineNuxtRouteMiddleware(async (to) => {
	if (process.server) {
		return;
	}

	const gameId = to.params.id;
	const nuxtApp = useNuxtApp();

	const router = useRouter();

	const socket = nuxtApp.$socket;

	if (!socket || !socket.id) {
		console.error("Socket connection not available");
		setTimeout(() => {
			router.push("/");
		}, 500);
	}

	try {
		const response = await fetch("/api/game/validate", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				gameId,
				playerId: socket.id,
			}),
		});

		if (!response.ok) {
			setTimeout(() => {
				router.push("/");
			}, 500);
		}
	} catch (error) {
		setTimeout(() => {
			router.push("/");
		}, 500);
	}
});
