<template>
    <div class="row g-2">
        <div class="col-lg-4 col-md-6" v-for="i in count" :key="i">
            <div class="card gap-2 p-2"
                style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius);">
                <div class="card-header d-flex bg-transparent align-items-center justify-content-between">
                    <Skeleton shape="circle" size="18px" />
                    <Skeleton width="150px" height="1rem" />
                </div>
                <div class="d-flex align-items-stretch justify-content-between gap-2">
                    <Skeleton class="flex-fill" height="42px" style="border-radius: var(--border-inner-radius);" />
                    <Skeleton width="42px" height="42px" style="border-radius: var(--border-inner-radius);" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Skeleton } from 'primevue';

defineProps({
    count: {
        type: Number,
        default: 3
    }
});
</script>

<style scoped>
:deep(.p-skeleton) {
    background-color: var(--surface-ground) !important;
}
</style>
