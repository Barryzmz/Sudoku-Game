<template>
  <div class="wrap">
    <table class="grid" @keydown.stop.prevent="onKeydown" tabindex="0" ref="tableRef">
      <tbody>
        <tr v-for="(row, r) in cells" :key="r">
          <td v-for="(cell, c) in row" :key="c" class="cell" :class="tdClass(r, c)" @click="onCellClick(r, c)">
            <span v-if="cell.given">{{ cell.solve }}</span>
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
import { ref } from 'vue'

type Cell = { solve: number; input: number; given: boolean }

const props = defineProps<{ cells: Cell[][] }>()
const emit = defineEmits<{
  (e: 'update-cell', payload: { r: number; c: number; val: number }): void
}>()

const selected = ref<{ r: number; c: number } | null>(null)
const tableRef = ref<HTMLTableElement | null>(null)


// 點格子 = 選取（題目格不可選）
function onCellClick(r: number, c: number) {
  if (props.cells[r][c].given) return
  selected.value = { r, c }
  tableRef.value?.focus()
}

// 設定數字
function setNumber(n: number) {
  if (!selected.value) return
  const { r, c } = selected.value
  if (!props.cells[r][c].given) emit('update-cell', { r, c, val: n })
  selected.value = null
}

// 清除數字
function clearNumber() {
  if (!selected.value) return
  const { r, c } = selected.value
  if (!props.cells[r][c].given) emit('update-cell', { r, c, val: 0 })
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

/* 用 if/else 易讀版：決定要套的 class */

/* 算出某一格 <td> 要套哪些 CSS 類別 */
function tdClass(r: number, c: number) {
  const cell = props.cells[r][c]
  if (cell.given) return ['given']

  const classes: string[] = []
  if (cell.input !== 0) {
    classes.push('user-input')
    if (cell.input !== cell.solve) classes.push('wrong')
  }
  if (selected.value && selected.value.r === r && selected.value.c === c) classes.push('active')
  return classes
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
