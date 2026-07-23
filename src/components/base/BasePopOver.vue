<template>
    <Popover ref="op" class="base-popover">
        <slot></slot>
    </Popover>
</template>

<script setup>
import { ref } from 'vue';
import Popover from 'primevue/popover';

const op = ref();

const toggle = (event) => {
    op.value.toggle(event);
}

const hide = () => {
    op.value.hide();
}

defineExpose({ toggle, hide });
</script>

<style>
.base-popover {
    border-radius: var(--border-radius) !important;
    background-color: var(--surface-ground) !important;
    border: none !important;
}

/* Hide outer border of arrow since popover has no border */
.base-popover:before {
    display: none !important;
}

/* Arrow points UP (Popover opens below) */
.base-popover:not(.p-popover-flipped):after {
    border-bottom-color: var(--surface-ground) !important;
}

/* Arrow points DOWN (Popover opens above) */
.base-popover.p-popover-flipped:after {
    border-top-color: var(--surface-ground) !important;
}
</style>
 