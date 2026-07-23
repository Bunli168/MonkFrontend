<template>
    <div class="row g-2">
        <div class="col-md-6" v-for="i in count" :key="i">
            <div class="card p-2 gap-2"
                style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius);">
                <div class="card-header bg-transparent d-flex align-items-center justify-content-between">
                    <Skeleton width="120px" height="1.2rem" />
                    <div class="d-flex align-items-center gap-2">
                        <Skeleton shape="circle" size="24px" />
                    </div>
                </div>
                <Skeleton class="w-100" height="52px" style="border-radius: var(--border-inner-radius);" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { Skeleton } from 'primevue';

defineProps({
    count: {
        type: Number,
        default: 4
    }
});
</script>

<style scoped>
:deep(.p-skeleton) {
    background-color: var(--surface-ground) !important;
}
</style>
