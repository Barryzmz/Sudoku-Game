<template>
    <Teleport to="body">
        <div class="modal fade" tabindex="-1" ref="el" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-body">
                        <table class="table table-bordered border border-3 my-3">
                            <thead class="table-light">
                                <tr>
                                    <th scope="col">Key</th>
                                    <th scope="col">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><kbd>1~9</kbd></td>
                                    <td>Fill in number</td>
                                </tr>
                                <tr>
                                    <td><kbd>Escape</kbd></td>
                                    <td>Deselect the current cell</td>
                                </tr>
                                 <tr>
                                    <td><kbd>0</kbd> / <kbd>Backspace</kbd> / <kbd>Delete</kbd></td>
                                    <td>Clear the cell</td>
                                </tr>
                                <tr>
                                    <td><kbd>H</kbd> (or <kbd>h</kbd>)</td>
                                    <td>Use a hint</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="modal-footer row g-2 w-100 justify-content-center">
                        <div class="col-12 col-sm-6">
                            <button class="btn btn-secondary w-100" @click="close">Close</button>
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
const emit = defineEmits(['update:open'])

const el = ref(null)
let inst = null

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

function close() {
    emit('update:open', false)
}
</script>
