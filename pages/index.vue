<script setup lang="ts">
import { useUserStore } from "~/stores/user";

const { $socket } = useNuxtApp();
const router = useRouter();

const userStore = useUserStore();
const { username } = storeToRefs(userStore);

const inQueue = ref(false);
const gameFound = ref(false);

function handleQueue() {
	if (username.value.length < 3) {
		return;
	}

	$socket.emit("joinQueue", username.value);
	inQueue.value = true;
}

function leaveQueue() {
	$socket.emit("leaveQueue", username.value);
	inQueue.value = false;
}

onMounted(() => {
	$socket.on("gameMatched", ({ gameId }) => {
		gameFound.value = true;

		setTimeout(() => {
			router.push(`/game/${gameId}`);
		}, 1000);
	});
});

onUnmounted(() => {
	$socket.off("gameMatched");
});
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 h-screen">
    <h1 class="font-bold text-2xl text-(--ui-primary)">
        Geofight
    </h1>

    <div class="flex items-center gap-2" v-if="!gameFound">
      <UInput
        v-model="username"
        placeholder="Username" 
        icon="ph:user-duotone"
        :disabled="inQueue"
        @keydown.enter="handleQueue"
      />
      <UButton
        :label="inQueue ? 'Looking for opponent...' : 'Queue'"
        :trailing-icon="inQueue ? '' : 'ph:arrow-right-duotone'"
        class="cursor-pointer"
        :disabled="username.length < 3"
        :loading="inQueue"
        @click="handleQueue"
      />

      <UButton
        v-if="inQueue"
        label="Cancel"
        class="cursor-pointer"
        variant="subtle"
        color="error"
        @click="leaveQueue"
      />
    </div>

    <div class="flex flex-col gap-2" v-else>
      <h2 class="font-bold text-2xl">
          Game Found!
      </h2>

      <p class="text-sm text-(--ui-primary)">
        Redirecting to game...
      </p>
    </div>
  </div>
</template>
