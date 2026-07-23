<template>
    <div class="row g-3">
        <div class="col-12 col-md-6" v-for="i in count" :key="i">
            <div class="card p-3 d-flex flex-column justify-content-between h-100" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
                <div>
                    <!-- Header Row: Status & Action Menu (No Category Badge) -->
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <Skeleton width="85px" height="1.6rem" style="border-radius: 50rem;" />
                        <Skeleton shape="circle" size="32px" />
                    </div>

                    <!-- Title & Date -->
                    <div class="mb-3">
                        <Skeleton width="75%" height="1.4rem" class="mb-2" />
                        <Skeleton width="45%" height="0.85rem" />
                    </div>

                    <!-- Full Width Cover Image -->
                    <div class="report-cover-container rounded overflow-hidden w-100 mb-3">
                        <Skeleton width="100%" height="100%" />
                    </div>

                    <!-- Description Text -->
                    <div class="d-flex flex-column gap-2 mb-2">
                        <Skeleton width="100%" height="0.9rem" />
                        <Skeleton width="90%" height="0.9rem" />
                        <Skeleton width="65%" height="0.9rem" />
                    </div>
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
        default: 6
    }
});
</script>

<style scoped>
.report-cover-container {
    aspect-ratio: 16 / 9;
    min-height: 170px;
}

:deep(.p-skeleton) {
    background-color: var(--surface-ground) !important;
}
</style>
