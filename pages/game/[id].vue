<script setup lang="ts">
const { $socket } = useNuxtApp();
const router = useRouter();

const hasOpponentDisconnected = ref(false);

onMounted(() => {
	$socket.on("opponentDisconnected", () => {
		hasOpponentDisconnected.value = true;
		setTimeout(() => {
			router.push("/");
		}, 3000);
	});
});

onUnmounted(() => {
	$socket.off("opponentDisconnected");
});
</script>

<template>
    <div class="flex flex-col items-center justify-center gap-4 h-screen">
        <h1 class="font-bold text-2xl text-(--ui-primary)">
            Geofight
        </h1>

        <div class="flex flex-col gap-2" v-if="hasOpponentDisconnected">
            <h2 class="font-bold text-2xl">
                Opponent Disconnected!
            </h2>

            <p class="text-sm text-(--ui-primary)">
                Redirecting to home...
            </p>
        </div>
    </div>
</template>
