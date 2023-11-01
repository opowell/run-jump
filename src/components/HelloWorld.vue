<script setup lang="ts">
import { computed, ref } from 'vue'

const count = ref(0)
setInterval(() => {
  count.value = count.value + 1
}, 100)

const playerPosition = ref(5)
const blocks = ref([200, 450])
const playerStyle = computed(() => {
  return {
    bottom: playerPosition.value + 'px'
  }
})
</script>

<template>
  <div class="score">{{ count }}</div>
  <div class="board">
    <div class="character" :style="playerStyle" />
    <div class="ground" />
    <div class="block" v-for="(block, index) in blocks" :key="index" :style="{ left: block + 'px' }"/> 
  </div>
  <h1>Run-Jump</h1>
</template>

<style scoped>
.block {
  height: 60px;
  width: 30px;
  background-color: rgb(149, 6, 6);
  position: absolute;
  bottom: 5px;
}
.score {
  color: yellow;
  font-size: 36px;
  margin-bottom: 10rem;
  display: none;
}
.character {
  width: 40px;
  height: 80px;
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
}
</style>
