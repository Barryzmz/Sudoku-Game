<template>
    <Teleport to="body">
        <div class="modal fade" tabindex="-1" ref="el" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">成功完成！</h3>
                    </div>
                    <div class="modal-body">
                        <h5>恭喜！過關！</h5>
                    </div>
                    <div class="modal-footer">
                        <div class="row g-2 w-100">
                            <div class="col">
                                <button class="btn btn-secondary w-100" @click="close">Close</button>
                            </div>
                            <div class="col">
                                <button class="btn btn-primary w-100" @click="newPuzzle">New Puzzle</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import Modal from 'bootstrap/js/dist/modal'

const props = defineProps({
    open: { type: Boolean, default: false }, // v-model:open
})
const emit = defineEmits(['update:open', 'new-puzzle'])

const el = ref(null)
let inst = null

function close() {
    emit('update:open', false)
}

function newPuzzle() {
    emit('new-puzzle')        // 通知父層重新出題
    emit('update:open', false) // 順便關閉視窗
}

onMounted(() => {
    if (!el.value) return
    inst = new Modal(el.value) // 用到的只有這個類別，不需全域載入 bootstrap.bundle
    el.value.addEventListener('hidden.bs.modal', () => emit('update:open', false))
    if (props.open) inst.show()
})

onBeforeUnmount(() => {
    inst?.dispose()
    inst = null
})

watch(() => props.open, (v) => {
    if (!inst) return
    v ? inst.show() : inst.hide()
})

</script>
