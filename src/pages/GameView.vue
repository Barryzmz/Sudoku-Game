<template>
  <!-- <h1>{{ msg }}</h1> -->
  <div class="container">
      <div class="row" >
        <div class="col">
          <SudokuGrid  :solution="solutionBoard"/>
        </div>
      </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import SudokuGrid from '../components/SudokuGrid.vue'

// 9×9 完整解（示例）
const solutionBoard = ref([
  [1,2,3,4,5,6,7,8,9],
  [4,5,6,7,8,9,1,2,3],
  [7,8,9,1,2,3,4,5,6],
  [2,1,4,3,6,5,8,9,7],
  [3,6,5,8,9,7,2,1,4],
  [8,9,7,2,1,4,3,6,5],
  [5,3,1,6,4,2,9,7,8],
  [6,4,2,9,7,8,5,3,1],
  [9,7,8,5,3,1,6,4,2],
])
</script>
<style scoped>
.read-the-docs {
  color: #888;
}
</style>
