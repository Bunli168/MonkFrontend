<template>
    <router-view />
    <BaseToast />
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { initDynamicFavicon } from '@/utils/dynamicFavicon';

const route = useRoute();

watch(
    () => route.path,
    (newPath) => {
        if (newPath.startsWith('/tnak')) {
            document.body.classList.add('tnak-theme');
        } else {
            document.body.classList.remove('tnak-theme');
        }
    },
    { immediate: true }
);

onMounted(() => {
    initDynamicFavicon();

    let savedAppearance = {};
    try {
        const stored = localStorage.getItem('app-Appearance');
        if (stored) savedAppearance = JSON.parse(stored);
    } catch (e) { }

    const savedTheme = savedAppearance.theme || localStorage.getItem('app-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const savedColor = savedAppearance.primaryColor || localStorage.getItem('primary-color');
    if (savedColor) {
        const hex = savedColor.startsWith('#') ? savedColor : '#' + savedColor;
        document.documentElement.style.setProperty('--primary-color', hex);
    }

    const savedRadius = savedAppearance.borderRadius !== undefined ? savedAppearance.borderRadius : localStorage.getItem('border-radius');
    if (savedRadius !== null && savedRadius !== undefined) {
        document.documentElement.style.setProperty('--border-radius', `${savedRadius}px`);
    }

    const savedHeight = savedAppearance.controlHeight !== undefined ? savedAppearance.controlHeight : null;
    if (savedHeight !== null) {
        document.documentElement.style.setProperty('--control-height', `${savedHeight}px`);
    }

    let savedTransition = savedAppearance.pageTransition;
    if (savedTransition === true) savedTransition = 'fade';
    if (savedTransition === false) savedTransition = 'none';
    if (!savedTransition) savedTransition = 'fade';
    document.documentElement.setAttribute('data-page-transition', savedTransition);
});
</script>