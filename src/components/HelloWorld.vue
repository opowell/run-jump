<script setup lang="ts">
import { computed, ref } from 'vue'

const score = ref(0)
let gameLoopInterval: number | undefined

const readyToStart = ref(true)
const playerDead = ref(true)
const addBlockDelay = ref(0)
const playerPosition = ref(5)
const playerJumpSpeed = ref(0)
const playerName = ref('')
const blocks = ref([550, 800])
const level = ref(1)
const nextLevelCounter = ref(100)
const playerWidth = 30
const playerLeft = 40
const blockWidth = ref(20)
const scores = ref([])
let scoresStored = window.localStorage.getItem('scores')
if (scoresStored) {
  scoresStored = JSON.parse(scoresStored) 
} else
  scoresStored = []
console.log(scoresStored)
scoresStored.sort((a, b) => b.score - a.score)
scores.value.push(...scoresStored)
const playerStyle = computed(() => {
  return {
    bottom: playerPosition.value + 'px',
    left: playerLeft + 'px',
    width: playerWidth + 'px'
  }
})
const showNameEntry = computed(() => {
  return playerDead.value || playerName.value === ''
})
const gameRef = ref(null)
const currentScore = ref()
function startGame() {
  if (playerName.value === '') return
  readyToStart.value = false
  score.value = 0
  level.value = 1
  nextLevelCounter.value = 100
  blocks.value = [550, 800]
  addBlockDelay.value = 5
  playerPosition.value = 5
  playerJumpSpeed.value = 0
  playerDead.value = false
  gameRef.value.focus()
  gameLoopInterval = setInterval(() => {
    if (playerDead.value) {
      currentScore.value = {
        name: playerName.value,
        score: score.value
      }
      scores.value.push(currentScore.value)
      scores.value.sort((a, b) => b.score - a.score)
      window.localStorage.setItem('scores', JSON.stringify(scores.value))
      playerName.value = ''
      clearInterval(gameLoopInterval)
      return
    }
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
    if (playerPosition.value < 20 && blocks.value[0] > playerLeft && blocks.value[0] <= playerLeft + playerWidth) {
      playerDead.value = true
    }
  }, 50)
}
function handleSpace() {
  if (readyToStart.value) {
    startGame()
  } else {
    jump()
  }
}
function jump() {
  if (playerPosition.value === 5) {
    playerJumpSpeed.value = 22
  }
}
</script>

<template>
  <div ref="gameRef" class="game" @keydown.space="handleSpace" tabindex="0">
    <div v-if="showNameEntry" class="enter-name">
      <div class="scores">
        <div class="scores-list-entry" v-for="(s, i) in scores" :key="i" :style="{ highlight: s === currentScore }">
          {{ i+1 }}. {{ s.score }} {{ s.name }}
        </div>
      </div>
      <br>
      <div>Type your name and press Enter:</div>
      <input type="text" v-model="playerName" @keydown.enter="startGame">
    </div>
    <div v-if="!showNameEntry">
      <div>{{ playerName }}</div>
      <div class="level">Level {{ level }}</div>
      <div class="score">{{ score }}</div>
    </div>
    <div class="board">
      <div class="character" :style="playerStyle" />
      <div class="ground" />
      <div class="block" v-for="(block, index) in blocks" :key="index" :style="{ left: block + 'px', width: blockWidth + 'px' }"/> 
    </div>
    <h1>Run-Jump</h1>
  </div>
</template>

<style scoped>
.scores {
  display: flex;
  flex-direction: column;
}
.block {
  height: 20px;
  background-color: rgb(149, 6, 6);
  position: absolute;
  bottom: 5px;
}
.score {
  color: yellow;
  margin-bottom: 2rem;
}
.character {
  height: 50px;
  background-color: green;
  position: absolute;
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
.game:focus {
  outline: none;
}
.highlight {
  color: yellow;
}
</style>
