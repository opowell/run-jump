<script setup lang="ts">
import { computed, ref } from 'vue'

const score = ref(0)
let gameLoopInterval: number | undefined

const playerDead = ref(true)
const addBlockDelay = ref(0)
const playerPosition = ref(5)
const playerJumpSpeed = ref(0)
const blocks = ref([550, 800])
const level = ref(1)
const nextLevelCounter = ref(100)
const playerStyle = computed(() => {
  return {
    bottom: playerPosition.value + 'px'
  }
})
function startGame() {
  score.value = 0
  level.value = 1
  nextLevelCounter.value = 100
  blocks.value = [550, 800]
  addBlockDelay.value = 30
  playerPosition.value = 5
  playerJumpSpeed.value = 0
  playerDead.value = false
  gameLoopInterval = setInterval(() => {
    score.value = score.value + level.value
    nextLevelCounter.value = nextLevelCounter.value - 1
    if (nextLevelCounter.value === 0) {
      level.value = level.value + 1
      nextLevelCounter.value = 100
    }
    if (playerPosition.value > 5) {
      playerJumpSpeed.value = playerJumpSpeed.value - 5
    }
    playerPosition.value = Math.max(playerPosition.value + playerJumpSpeed.value, 5)
    if (playerPosition.value === 5) {
      playerJumpSpeed.value = 0
    }
    for (let i = 0; i < blocks.value.length; i++) {
      blocks.value[i] = blocks.value[i] - (7 + 2*level.value)
    }
    blocks.value = blocks.value.filter(x => x >= -20)
    if (addBlockDelay.value > 0) {
      addBlockDelay.value = addBlockDelay.value - (1 + level.value/3)
    }
    if (addBlockDelay.value <= 0) {
      if (Math.random() > 0.7) {
        blocks.value.push(1000)
        addBlockDelay.value = 30
      }
    }
    if (playerPosition.value < 20 && blocks.value[0] > 43 && blocks.value[0] <= 61) {
      playerDead.value = true
      clearInterval(gameLoopInterval)
    }
  }, 100)
}
function handleSpace() {
  if (playerDead.value) {
    startGame()
  } else {
    jump()
  }
}
function jump() {
  if (playerPosition.value === 5) {
    playerJumpSpeed.value = 25
  }
}
</script>

<template>
  <div class="game" @keydown.space="handleSpace" tabindex="0">
    <div class="stopped">Dead: {{ playerDead }}</div>
    <div class="level">Level {{ level }}</div>
    <div class="score">{{ score }}</div>
    <div class="board">
      <div class="character" :style="playerStyle" />
      <div class="ground" />
      <div class="block" v-for="(block, index) in blocks" :key="index" :style="{ left: block + 'px' }"/> 
    </div>
    <h1>Run-Jump</h1>
  </div>
</template>

<style scoped>
.block {
  height: 20px;
  width: 20px;
  background-color: rgb(149, 6, 6);
  position: absolute;
  bottom: 5px;
}
.score {
  color: yellow;
  margin-bottom: 2rem;
}
.character {
  width: 40px;
  height: 70px;
  background-color: green;
  position: absolute;
  left: 20px;
}
.ground {
  height: 5px;
  width: 100%;
  background-color: lightgray;
  bottom: 0;
  position: absolute;
}
.board {
  background-color: black;
  height: 200px;
  width: 100%;
  position: relative;
  overflow: hidden;
}
</style>
