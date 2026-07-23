<template>
    <Drawer :visible="modelValue" :position="position" :header="title" :modal="modal" :dismissable="dismissableMask"
        :blockScroll="blockScroll" :showCloseIcon="showCloseIcon" :closeOnEscape="closeOnEscape"
        :baseZIndex="baseZIndex" :style="drawerStyle" @update:visible="onUpdateVisible">
        <template #header v-if="$slots.header || title">
            <div class="drawer-header">
                <h5 class="drawer-title mb-0">
                    <slot name="header">{{ title }}</slot>
                </h5>
            </div>
        </template>

        <div class="drawer-body">
            <slot></slot>
        </div>

        <template #footer v-if="$slots.footer">
            <div class="drawer-footer">
                <slot name="footer"></slot>
            </div>
        </template>
    </Drawer>
</template>

<script setup>
import { computed } from 'vue'
import Drawer from 'primevue/drawer'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: ''
    },
    position: {
        type: String,
        default: 'right',
        validator: value => ['left', 'right', 'top', 'bottom'].includes(value)
    },
    width: {
        type: [String, Number],
        default: '28rem'
    },
    modal: {
        type: Boolean,
        default: true
    },
    dismissableMask: {
        type: Boolean,
        default: true
    },
    blockScroll: {
        type: Boolean,
        default: true
    },
    showCloseIcon: {
        type: Boolean,
        default: true
    },
    closeOnEscape: {
        type: Boolean,
        default: true
    },
    baseZIndex: {
        type: Number,
        default: 0
    },
})

const emit = defineEmits(['update:modelValue', 'close'])

const drawerStyle = computed(() => {
    if (props.position === 'left' || props.position === 'right' || props.position === 'top' || props.position === 'bottom') {
        const widthValue = typeof props.width === 'number' ? `${props.width}px` : props.width
        return { width: widthValue }
    }

    return undefined
})

function onUpdateVisible(value) {
    emit('update:modelValue', value)
    if (!value) {
        emit('close')
    }
}
</script>
