<template>
    <div class="row g-3">
        <div class="col-md-6" v-for="i in count" :key="i">
            <div class="card gap-2 p-2" style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius);">
                <div class="card-header bg-transparent d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                        <Skeleton width="100px" height="1.2rem" />
                        <Skeleton width="60px" height="1rem" />
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <Skeleton width="16px" height="16px" />
                        <Skeleton width="16px" height="16px" />
                    </div>
                </div>
                <div class="card-body d-flex justify-content-between" style="background-color: transparent;">
                    <Skeleton width="80px" height="1.2rem" />
                    <Skeleton width="40px" height="1.2rem" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Skeleton from 'primevue/skeleton';

defineProps({
    count: {
        type: Number,
        default: 6
    }
});
</script>

<style scoped>
:deep(.p-skeleton) {
    background-color: var(--surface-ground) !important;
}
</style>
