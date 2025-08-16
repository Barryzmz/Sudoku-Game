<template>
  <div class="wrap">
    <table class="grid" @keydown.stop.prevent="onKeydown" tabindex="0" ref="tableRef">
      <tbody>
        <tr v-for="(row, r) in cells" :key="r">
          <td v-for="(cell, c) in row" :key="c" class="cell" :class="tdClass(r, c)" @click="onCellClick(r, c)">
            <span v-if="givenMask[r][c]">{{ cell.solve }}</span>
            <span v-else>{{ cell.input || '' }}</span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 簡易數字選單 -->
    <div v-if="selected" class="numpad">
      <button v-for="n in 9" :key="n" @click="setNumber(n)" style="color: black;">{{ n }}</button>
      <button @click="clearNumber" style="color: black;">清除</button>
      <button @click="selected = null" style="color: black;">關閉</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  solution: number[][], // 完整解 9x9(1..9)
  clues?: number        // 挖空後保留提示數
}>()

const cells = ref(createEmptyCells())                   // 內部狀態：9x9 的物件矩陣，每格 { solve, input }
const givenMask = ref(makeEmptyMask())                  // 9x9 題目遮罩
const selected = ref<{ r: number, c: number } | null>(null)    // 目前選取格
const tableRef = ref<HTMLTableElement | null>(null)

// 監聽外部傳入的完整解 -> 建立 cells + 挖空
watch(
  () => [props.solution, props.clues],
  async ()  => {
    selected.value = null
    if (!is9x9Numbers(props.solution)) {
      console.warn('[SudokuGrid] solution 非 9x9(1..9)')
      cells.value = createEmptyCells()
      givenMask.value = makeEmptyMask()
      return
    }
    console.log('props.solution:', props.solution)
    console.log('props.clues:', props.clues)
    cells.value = buildCellsFromSolution(props.solution)
    givenMask.value = makePuzzleMask(props.clues) // 簡版：隨機挖空
    await nextTick()
  },
  { immediate: true, deep: true }
)

// 點格子 = 選取（題目格不可選）
function onCellClick(r: number, c: number) {
  if (givenMask.value[r][c]) return
  selected.value = { r, c }
  // 讓鍵盤事件能作用
  tableRef.value?.focus()
}

// 設定數字 / 清除
function setNumber(n: number) {
  if (!selected.value) return
  const { r, c } = selected.value
  if (!givenMask.value[r][c]) cells.value[r][c].input = n
  selected.value = null
}

function clearNumber() {
  if (!selected.value) return
  const { r, c } = selected.value
  if (!givenMask.value[r][c]) cells.value[r][c].input = 0
  selected.value = null
}

// 鍵盤輸入：1-9 填入；0/Backspace/Delete 清除；Esc 取消
function onKeydown(e: KeyboardEvent) {
  if (!selected.value) return
  if (/^[1-9]$/.test(e.key)) {
    setNumber(Number(e.key))
  } else if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') {
    clearNumber()
  } else if (e.key === 'Escape') {
    selected.value = null
  }
}

/* 檢查傳入的資料結構是否為 9×9、每格是 1..9 的整數（不接受 0）*/
function is9x9Numbers(m: any) {
  return Array.isArray(m) && m.length === 9 &&
    m.every(row => Array.isArray(row) && row.length === 9 &&
      row.every((n: number) => Number.isInteger(n) && n >= 1 && n <= 9))
}

/* 建立一份全是 0 的空白 9×9 物件矩陣。 */
function createEmptyCells() {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => ({ solve: 0, input: 0 }))
  )
}

/* 把 9×9 整數矩陣轉成 9×9 物件矩陣， */
function buildCellsFromSolution(sol: number[][]) {
  return Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => ({
      solve: Number(sol[r][c]) || 0,
      input: 0
    }))
  )
}

function makeEmptyMask() {
  return Array.from({ length: 9 }, () => Array(9).fill(false))
}

/* 隨機挖空 */
function makePuzzleMask(clues = 36) {
  const total = 81; // 總格數 81
  //保留數 "keep" 介於 20 ~ 81（17 是理論下限，太少很難有唯一解）
  // const keep = 80
  const keep = Math.max(20, Math.min(total, Math.floor(clues)))

  const idxs = Array.from({ length: total }, (_, i) => i)
  for (let i = idxs.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;[idxs[i], idxs[j]] = [idxs[j], idxs[i]]
  }
  const keepSet = new Set(idxs.slice(0, keep))
  const mask = makeEmptyMask()
  for (let i = 0; i < total; i++) mask[Math.floor(i / 9)][i % 9] = keepSet.has(i)
  return mask
}

/* 算出某一格 <td> 要套哪些 CSS 類別 */
function tdClass(r: number, c: number) {
  // 題目格：直接回傳 'given'
  if (givenMask.value[r][c]) {
    return ['given'];
  }

  // 非題目格
  const classes: string[] = [];
  const val = cells.value[r][c].input;
  const solveVal = cells.value[r][c].solve;

  // 有輸入：加上 user-input；若不等於解答再加 wrong
  if (val !== 0) {
    classes.push('user-input');
    if (val !== solveVal) {
      classes.push('wrong');
    }
  }

  // 被選取：加上 active
  if (selected.value && selected.value.r === r && selected.value.c === c) {
    classes.push('active');
  }

  return classes;
}
</script>

<style scoped>
.wrap {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 表格 */
.grid {
  border-collapse: collapse;
  background: #fff;
  outline: none;
}

.cell {
  width: 48px;
  height: 48px;
  border: 1px solid #cbd5e1;
  text-align: center;
  vertical-align: middle;
  font-size: 18px;
  font-weight: 600;
  color: #000;
  cursor: pointer;
}

.grid tr:first-child .cell {
  border-top: 4px solid #000;
}

.grid tr:last-child .cell {
  border-bottom: 4px solid #000;
}

.grid .cell:first-child {
  border-left: 4px solid #000;
}

.grid .cell:last-child {
  border-right: 4px solid #000;
}

.grid tr:nth-child(3n) .cell {
  border-bottom: 2px solid #000;
}

.grid .cell:nth-child(3n) {
  border-right: 2px solid #000;
}

/* 題目格：黑字更醒目且不可點 */
.cell.given {
  color: #000;
  font-weight: 800;
  cursor: default;
}

/* 玩家輸入：藍色字 */
.cell.user-input {
  color: #1d4ed8;
  font-weight: 800;
  cursor: default;
}

/* 玩家輸入：藍色字 */
.cell.user-input.wrong {
  color: #f00;
  font-weight: 800;
  cursor: default;
}

/* 選取中的格子高亮 */
.cell.active {
  outline: 2px solid #2563eb;
  outline-offset: -2px;
  background: #eef2ff;
}

/* 簡易數字選單 */
.numpad {
  margin-top: 12px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.numpad button {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
}

.numpad button:hover {
  background: #f3f4f6;
}
</style>
