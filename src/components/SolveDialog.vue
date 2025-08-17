<template>
    <Teleport to="body">
        <div class="modal fade" tabindex="-1" ref="el" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered ">
                <div class="modal-content">
                    <div class="modal-body">
                        <div class="wrap">
                            <table class="grid" tabindex="0" ref="tableRef">
                                <tbody>
                                    <tr v-for="(row, r) in cells" :key="r">
                                        <td v-for="(cell, c) in row" :key="c"
                                            :class="['cell', { given: cell.given, editable: !cell.given }]">
                                            <span>{{ cell.solve }}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" @click="close">close</button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { PropType } from 'vue'
import { Modal } from 'bootstrap' // 若型別報錯，見下方備註

// 你的 cell 結構（依需求調整）
type Cell = {
    solve: string | number
    input?: string | number | null
    given: boolean
}

const props = defineProps({
    open: { type: Boolean, default: false },                // v-model:open
    cells: { type: Array as PropType<Cell[][]>, required: true },
})

const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>()

const el = ref<HTMLDivElement | null>(null)
// 若這行在你環境報型別錯，將其改為： let inst: any = null
let inst: any = null

function close() {
    emit('update:open', false)
}

onMounted(() => {
    if (!el.value) return
    inst = new Modal(el.value, {})
    el.value.addEventListener('hidden.bs.modal', () => emit('update:open', false))
    if (props.open) inst.show()
})

onBeforeUnmount(() => {
    inst?.dispose()
    inst = null
})

watch(
    () => props.open,
    (v) => {
        if (!inst) return
        v ? inst.show() : inst.hide()
    }
)
</script>

<style scoped>
/* 容器：置中 + 小螢幕時允許捲動 */
.wrap {
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    /* 小螢幕避免溢出 */
    max-width: 100%;
}

/* 棋盤寬度：在最小/最大之間，跟著視窗短邊(vmin)縮放 */
.grid {
    --board-size: clamp(270px, 60vmin, 560px);
    /* 最小270px，隨視窗縮放，最大560px */
    width: calc(var(--board-size) / 2);
    table-layout: fixed;
    border-collapse: collapse;
    background: #fff;
    outline: none;
    max-width: 100%;
}

/* 每格大小 = 棋盤 / 9，字體跟著格子比例縮放 */
.cell {
    width: calc(var(--board-size) / 9);
    height: calc(var(--board-size) / 9);
    text-align: center;
    vertical-align: middle;
    font-size: calc(var(--board-size) / 9 * 0.5);
    font-weight: 600;
    color: #000;
    cursor: pointer;
    border: 1px solid var(--cell-border, #979faa);
}

.cell.editable {
    background: #9ccc65;
    color: #000;
    font-weight: 800;
    cursor: default;
}

.cell.given {
    color: #000;
    font-weight: 800;
    cursor: default;
}

.grid tr:first-child .cell {
    border-top: 3px solid #000;
}

.grid tr:last-child .cell {
    border-bottom: 3px solid #000;
}

.grid .cell:first-child {
    border-left: 3px solid #000;
}

.grid .cell:last-child {
    border-right: 3px solid #000;
}

.grid tr:nth-child(3n) .cell {
    border-bottom: 3px solid #000;
}

.grid .cell:nth-child(3n) {
    border-right: 3px solid #000;
}
</style>
