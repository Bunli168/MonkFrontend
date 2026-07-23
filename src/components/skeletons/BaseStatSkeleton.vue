<template>
    <div class="stat-card p-2">
        <div class="stat-main p-3">
            <div class="stat-content">
                <h6 class="stat-label">
                    <Skeleton width="6rem" height="1rem" />
                </h6>
                <h3 class="stat-value">
                    <Skeleton width="4rem" height="2rem" />
                </h3>
            </div>
            <div class="stat-chart">
                <Skeleton class="bar" width="3px" height="15px" />
                <Skeleton class="bar" width="3px" height="20px" />
                <Skeleton class="bar" width="3px" height="12px" />
                <Skeleton class="bar" width="3px" height="18px" />
                <Skeleton class="bar" width="3px" height="30px" />
                <Skeleton class="bar" width="3px" height="16px" />
            </div>
        </div>
        <div class="stat-footer p-3 pb-2">
            <div class="stat-icon-wrapper">
                <Skeleton shape="circle" size="1.2rem" />
            </div>
            <div class="stat-trend d-flex align-items-center gap-2">
                <Skeleton width="3rem" height="1rem" />
                <Skeleton width="4rem" height="1rem" />
            </div>
        </div>
    </div>
</template>

<script setup>
import Skeleton from 'primevue/skeleton';
</script>

<style scoped>
.stat-card {
    background-color: var(--surface-ground);
    border-radius: var(--border-radius);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.stat-main {
    border-radius: var(--border-inner-radius);
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    background-color: var(--body-bg-color);
}

.stat-content {
    display: flex;
    flex-direction: column;
}

.stat-label {
    margin-bottom: 8px;
}

.stat-value {
    margin: 0;
}

.stat-chart {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 35px;
    margin-bottom: 4px;
}

.bar {
    border-radius: 2px !important;
}

.stat-footer {
    background-color: var(--surface-ground);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.stat-icon-wrapper {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

:deep(.p-skeleton) {
    background-color: var(--surface-ground) !important;
}
</style>
