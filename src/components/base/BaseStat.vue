<template>
    <BaseStatSkeleton v-if="loading" />
    <div v-else class="stat-card p-2">
        <div class="stat-main p-3">
            <div class="stat-content">
                <h6 class="stat-label">{{ label }}</h6>
                <h3 class="stat-value text-primary">{{ value }}</h3>
            </div>
            <div class="stat-chart">
                <div class="bar bar-1"></div>
                <div class="bar bar-2"></div>
                <div class="bar bar-3"></div>
                <div class="bar bar-4"></div>
                <div class="bar bar-5 active"></div>
                <div class="bar bar-6"></div>
            </div>
        </div>
        <div class="stat-footer p-3 pb-2">
            <div class="stat-icon-wrapper" :class="trendType">
                <ArrowUp v-if="trendType === 'up'" :size="12" stroke-width="3" />
                <ArrowDown v-if="trendType === 'down'" :size="12" stroke-width="3" />
            </div>
            <div class="stat-trend">
                <span class="trend-value" :class="trendType">{{ trendValue }}</span>
                <span class="trend-label">{{ trendLabel }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ArrowUp, ArrowDown } from '@lucide/vue';
import BaseStatSkeleton from '@/components/skeletons/BaseStatSkeleton.vue';

const props = defineProps({
    label: { type: String, default: 'Total Revenue' },
    value: { type: [String, Number], default: '$0' },
    trendValue: { type: String, default: '+0.00' },
    trendLabel: { type: String, default: 'last year' },
    trendType: { type: String, default: 'up' },
    loading: { type: Boolean, default: false }
})
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
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: var(--text-base);
    opacity: 0.5;
    margin-bottom: 8px;
}

.stat-value {
    font-size: 2rem;
    font-weight: 700;
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
    width: 3px;
    background-color: var(--border-clr);
    border-radius: 2px;
}

.bar-1 {
    height: 40%;
}

.bar-2 {
    height: 60%;
    background-color: var(--primary-color);
}

.bar-3 {
    height: 80%;
}

.bar-4 {
    height: 45%;
}

.bar-5 {
    height: 100%;
    background-color: var(--primary-color);
}

.bar-6 {
    height: 70%;
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
    background-color: var(--border-clr);
    color: var(--text-base);
    opacity: 0.5;
}

.stat-trend {
    font-size: 0.85rem;
    font-weight: 600;
}

.trend-value {
    margin-right: 4px;
}

.trend-value.up {
    color: var(--success-color);
}

.trend-value.down {
    color: var(--danger-color);
}

.trend-label {
    color: var(--text-base);
    opacity: 0.5;
    font-weight: 500;
}
</style>