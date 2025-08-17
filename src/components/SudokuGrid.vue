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
    <div v-if="selected" class="numpad text-dark bg-light p-2" style="height:60px;">
      <div class="numpad-row">
        <button v-for="n in 9" class="btn btn-primary" :key="n" @click="setNumber(n)">{{ n }}</button>
        <button class="btn btn-info" @click="clearNumber">clear</button>
        <button class="btn btn-success" @click="hint" :disabled="!canHint">hint</button>
        <button class="btn btn-outline-dark" @click="selected = null">close</button>
      </div>
    </div>

    <div v-else class="numpad" style="height:60px;"></div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed } from 'vue'

type Cell = { solve: number; input: number; given: boolean }

const props = defineProps<{ cells: Cell[][] ,hintLeft: number}>()
const emit = defineEmits<{
  (e: 'update-cell', payload: { r: number; c: number; val: number }): void
  (e: 'request-hint'): void   
}>()

const selected = ref<{ r: number; c: number } | null>(null)
const tableRef = ref<HTMLTableElement | null>(null)

const canHint = computed(() => {
  if (!selected.value) 
    return false
  const { r, c } = selected.value
  if (props.cells[r][c].given) 
    return false
  return props.hintLeft > 0
})

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

function hint() {
  if (!selected.value || props.hintLeft <= 0) 
    return
  const { r, c } = selected.value
  const cell = props.cells[r][c]
  if (cell.input === cell.solve) 
    return
  if (cell.given) 
    return

  // 直接用正解填入
  emit('update-cell', { r, c, val: cell.solve })
  emit('request-hint')
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
  } else if (e.key.toLowerCase() === 'h') {
    hint()
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
  --pad: 20px;
  --reserve-y: clamp(80px, 16vh, 160px);
  /* 底部要留給數字面板的高度，自己調整 */
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--pad);

  /* ✅ 用這個來控制棋盤大小，而不是去改 .grid 的 height */
  --board-size: min(calc(100dvh - 2*var(--pad) - var(--reserve-y)),
      calc(100vw - 2*var(--pad)));
}

/* 表格改成固定布局，並指定正方形大小 */
.grid {
  /* table-layout: fixed; */
  border-collapse: collapse;
  background: #fff;
  outline: none;

  width: var(--board-size);
  height: var(--board-size);
  /* ✅ 有高度，row 的百分比高度才生效 */
}

/* 每格大小隨棋盤縮放：1/9 正方形；字體也跟著縮放 */
.cell {
  width: calc(var(--board-size) / 9);
  height: calc(var(--board-size) / 9);
  font-size: calc(var(--board-size) / 18);

  border: 1px solid #979faa;
  text-align: center;
  vertical-align: middle;
  font-weight: 600;
  color: #000;
  cursor: pointer;
}

.numpad-slot {
  width: var(--board-size);
  height: var(--reserve-y);
  /* 跟上面的變數對齊 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.numpad-row {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  /* 11 等分 */
  gap: 5px;
  /* 可選間距 */
  width: 100%;
}

/* 外框 & 3×3 粗線維持原來設定 */
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
  border-bottom: 4px solid #000;
}

.grid .cell:nth-child(3n) {
  border-right: 4px solid #000;
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
</style>
