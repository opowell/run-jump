<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

const INITIAL_ADD_TREE_DELAY = 60
const score = ref(0)
const addBlockDelay = ref(0)
const addTreeDelay = ref(0)
const playerJumpSpeed = ref(0)
const lemmingJumpSpeed = ref(0)
const blocks = ref([550, 800])
const trees = ref(generateInitialTrees())
const level = ref(1)
const nextLevelCounter = ref(100)
const blockWidth = ref(20)
let gameLoopInterval: number | undefined

const gameRef = ref(null)

const playerBasePosition = 5 //25
const lemmingBasePosition = 5 //57
const playerPosition = ref(playerBasePosition)
const lemmingPosition = ref(lemmingBasePosition)
const playerWidth = 30
const lemmingWidth = 10
const playerLeft = 140
const lemmingHeadstart = 200
const lemmingLeft = playerLeft + lemmingHeadstart
const playerStyle = computed(() => {
  return {
    bottom: playerPosition.value + 'px',
    left: playerLeft + 'px',
    width: playerWidth + 'px'
  }
})
const lemmingStyle = computed(() => {
  return {
    bottom: lemmingPosition.value + 'px',
    left: lemmingLeft + 'px',
    width: lemmingWidth + 'px'
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

const lemmingActiveBlock = computed(() => {
  return blocks.value.find(b => b > lemmingLeft && b - lemmingLeft < 60)
})

const nameInputRef = ref(null)

function asyncToRef(callback) {

  const val = ref();
  watch(() => callback(), promise => promise.then(value => val.value = value), { immediate: true });  // TBD handle catch()...
  return val;
}
const treeSvg = asyncToRef(() => import('../assets/tree.svg'))
onMounted(() => {
  nameInputRef?.value.focus()
})

const music = new Audio('./assets/music.mp3')
music.loop = true
const grizz = new Audio('./assets/grizz.mp3')
const lemmings = new Audio('./assets/lemmings.mp3')

function endGame() {
  music.pause()
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

function generateTree(x: number): Tree {
  return {
    x: Math.random() * 100 - 50 + x,
    y: Math.random() * 30 + 15
  }
}

function generateInitialTrees(): Tree[] {
  return [
    generateTree(300),
    generateTree(450),
    generateTree(600),
    generateTree(750),
    generateTree(900)
  ]
}

interface Tree {
  x: number
  y: number
}

const readyToStart = ref(true)
function startGame() {
  if (playerName.value === '') return
  music.currentTime = 0
  music.play()
  readyToStart.value = false
  score.value = 0
  level.value = 1
  nextLevelCounter.value = 100
  blocks.value = [550, 800]
  trees.value = generateInitialTrees()
  addBlockDelay.value = 5
  addTreeDelay.value = INITIAL_ADD_TREE_DELAY
  playerPosition.value = playerBasePosition
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
    if (playerPosition.value > playerBasePosition) {
      playerJumpSpeed.value = playerJumpSpeed.value - 5
    }
    playerPosition.value = Math.max(playerPosition.value + playerJumpSpeed.value, playerBasePosition)
    if (playerPosition.value === playerBasePosition) {
      playerJumpSpeed.value = 0
    }
    for (let i = 0; i < blocks.value.length; i++) {
      blocks.value[i] = blocks.value[i] - (7 + 2 * level.value)
    }
    for (let i = 0; i < trees.value.length; i++) {
      trees.value[i].x = trees.value[i].x - 3
    }
    blocks.value = blocks.value.filter((x: number) => x >= -20)
    trees.value = trees.value.filter((tree: Tree) => tree.x >= -50)
    if (addBlockDelay.value > 0) {
      addBlockDelay.value = addBlockDelay.value - (1 + level.value / 3)
    }
    if (addTreeDelay.value > 0) {
      addTreeDelay.value = addTreeDelay.value - 1
    }
    if (addBlockDelay.value <= 0) {
      if (Math.random() > 0.7) {
        blocks.value.push(1000)
        addBlockDelay.value = 30
      }
    }
    if (addTreeDelay.value <= 0) {
      trees.value.push(generateTree(1100))
      addTreeDelay.value = INITIAL_ADD_TREE_DELAY
    }
    if (playerPosition.value < 20 && blocks.value[0] > playerLeft && blocks.value[0] <= playerLeft + playerWidth) {
      playerDead.value = true
    }
    if (lemmingPosition.value > lemmingBasePosition) {
      lemmingJumpSpeed.value = lemmingJumpSpeed.value - 5
    }
    if (lemmingActiveBlock && lemmingLeft - lemmingActiveBlock.value < 20 && lemmingPosition.value === lemmingBasePosition) {
      if (lemmingPosition.value === lemmingBasePosition) {
        lemmings.currentTime = 0
        lemmings.play()
        lemmingJumpSpeed.value = 22
      }
    }
    lemmingPosition.value = Math.max(lemmingPosition.value + lemmingJumpSpeed.value, lemmingBasePosition)
    if (lemmingPosition.value === lemmingBasePosition) {
      lemmingJumpSpeed.value = 0
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
  if (playerPosition.value === playerBasePosition) {
    playerJumpSpeed.value = 22
    grizz.currentTime = 0
    grizz.play()
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
      <div class="lemming" :style="lemmingStyle" />
      <div class="ground" />
      <div class="treeline" />
      <div class="block" v-for="(block, index) in blocks" :key="index"
        :style="{ left: block + 'px', width: blockWidth + 'px' }" />
      <span v-html="treeSvg" v-for="tree in trees" :key="tree" class="tree"
        :style="{ left: tree.x + 'px', bottom: tree.y + 'px' }" />
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
  background-color: rgb(96, 96, 96);
  position: absolute;
  bottom: 5px;
}

.score {
  color: yellow;
  margin-bottom: 2rem;
}

.character {
  height: 50px;
  background-color: rgb(97, 48, 0);
  position: absolute;
  z-index: 2;
}

.lemming {
  height: 15px;
  background-color: rgb(20, 190, 202);
  position: absolute;
  z-index: 2;
}

.tree {
  bottom: 50px;
  position: absolute;
  width: 50px;
}

.ground {
  height: 5px;
  /* width: 110%; */
  width: 100%;
  background-color: lightgray;
  bottom: 0;
  position: absolute;
  /* transform: rotate(-10deg) translateY(-80px); */
}

.treeline {
  height: 2px;
  /* width: 110%; */
  width: 100%;
  background-color: rgb(68, 41, 0);
  bottom: 70px;
  position: absolute;
  /* transform: rotate(-10deg) translateY(-80px); */
}

.board {
  background-color: black;
  height: 300px;
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
  z-index: 3;
  background-color: #2f2f2f;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 450px;
}
</style>
