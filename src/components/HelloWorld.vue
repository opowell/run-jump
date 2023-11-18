<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const score = ref(0)
const addBlockDelay = ref(0)
const playerJumpSpeed = ref(0)
const blocks = ref([550, 800])
const level = ref(1)
const nextLevelCounter = ref(100)
const blockWidth = ref(20)
let gameLoopInterval: number | undefined

const gameRef = ref(null)

const playerPosition = ref(5)
const playerWidth = 30
const playerLeft = 40
const playerStyle = computed(() => {
  return {
    bottom: playerPosition.value + 'px',
    left: playerLeft + 'px',
    width: playerWidth + 'px'
  }
})

const playerDead = ref(true)
const playerName = ref('')
const showNameEntry = computed(() => {
  return playerDead.value || playerName.value === ''
})

const scoresStoredString = window.localStorage.getItem('scores')
let scoresStored: any[]
if (scoresStoredString) {
  scoresStored = JSON.parse(scoresStoredString) 
} else
  scoresStored = []
scoresStored.sort((a: { score: number; }, b: { score: number; }) => b.score - a.score)
const scores = ref([...scoresStored])
const currentScore = ref()
const computedScores = computed(() => {
  let index = 0
  const all = scores.value.map((x: { name: any; score: any; time: string }) => {
    index = index + 1
    return {
      index,
      name: x.name,
      score: x.score,
      time: new Date(x.time),
      current: currentScore.value && new Date(x.time).getTime() === currentScore.value.time.getTime()
    }
  })
  const currentIndex = all.findIndex(x => x.current)
  const start = Math.max(currentIndex - 2, 0)
  return all.slice(start, start + 5)
})
const nameInputRef = ref(null)
onMounted(() => {
  nameInputRef?.value.focus()
})

function endGame() {
  currentScore.value = {
    name: playerName.value,
    score: score.value,
    time: new Date()
  }
  let insertIndex: number = -1
  for (let i = 0; i < scores.value.length; i++) {
    if (scores.value[i].score < currentScore.value.score) {
      insertIndex = i
      break
    }
  }
  if (insertIndex !== -1) {
    scores.value.splice(insertIndex, 0, currentScore.value)
  } else {
    scores.value.push(currentScore.value) - 1
  }
  window.localStorage.setItem('scores', JSON.stringify(scores.value))
  playerName.value = ''
  nameInputRef?.value.focus()
  clearInterval(gameLoopInterval)
}

const readyToStart = ref(true)
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
  gameRef?.value.focus()
  gameLoopInterval = setInterval(() => {
    if (playerDead.value) {
      endGame()
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
    blocks.value = blocks.value.filter((x: number) => x >= -20)
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
    <div>Run-Jump</div>
    <div v-if="showNameEntry" class="enter-name">
      <div class="title">Run-Jump</div>
      <div class="scores">
        <div class="scores-list-entry" v-for="(s, i) in computedScores" :key="i" :class="{ highlight: s.current }">
          {{ s.index }}. {{ s.score }} {{ s.name }}
        </div>
      </div>
      <div>
        <div>Type your name and press Enter:</div>
        <input ref="nameInputRef" type="text" v-model="playerName" @keydown.enter="startGame">
      </div>
    </div>
    <div>
      <div>&nbsp;{{ playerName }}&nbsp;</div>
      <div class="level">Level {{ level }}</div>
      <div class="score">{{ score }}</div>
    </div>
    <div class="board">
      <div class="character" :style="playerStyle" />
      <div class="ground" />
      <div class="block" v-for="(block, index) in blocks" :key="index" :style="{ left: block + 'px', width: blockWidth + 'px' }"/> 
    </div>
  </div>
</template>

<style scoped>
.scores {
  display: flex;
  flex-direction: column;
  color: #AAA;
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
.enter-name {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  background-color: #2f2f2f;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
