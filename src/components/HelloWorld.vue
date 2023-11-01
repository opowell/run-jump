<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <div class="character" />
  <div class="ground" />
  <h1>Run-Jump</h1>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
.character {
  width: 40px;
  height: 80px;
  background-color: green;
}
.ground {
  height: 5px;
  width: 100%;
  background-color: lightgray;
}
</style>
