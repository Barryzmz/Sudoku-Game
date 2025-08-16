<template>
  <div class="container">
    <div class="row align-items-start">
      <div class="col">
        <SudokuGrid :cells="cells" @update-cell="updateCell" />
      </div>
      <div class="col-auto d-flex flex-column gap-2">
        <button class="btn btn-success" @click="newPuzzle">New Puzzle</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SudokuGrid from '../components/SudokuGrid.vue'
import { generateFullSolution } from '../lib/generator'

type Cell = { solve: number; input: number; given: boolean }

const cells = ref<Cell[][]>([])
const clues = ref(36) // 題目保留數：越少越難

onMounted(() => newPuzzle())

// 新的題目
function newPuzzle() {
  const solution = generateFullSolution()
  const mask = makePuzzleMask(clues.value) // true=保留
  cells.value = buildCells(solution, mask)
}

function updateCell({ r, c, val }: { r: number; c: number; val: number }) {
  // 只改非題目格
  if (!cells.value[r][c].given) {
    cells.value[r][c].input = (Number.isInteger(val) && val >= 1 && val <= 9) ? val : 0
  }
}

/* 把 9×9 整數矩陣轉成 9×9 物件矩陣， */
function buildCells(solution: number[][], mask: boolean[][]): Cell[][] {
  return Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => ({
      solve: solution[r][c],
      input: 0,
      given: !!mask[r][c]
    }))
  )
}

/* 隨機挖空 */
function makePuzzleMask(clues = 36) {
  const total = 81; // 總格數 81
  //保留數 "keep" 介於 20 ~ 81（17 是理論下限，太少很難有唯一解）
  // const keep = 80
  const keep = Math.max(20, Math.min(total, Math.floor(clues)))
  const idxs = Array.from({ length: total }, (_, i) => i)
  for (let i = total - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
      ;[idxs[i], idxs[j]] = [idxs[j], idxs[i]]
  }
  const keepSet = new Set(idxs.slice(0, keep))
  const mask = Array.from({ length: 9 }, () => Array(9).fill(false))

  for (let i = 0; i < total; i++) {
    mask[Math.floor(i / 9)][i % 9] = keepSet.has(i)
  }
  return mask
}

</script>


