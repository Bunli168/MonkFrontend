<template>
    <div class="dashboard-empty-data d-flex flex-column align-items-center justify-content-center p-5 text-center w-100" 
        style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius); min-height: 300px;">
        
        <div class="icon-wrapper mb-3 text-muted">
            <slot name="icon">
                <Inbox :size="48" stroke-width="1.5" />
            </slot>
        </div>

        <h5 class="fw-bold mb-2" style="color: var(--text-heading-color);">{{ title }}</h5>
        <p class="text-muted mb-4 small" style="max-width: 350px; line-height: 1.5;">{{ description }}</p>

        <div v-if="$slots.action" class="action-wrapper">
            <slot name="action"></slot>
        </div>
    </div>
</template>

<script setup>
import { Inbox } from '@lucide/vue';

defineProps({
    title: {
        type: String,
        default: 'No records found'
    },
    description: {
        type: String,
        default: 'There is currently no data to display in this section.'
    }
});
</script>

<style scoped>
.icon-wrapper {
    opacity: 0.7;
}
</style>
