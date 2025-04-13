<script setup lang="ts">
definePageMeta({
	middleware: ["game-auth"],
});

const { $socket } = useNuxtApp();
const router = useRouter();

const userStore = useUserStore();

const { username } = toRefs(userStore);

const route = useRoute();
const gameId = ref(route.params.id);

const guessInput = ref<HTMLInputElement>();

const opponent = ref("");
const roundNumber = ref(0);
const currentFlag = ref("");
const guess = ref("");
const gameMessage = ref("");
const score = ref(0);
const opponentScore = ref(0);
const correctAnswer = ref("");
const winner = ref("");

const hasOpponentDisconnected = ref(false);
const gameStarted = ref(false);
const betweenRounds = ref(false);
const isReady = ref(false);
const canGuess = ref(false);

const countdown = ref(0);

let interval: NodeJS.Timeout;

function readyUp() {
	isReady.value = true;
	$socket.emit("playerReady", gameId.value);
}

function submitGuess() {
	$socket.emit("submitGuess", { gameId: gameId.value, guess: guess.value });
}

const hasAWinner = computed(() => winner.value !== "");

onMounted(() => {
	$socket.on("opponentDisconnected", () => {
		hasOpponentDisconnected.value = true;
		setTimeout(() => {
			router.push("/");
		}, 3000);
	});

	$socket.on("gameStarting", ({ opponent: _opponent }) => {
		gameStarted.value = true;
		opponent.value = _opponent;

		countdown.value = 3;

		if (interval) {
			clearInterval(interval);
		}

		interval = setInterval(() => {
			countdown.value--;
			if (countdown.value === 0) {
				clearInterval(interval);
			}
		}, 1000);
	});

	$socket.on("newRound", ({ roundNumber: _roundNumber, flagUrl }) => {
        betweenRounds.value = false;
		roundNumber.value = _roundNumber;
		currentFlag.value = flagUrl;
		canGuess.value = true;
        gameMessage.value = "";

        nextTick(() => {
            // @ts-ignore
            guessInput.value?.inputRef?.focus();
        });

		if (interval) {
			clearInterval(interval);
		}

		countdown.value = 5;

		interval = setInterval(() => {
			countdown.value--;
			if (countdown.value === 0) {
				clearInterval(interval);
			}
		}, 1000);
	});

	$socket.on(
		"roundEnd",
		({ correctAnswer: _correctAnswer, scores, yourGuess, winner }) => {
            betweenRounds.value = true;
			canGuess.value = false;

            correctAnswer.value = _correctAnswer;

            if (winner === username.value) {
				gameMessage.value = "Correct! You got it!";
			} else if (winner === opponent.value) {
				gameMessage.value = `${opponent.value} guessed correctly!`;
			} else if (yourGuess) {
				gameMessage.value = "Wrong answer!";
			}

            score.value = scores[username.value] || 0;
            opponentScore.value = scores[opponent.value] || 0;

            guess.value = "";
		},
	);

    $socket.on("gameOver", ({ winner: _winner, finalScores }) => {
        betweenRounds.value = true;
        canGuess.value = false;
        gameMessage.value = `${winner} won the game!`;
        score.value = finalScores[username.value] || 0;
        opponentScore.value = finalScores[opponent.value] || 0;
        winner.value = _winner;

        setTimeout(() => {
            router.push("/");
        }, 5000);
    });
});

onUnmounted(() => {
	$socket.off("opponentDisconnected");
	$socket.off("gameStarting");
    $socket.off("newRound");
    $socket.off("roundEnd");
    $socket.off("gameOver");
});
</script>

<template>
    <div class="flex flex-col items-center justify-center gap-4 h-screen">
        <h1 class="font-bold text-2xl text-(--ui-primary)">
            Geofight
        </h1>

        <template v-if="!hasOpponentDisconnected">
            <div class="flex flex-col gap-6 items-center" v-if="!gameStarted">
                <div class="flex flex-col items-center gap-2">
                    <h2 class="font-bold text-2xl">
                        Preparing game...
                    </h2>
                    <p class="text-sm text-(--ui-primary)">Waiting for both players to be ready</p>
                </div>

                <UButton 
                    :label="isReady ? 'Ready!' : 'Ready Up'"
                    class="cursor-pointer w-fit" 
                    :disabled="isReady"
                    @click="readyUp"
                />
            </div>

            <div class="flex flex-col gap-2" v-if="gameStarted">
                <div class="flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                        <h2 class="font-bold text-2xl">
                            Opponent: {{ opponent }}
                        </h2>

                        <p class="text-sm text-(--ui-primary)" v-if="roundNumber > 0">
                            Round {{ roundNumber }}
                        </p>
                    </div>

                    <div class="flex items-center justify-center">
                        {{ username }}: {{ score }}
                        {{ opponent }}: {{ opponentScore }}
                    </div>
                </div>



                <p v-if="countdown > 0 && roundNumber === 0" class="text-sm text-(--ui-primary)">
                    Starting in {{ countdown }} seconds...
                </p>

                <div v-if="roundNumber > 0 && !hasAWinner" class="flex flex-col gap-2">
                    <p v-if="countdown > 0 && !betweenRounds" class="text-sm text-(--ui-primary)">
                        {{ countdown }} seconds left...
                    </p>

                    <p v-if="betweenRounds && correctAnswer" class="text-sm text-(--ui-primary)">
                        Correct answer: {{ correctAnswer }}
                    </p>

                    <img :src="currentFlag" class="w-full max-w-xs" />
                    {{ currentFlag }}

                    <UInput 
                        v-model="guess"
                        ref="guessInput"
                        :disabled="!canGuess"
                        autofocus
                        placeholder="Enter your guess..."
                        @keydown.enter="submitGuess"
                    />

                    <p v-if="gameMessage" class="text-sm text-(--ui-primary) mt-2">
                        {{ gameMessage }}
                    </p>
                </div>  

                <div v-if="hasAWinner" class="flex flex-col gap-2">
                    <h2 class="font-bold text-2xl">
                        Game Over! {{ winner }} wins!
                    </h2>

                    <p class="text-sm text-(--ui-primary) self-center">
                        Redirecting to home...
                    </p>
                </div>
            </div>
        </template>

        <div class="flex flex-col gap-2" v-else>
            <h2 class="font-bold text-2xl">
                Opponent Disconnected!
            </h2>

            <p class="text-sm text-(--ui-primary)">
                Redirecting to home...
            </p>
        </div>
    </div>
</template>
