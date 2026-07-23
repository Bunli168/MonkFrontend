<template>
    <svg class="premium-bg-shapes position-fixed w-100 h-100" style="top: 0; left: 0; z-index: -1; pointer-events: none;" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
        <template v-for="(shape, index) in shapes" :key="index">
            <circle 
                v-if="shape.type === 'circle'" 
                :cx="shape.cx" 
                :cy="shape.cy" 
                :r="shape.r" 
                :fill="shape.fill" 
                :fill-opacity="shape.opacity" 
            />
            <path 
                v-else-if="shape.type === 'path'" 
                :d="shape.d" 
                :fill="shape.fill" 
                :fill-opacity="shape.opacity" 
            />
        </template>
    </svg>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const shapes = ref([]);

const defaultShapes = [
    { type: 'circle', cx: '10%', cy: '5%', r: 400, fill: 'var(--primary-color)', opacity: 0.04 },
    { type: 'circle', cx: '85%', cy: '85%', r: 500, fill: 'var(--primary-color)', opacity: 0.04 },
    { type: 'circle', cx: '50%', cy: '50%', r: 300, fill: 'var(--text-color)', opacity: 0.02 },
    { type: 'path', d: 'M-100 900C300 500 700 600 1500 200V900H-100Z', fill: 'var(--primary-color)', opacity: 0.03 },
    { type: 'path', d: 'M0 0L500 0L0 400Z', fill: 'var(--primary-color)', opacity: 0.02 }
];

const generateShapes = () => {
    const newShapes = [];
    const numCircles = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < numCircles; i++) {
        const isPrimary = Math.random() > 0.3;
        newShapes.push({
            type: 'circle',
            cx: `${Math.floor(Math.random() * 100)}%`,
            cy: `${Math.floor(Math.random() * 100)}%`,
            r: Math.floor(Math.random() * 400) + 150,
            fill: isPrimary ? 'var(--primary-color)' : 'var(--text-color)',
            opacity: isPrimary ? (Math.random() * 0.03 + 0.02).toFixed(3) : (Math.random() * 0.02 + 0.01).toFixed(3)
        });
    }
    const numPaths = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numPaths; i++) {
        const startY = Math.floor(Math.random() * 900);
        const cp1x = Math.floor(Math.random() * 600) + 200;
        const cp1y = Math.floor(Math.random() * 900);
        const cp2x = Math.floor(Math.random() * 600) + 600;
        const cp2y = Math.floor(Math.random() * 900);
        const endY = Math.floor(Math.random() * 900);
        newShapes.push({
            type: 'path',
            d: `M-100 ${startY}C${cp1x} ${cp1y} ${cp2x} ${cp2y} 1500 ${endY}V900H-100Z`,
            fill: 'var(--primary-color)',
            opacity: (Math.random() * 0.02 + 0.01).toFixed(3)
        });
    }
    shapes.value = newShapes;
};

const loadShapes = () => {
    const saved = localStorage.getItem('app-Appearance');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.bgStyle === 'random') {
                generateShapes();
                return;
            }
        } catch (e) {}
    }
    shapes.value = defaultShapes;
};

onMounted(() => {
    loadShapes();
    window.addEventListener('bg-shapes-updated', loadShapes);
});

onUnmounted(() => {
    window.removeEventListener('bg-shapes-updated', loadShapes);
});
</script>

<style>
/* Hide the premium background shapes when the user disables them in Appearance Settings */
html[data-background-shapes="false"] .premium-bg-shapes {
    display: none !important;
}
</style>
