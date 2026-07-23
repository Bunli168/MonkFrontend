<template>
    <div class="card p-2 border-0" style="background-color: var(--surface-ground);">
        <div class="card-header border-0 mb-2 p-3"
            style="background-color: var(--body-bg-color); border-radius: var(--border-radius, 8px);">
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
        <div class="card-body position-relative d-flex flex-column"
            :style="{ backgroundColor: 'var(--body-bg-color)', borderRadius: 'var(--border-radius, 8px)', minHeight: height }">
            <div style="position: absolute; top: 8px; left: 4px; right: 4px; bottom: 8px;">
                <Chart v-if="isReady" :type="type" :data="mergedChartData" :options="mergedOptions" />
            </div>
        </div>
    </div>
</template>

<script setup>
import Chart from "primevue/chart";
import { computed, ref, onMounted } from "vue";

const isReady = ref(false);

onMounted(() => {
    setTimeout(() => {
        isReady.value = true;
    }, 150);
});

const props = defineProps({
    title: { type: String, default: 'Monthly Activity' },
    subtitle: { type: String, default: 'Survey responses over the last 7 months' },
    type: { type: String, default: 'bar' },
    labels: { type: Array, default: () => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'] },
    datasets: { type: Array, default: () => [] },
    options: { type: Object, default: () => ({}) },
    height: { type: String, default: '300px' },
    stacked: { type: Boolean, default: false },
    showGrid: { type: Boolean, default: true },
    showLegend: { type: Boolean, default: true },
    borderRadius: { type: Number, default: 6 },
    tension: { type: Number, default: 0.4 },
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
    if (rgbStr.startsWith('rgb')) {
        return rgbStr.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
    }
    return rgbStr;
};

const getThemeColor = (varName, fallback) => {
    if (typeof window === 'undefined') return fallback;
    const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return val || fallback;
};

const fallbackDatasets = [
    { label: 'Completed', type: 'bar', data: [50, 25, 44, 48, 56, 76, 42] },
    { label: 'Pending', type: 'bar', data: [21, 40, 24, 35, 37, 65, 34] },
    { label: 'Trend', type: 'line', data: [35, 32, 34, 42, 46, 70, 38], fill: false },
];

const mergedChartData = computed(() => {
    const raw = props.datasets.length > 0 ? props.datasets : fallbackDatasets;

    const cPrimary = getThemeColor('--primary-color', 'rgb(0, 109, 128)');
    const cWarning = getThemeColor('--warning-color', '#f59e0b');
    const cSuccess = getThemeColor('--success-color', '#0d9467');
    const cDanger = getThemeColor('--danger-color', '#ef4444');
    
    const palette = [
        { bg: getRgba(cPrimary, 0.75), border: cPrimary, hoverBg: getRgba(cPrimary, 0.9) },
        { bg: getRgba(cWarning, 0.75), border: cWarning, hoverBg: getRgba(cWarning, 0.9) },
        { bg: getRgba(cSuccess, 0.75), border: cSuccess, hoverBg: getRgba(cSuccess, 0.9) },
        { bg: getRgba(cDanger, 0.75), border: cDanger, hoverBg: getRgba(cDanger, 0.9) },
        { bg: 'rgba(99, 102, 241, 0.75)', border: 'rgb(99, 102, 241)', hoverBg: 'rgba(99, 102, 241, 0.9)' },
        { bg: 'rgba(139, 92, 246, 0.75)', border: 'rgb(139, 92, 246)', hoverBg: 'rgba(139, 92, 246, 0.9)' },
    ];

    const datasets = raw.map((ds, i) => {
        const pColor = palette[i % palette.length];
        const isLine = ds.type === 'line';

        return {
            ...ds,
            backgroundColor: ds.backgroundColor || (isLine ? 'transparent' : pColor.bg),
            borderColor: ds.borderColor || pColor.border,
            hoverBackgroundColor: ds.hoverBackgroundColor || (isLine ? undefined : pColor.hoverBg),
            borderWidth: ds.borderWidth ?? (isLine ? 2.5 : 0),
            borderRadius: isLine ? 0 : (ds.borderRadius ?? props.borderRadius),
            tension: isLine ? (ds.tension ?? props.tension) : undefined,
            pointRadius: isLine ? 4 : undefined,
            pointHoverRadius: isLine ? 6 : undefined,
            pointBackgroundColor: isLine ? (ds.borderColor || pColor.border) : undefined,
            pointBorderColor: isLine ? '#fff' : undefined,
            pointBorderWidth: isLine ? 2 : undefined,
            fill: ds.fill ?? false,
            order: isLine ? 0 : 1,
        };
    });

    return { labels: props.labels, datasets };
});

const mergedOptions = computed(() => {
    const base = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: props.showLegend,
                position: 'bottom',
                align: 'start',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'rectRounded',
                    font: { size: 12, weight: '500' },
                    color: '#64748b',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { size: 13, weight: '600' },
                bodyFont: { size: 12 },
                padding: { top: 10, bottom: 10, left: 14, right: 14 },
                cornerRadius: 8,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    labelColor: (ctx) => ({
                        borderColor: ctx.dataset.borderColor || ctx.dataset.backgroundColor,
                        backgroundColor: ctx.dataset.borderColor || ctx.dataset.backgroundColor,
                        borderRadius: 3,
                    }),
                },
            },
        },
        scales: {
            x: {
                stacked: props.stacked,
                grid: {
                    display: false,
                },
                border: { display: false },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 11, weight: '500' },
                    padding: 8,
                },
            },
            y: {
                stacked: props.stacked,
                grid: {
                    display: props.showGrid,
                    color: 'rgba(0, 0, 0, 0.04)',
                    drawBorder: false,
                },
                border: { display: false, dash: [4, 4] },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 11, weight: '500' },
                    padding: 12,
                    maxTicksLimit: 6,
                },
                beginAtZero: true,
            },
        },
        animation: {
            duration: 1200,
            easing: 'easeOutQuart',
        },
    };

    return deepMerge(base, props.options);
});

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
:deep(.p-chart) {
    width: 100% !important;
    height: 100% !important;
}
</style>
