<template>
  <!-- <h1>{{ msg }}</h1> -->
  <div class="container">
      <div class="row" >
        <div class="col">
          <SudokuGrid  :solution="solutionBoard"/>
        </div>
      </div>
      <div class="position-fixed end-0 top-0 m-3 d-flex flex-column gap-2">
        <button class="btn btn-success" @click="regenerate">New Solution</button>
      </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import SudokuGrid from '../components/SudokuGrid.vue'
import { generateFullSolution } from '../lib/generator'

// 9×9 完整解（示例）
const solutionBoard = ref(generateFullSolution()) 

function regenerate() {
  solutionBoard.value = generateFullSolution()
}
</script>
<style scoped>
.read-the-docs {
  color: #888;
}
</style>
