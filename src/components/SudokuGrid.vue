<template>
  <div class="wrap">
    <table class="grid">
      <tbody>
        <tr v-for="(row, r) in cells" :key="r">
          <td v-for="(cell, c) in row" :key="c" class="cell">
            {{ cell.solve }}  <!-- 先印出正確答案 -->
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  solution: { type: Array, required: true }
})

/** 內部狀態：9x9 的物件矩陣，每格 { solve, input } */
const cells = ref(createEmptyCells())

/** 監聽外部傳入的完整解 -> 建立 cells */
watch(
  () => props.solution,
  (sol) => {
    if (!is9x9Numbers(sol)) {
      console.warn('[SudokuGrid] solution 不是 9x9 數字矩陣')
      cells.value = createEmptyCells()
      return
    }
    cells.value = buildCellsFromSolution(sol)
  },
  { immediate: true, deep: true }
)

/* 建立一份全是 0 的空白 9×9 物件矩陣。 */
function createEmptyCells() {
  var cells = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => ({ solve: 0, input: 0 }))
  )
  console.log('createEmptyCells', cells)
  return cells
}

/* 把 9×9 整數矩陣轉成 9×9 物件矩陣， */
function buildCellsFromSolution(sol) {
  return Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => ({
      solve: Number(sol[r][c]) || 0,
      input: 0
    }))
  )
}

/* 檢查傳入的資料結構是否為 9×9、每格是 1..9 的整數（不接受 0）*/
function is9x9Numbers(m) {
  console.log('is9x9Numbers', m)
  return (
    Array.isArray(m) &&
    m.length === 9 &&
    m.every(
      (row) =>
        Array.isArray(row) &&
        row.length === 9 &&
        row.every((n) => Number.isInteger(n) && n >= 1 && n <= 9)
    )
  )
}
</script>

<style scoped>
.wrap {
  padding: 24px;
  display: flex;
  justify-content: center;
}

/* 基本表格樣式 */
.grid {
  border-collapse: collapse;
  background: #fff;
}

/* 每格外觀：細線 */
.cell {
  width: 48px;
  height: 48px;
  border: 1px solid #cbd5e1;
  text-align: center;
  vertical-align: middle;
  font-size: 18px;
  font-weight: 600;
  color: #000;
}

/* 外框粗線 */
.grid tr:first-child .cell { border-top: 4px solid #000; }
.grid tr:last-child  .cell { border-bottom: 4px solid #000; }
.grid .cell:first-child    { border-left: 4px solid #000; }
.grid .cell:last-child     { border-right: 4px solid #000; }

/* 每 3 格的粗線（3×3 區塊邊界） */
.grid tr:nth-child(3n) .cell { border-bottom: 2px solid #000; }
.grid .cell:nth-child(3n)    { border-right: 2px solid #000; }
</style>
