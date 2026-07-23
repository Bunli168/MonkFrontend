<template>
    <div class="skeleton-wrapper d-inline-flex">
        <Skeleton class="badge-stat-skeleton" width="22px" height="22px" />
    </div>
</template>

<script setup>
import { Skeleton } from 'primevue';
</script>

<style scoped>
.skeleton-wrapper :deep(.p-skeleton) {
    background-color: var(--surface-ground) !important;
    border-radius: var(--border-inner-radius) !important;
}
</style>
