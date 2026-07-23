<template>
    <div :class="[hideWrapper ? '' : 'card p-2 border-0']" :style="{ backgroundColor: hideWrapper ? 'transparent' : 'var(--surface-ground)' }">
        <div v-if="!hideWrapper" class="card-header border-0 mb-2 p-3" style="background-color: var(--body-bg-color); border-radius: var(--border-radius, 8px);">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h6 class="fw-bold mb-1" style="color: var(--text-heading-color);">{{ title }}</h6>
                    <p class="text-muted small mb-0" v-if="subtitle">{{ subtitle }}</p>
                </div>
                <div v-if="$slots.actions">
                    <slot name="actions" />
                </div>
            </div>
        </div>

        <div :class="['p-3 d-flex flex-column align-items-center justify-content-center', layout === 'row' ? 'flex-md-row' : '', hideWrapper ? '' : 'card-body']" :style="{ backgroundColor: hideWrapper ? 'transparent' : 'var(--body-bg-color)', borderRadius: 'var(--border-radius, 8px)', flex: 1, minHeight: height }">
            <div class="d-flex align-items-center justify-content-center" :class="{ 'flex-grow-1': type === 'bar' || type === 'line' }" :style="{ width: (type === 'bar' || type === 'line') ? '100%' : 'auto' }">
                <div :class="type === 'bar' || type === 'line' ? 'chart-canvas-wrapper-dynamic' : 'chart-canvas-wrapper'">
                    <Chart :type="type" :data="mergedChartData" :options="mergedOptions" />
                </div>
            </div>

            <div :class="layout === 'row' ? 'mt-4 mt-md-0 ms-md-5' : 'mt-4 w-100 px-3'" v-if="showCustomLegend && mergedChartData.labels?.length" :style="layout === 'row' ? 'min-width: 250px;' : ''">
                <div class="d-flex flex-column gap-3">
                    <div 
                        class="d-flex align-items-center gap-2" 
                        v-for="(label, i) in mergedChartData.labels" 
                        :key="i"
                    >
                        <span 
                            class="legend-dot" 
                            :style="{ backgroundColor: mergedChartData.datasets[0]?.backgroundColor?.[i] }" 
                        />
                        <div class="d-flex align-items-center justify-content-between flex-grow-1">
                            <span class="text-muted small fw-medium me-2 text-wrap" style="max-width: 200px;">{{ label }}</span>
                            <span class="fw-bold small" style="color: var(--text-heading-color);">
                                {{ formatValue(mergedChartData.datasets[0].data[i]) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Chart from "primevue/chart";
import { computed } from "vue";

const props = defineProps({
    title: { type: String, default: 'User Distribution' },
    subtitle: { type: String, default: 'By role' },
    type: { type: String, default: 'doughnut' },
    labels: { type: Array, default: () => [] },
    dataValues: { type: Array, default: () => [] },
    colors: { type: Array, default: () => [] },
    options: { type: Object, default: () => ({}) },
    cutout: { type: String, default: '68%' },
    showCustomLegend: { type: Boolean, default: true },
    valuePrefix: { type: String, default: '' },
    valueSuffix: { type: String, default: '' },
    height: { type: String, default: '180px' },
    hideWrapper: { type: Boolean, default: false },
    layout: { type: String, default: 'column' }
});

const hexToRgb = (hex) => {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgb(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(', ') + ')';
    }
    return hex;
};

const getRgba = (colorStr, opacity) => {
    const rgbStr = colorStr.startsWith('#') ? hexToRgb(colorStr) : colorStr;
    if (rgbStr.startsWith('rgb(')) {
        return rgbStr.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
    }
    return rgbStr;
};

const getThemeColor = (varName, fallback) => {
    if (typeof window === 'undefined') return fallback;
    const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return val || fallback;
};

const fallbackLabels = ['សិស្សនិស្សិត', 'ព្រះសង្ឃ', 'មេកុដិ'];
const fallbackData = [540, 325, 135];

const mergedChartData = computed(() => {
    const labels = props.labels.length > 0 ? props.labels : fallbackLabels;
    const data = props.dataValues.length > 0 ? props.dataValues : fallbackData;
    
    const cPrimary = getThemeColor('--primary-color', 'rgb(0, 109, 128)');
    const cWarning = getThemeColor('--warning-color', '#f59e0b');
    const cSuccess = getThemeColor('--success-color', '#0d9467');
    const cDanger = getThemeColor('--danger-color', '#ef4444');
    
    const palette = [cPrimary, cWarning, cSuccess, cDanger, 'rgb(99, 102, 241)', 'rgb(139, 92, 246)', 'rgb(236, 72, 153)', 'rgb(14, 165, 233)'];

    const bgColors = props.colors.length > 0
        ? props.colors
        : labels.map((_, i) => palette[i % palette.length]);
        
    const hoverColors = bgColors.map(c => getRgba(c, 0.8));

    return {
        labels,
        datasets: [{
            data,
            backgroundColor: bgColors,
            hoverBackgroundColor: hoverColors,
            borderWidth: 0,
        }],
    };
});

const mergedOptions = computed(() => {
    const base = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: props.type === 'doughnut' ? props.cutout : undefined,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { size: 13, weight: '600' },
                bodyFont: { size: 12 },
                padding: { top: 10, bottom: 10, left: 14, right: 14 },
                cornerRadius: 8,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    label: (ctx) => {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
                        return ` ${ctx.label}: ${props.valuePrefix}${ctx.parsed.toLocaleString()}${props.valueSuffix} (${pct}%)`;
                    },
                },
            },
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 800,
            easing: 'easeOutQuart',
        },
    };

    return deepMerge(base, props.options);
});

function formatValue(val) {
    if (typeof val !== 'number') return val;
    return `${props.valuePrefix}${val.toLocaleString()}${props.valueSuffix}`;
}

function deepMerge(target, source) {
    if (!source) return target;
    const result = { ...target };
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}
</script>

<style scoped>
.chart-canvas-wrapper {
    position: relative;
    width: 100%;
    max-width: 200px;
    max-height: 200px;
    aspect-ratio: 1 / 1;
}

.chart-canvas-wrapper-dynamic {
    position: relative;
    width: 100%;
    height: 220px;
}

@media (min-width: 992px) {
    .chart-canvas-wrapper {
        max-width: 170px;
        max-height: 170px;
    }
}

@media (min-width: 1400px) {
    .chart-canvas-wrapper {
        max-width: 250px;
        max-height: 250px;
    }
}

/* Force PrimeVue Chart wrapper + canvas to fill */
:deep(.p-chart) {
    width: 100% !important;
    height: 100% !important;
}

:deep(.p-chart canvas) {
    width: 100% !important;
    height: 100% !important;
}

.legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}
</style>
