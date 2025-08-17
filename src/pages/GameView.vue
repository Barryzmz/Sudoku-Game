<template>
  <div class="container-fluid">
    <div class="row align-items-start">
      <div class="col-2 d-flex flex-column gap-2"></div>
      <div class="col-8">
        <SudokuGrid :cells="cells" :hint-left="hintLeft" @update-cell="updateCell" @request-hint="onRequestHint" />
      </div>
      <div class="col-2 d-flex flex-column gap-2 bg-light p-3 min-vh-100">
        <div class="bg-light d-flex align-content-center p-2">
          <h5 class="text-dark my-0">Hints left：{{ hintLeft }}</h5>
        </div>
        <button class="btn btn-outline-primary" @click="newPuzzle">New Puzzle</button>
        <button class="btn btn-outline-secondary" @click="showHotKeyDialog = true">HotKey Settings</button>

        <div class="mt-auto pt-3 border-top">
          <button class="btn btn-primary w-100" @click="showSolveDialog = true">
            Show Solution
          </button>
        </div>
      </div>
    </div>
  </div>
  <SolveDialog v-model:open="showSolveDialog" :cells="cells" />
  <ShowSuccessDialog v-model:open="isSolved" @new-puzzle="newPuzzle" />
  <ShowHotKeyDialog v-model:open="showHotKeyDialog" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SudokuGrid from '../components/SudokuGrid.vue'
import SolveDialog from '../components/SolveDialog.vue'
import ShowSuccessDialog from '../components/ShowSuccessDialog.vue'
import ShowHotKeyDialog from '../components/ShowHotKeyDiaglog.vue'
import { generateFullSolution } from '../lib/generator'

type Cell = { solve: number; input: number; given: boolean }

const cells = ref<Cell[][]>([])
const clues = ref(36) // 題目保留數：越少越難
const isSolved = ref(false)          // ✅ 是否通關
const hintLeft = ref(5) // 提示限制次數
const showSolveDialog = ref(false)
const showHotKeyDialog = ref(false)

onMounted(() => newPuzzle())

// 新的題目
function newPuzzle() {
  const solution = generateFullSolution()
  const mask = makePuzzleMask(clues.value) // true=保留
  cells.value = buildCells(solution, mask)
  isSolved.value = false
  hintLeft.value = 5
}

function updateCell({ r, c, val }: { r: number; c: number; val: number }) {
  // 只改非題目格
  if (!cells.value[r][c].given) {
    cells.value[r][c].input = (Number.isInteger(val) && val >= 1 && val <= 9) ? val : 0
  }
  isSolved.value = checkSolved(cells.value)
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

/* 檢查是否「所有非題目格都已填」且「input === solve」 */
function checkSolved(board: Cell[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = board[r][c]
      if (!cell.given) {
        if (cell.input === 0) return false     // 尚未填完
        if (cell.input !== cell.solve) return false // 有錯
      }
    }
  }
  return true
}

/* 隨機挖空 */
function makePuzzleMask(clues = 36) {
  const total = 81; // 總格數 81
  //保留數 "keep" 介於 20 ~ 81（17 是理論下限，太少很難有唯一解）
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

// 請求提示時：填入正解並扣一次
function onRequestHint() {
  hintLeft.value--
}

</script>