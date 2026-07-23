<template>
    <div class="dashboard-page-title d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div class="title-content">
            <h3 class="mb-1 fw-medium">{{ title }}</h3>
            <p v-if="subtitle" class="text-muted mb-0 small">{{ subtitle }}</p>
        </div>
        <div class="title-actions d-flex flex-wrap align-items-center gap-2">
            <slot></slot>
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        default: ''
    }
});
</script>

<style scoped>
.dashboard-page-title h4 {
    color: var(--text-heading-color, #0f172a);
    margin-top: 0;
}
.title-content {
    flex: 1;
    min-width: 200px;
}
</style>
