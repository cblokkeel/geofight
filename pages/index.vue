<script setup lang="ts">
import { useUserStore } from '~/stores/user';

const userStore = useUserStore();

const { username } = storeToRefs(userStore);

function handleQueue() {
    // Emit queue event 
}

// onMounted, connect to waiting WS
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 h-screen">
    <h1 class="font-bold text-2xl text-(--ui-primary)">
        Geofight
    </h1>

    <div class="flex items-center gap-2">
      <UInput
        v-model="username"
        placeholder="Username" 
        icon="ph:user-duotone"
        @keydown.enter="handleQueue"
      />
      <UButton
        label="Queue"
        trailing-icon="ph:arrow-right-duotone"
        class="cursor-pointer"
        :disabled="username.length < 3"
        @click="handleQueue"
      />
    </div>
  </div>
</template>
