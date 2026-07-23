<template>
    <div class="d-flex flex-column gap-3">
        <div>
            <h5 class="d-flex align-items-center gap-2 mb-0">
                <Moon :size="20" class="text-primary" /> Appearance
            </h5>
            <p class="text-muted small mb-0 mt-1">Customize how Monk Management System looks on your device.</p>
        </div>
        <div class="main-divider"></div>

        <div class="pb-2">

            <div class="mb-3">
                <BaseSelectButton label="Background Style" v-model="appearance.bgStyle" :options="bgStyleOptions"
                    @update:modelValue="setBgStyle" />
            </div>

            <div class="mb-3">
                <BaseSelectButton label="Page Transition" v-model="appearance.pageTransition"
                    :options="transitionOptions" @update:modelValue="setTransition" />
            </div>

            <div class="mb-3">
                <label class="form-label mb-2 fw-medium">Theme Template & Custom</label>
                <div class="d-flex flex-wrap gap-2 align-items-center">
                    <div v-for="theme in themeTemplates" :key="theme.name"
                        class="theme-swatch d-flex align-items-center justify-content-center"
                        :class="{ 'active-swatch': appearance.primaryColor === theme.color }"
                        :style="{ backgroundColor: '#' + theme.color }" @click="selectThemeTemplate(theme.color)"
                        v-tooltip.top="theme.name">
                        <Check v-if="appearance.primaryColor === theme.color" class="text-white" :size="16"
                            stroke-width="3" />
                    </div>

                    <div class="mx-1" style="width: 1px; height: 24px; background-color: var(--border-clr);"></div>

                    <ColorPicker v-model="appearance.primaryColor" @change="updatePrimaryColor"
                        v-tooltip.top="'Custom Color'" />
                </div>
            </div>

            <div>
                <div class="d-flex align-items-center justify-content-between mb-3">
                    <label class="form-label mb-0 fw-medium">Border Radius</label>
                    <span class="text-muted small">{{ appearance.borderRadius }}px</span>
                </div>
                <Slider v-model="appearance.borderRadius" :min="0" :max="24" :step="1"
                    @update:modelValue="updateBorderRadius" class="w-100 mb-4" />
            </div>

            <div class="mb-3">
                <BaseSelectButton label="Border Width" v-model="appearance.borderWidth" :options="borderWidthOptions"
                    @update:modelValue="updateBorderWidth" />
            </div>

            <div>
                <div class="d-flex align-items-center justify-content-between mb-3">
                    <label class="form-label mb-0 fw-medium">Control Height</label>
                    <span class="text-muted small">{{ appearance.controlHeight }}px</span>
                </div>
                <Slider v-model="appearance.controlHeight" :min="32" :max="60" :step="1"
                    @update:modelValue="updateControlHeight" class="w-100" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Moon, Check } from '@lucide/vue';
import ColorPicker from 'primevue/colorpicker';
import Slider from 'primevue/slider';

const appearance = ref({
    bgStyle: 'default',
    primaryColor: '007bff',
    borderRadius: 8,
    borderWidth: 1.5,
    controlHeight: 42,
    pageTransition: 'fade'
});

const bgStyleOptions = [
    { label: 'Off', value: 'off' },
    { label: 'Default', value: 'default' },
    { label: 'Random', value: 'random' }
];

const transitionOptions = [
    { label: 'Fade', value: 'fade' },
    { label: 'Slide', value: 'slide' },
    { label: 'Zoom', value: 'zoom' },
    { label: 'None', value: 'none' }
];

const borderWidthOptions = [
    { label: 'Thin 1.5px', value: 1.5 },
    { label: 'Thick 2px', value: 2 }
];

const themeTemplates = [
    { name: 'Monk Management', color: '006d80' },
    { name: 'Ocean Breeze', color: '0284c7' },
    { name: 'Amethyst', color: '7c3aed' },
    { name: 'Emerald', color: '059669' },
    { name: 'Sunset', color: 'ea580c' },
    { name: 'Rose', color: 'e11d48' },
    { name: 'Slate', color: '475569' }
];

const selectThemeTemplate = (color) => {
    appearance.value.primaryColor = color;
    updatePrimaryColor();
};

const saveAppearance = () => {
    localStorage.setItem('app-Appearance', JSON.stringify({
        bgStyle: appearance.value.bgStyle,
        primaryColor: appearance.value.primaryColor,
        borderRadius: appearance.value.borderRadius,
        borderWidth: appearance.value.borderWidth,
        controlHeight: appearance.value.controlHeight,
        pageTransition: appearance.value.pageTransition
    }));
};

const setTransition = (value) => {
    appearance.value.pageTransition = value;
    saveAppearance();
    document.documentElement.setAttribute('data-page-transition', value);
};

onMounted(() => {
    let savedAppearance = {};
    try {
        const stored = localStorage.getItem('app-Appearance');
        if (stored) savedAppearance = JSON.parse(stored);
    } catch (e) {
        console.error('Failed to parse settings');
    }

    const savedTheme = savedAppearance.theme || localStorage.getItem('app-theme') || 'light';

    appearance.value.bgStyle = savedAppearance.bgStyle || 'default';
    document.documentElement.setAttribute('data-background-shapes', appearance.value.bgStyle !== 'off');

    const savedColor = savedAppearance.primaryColor || localStorage.getItem('primary-color');
    if (savedColor) {
        appearance.value.primaryColor = savedColor.replace('#', '');
        applyPrimaryColor(savedColor);
    } else {
        const rootStyles = getComputedStyle(document.documentElement);
        const cssPrimary = rootStyles.getPropertyValue('--primary-color').trim();
        if (cssPrimary && cssPrimary.startsWith('#')) {
            appearance.value.primaryColor = cssPrimary.replace('#', '');
        }
    }

    const savedRadius = savedAppearance.borderRadius !== undefined ? savedAppearance.borderRadius : localStorage.getItem('border-radius');
    if (savedRadius !== null && savedRadius !== undefined) {
        appearance.value.borderRadius = parseInt(savedRadius, 10);
        applyBorderRadius(savedRadius);
    } else {
        const rootStyles = getComputedStyle(document.documentElement);
        const cssRadius = rootStyles.getPropertyValue('--border-radius').trim();
        if (cssRadius) {
            appearance.value.borderRadius = parseInt(cssRadius.replace('px', ''), 10) || 8;
        }
    }

    const savedBorderWidth = savedAppearance.borderWidth !== undefined ? savedAppearance.borderWidth : null;
    if (savedBorderWidth !== null) {
        appearance.value.borderWidth = parseFloat(savedBorderWidth);
        applyBorderWidth(savedBorderWidth);
    } else {
        const rootStyles = getComputedStyle(document.documentElement);
        const cssBorderWidth = rootStyles.getPropertyValue('--border-width').trim();
        if (cssBorderWidth) {
            appearance.value.borderWidth = parseFloat(cssBorderWidth.replace('px', '')) || 1.5;
        }
    }

    const savedHeight = savedAppearance.controlHeight !== undefined ? savedAppearance.controlHeight : null;
    if (savedHeight !== null) {
        appearance.value.controlHeight = parseInt(savedHeight, 10);
        applyControlHeight(savedHeight);
    } else {
        const rootStyles = getComputedStyle(document.documentElement);
        const cssHeight = rootStyles.getPropertyValue('--control-height').trim();
        if (cssHeight) {
            appearance.value.controlHeight = parseInt(cssHeight.replace('px', ''), 10) || 42;
        }
    }

    if (savedAppearance.pageTransition !== undefined) {
        if (savedAppearance.pageTransition === true) appearance.value.pageTransition = 'fade';
        else if (savedAppearance.pageTransition === false) appearance.value.pageTransition = 'none';
        else appearance.value.pageTransition = savedAppearance.pageTransition;
    }
    document.documentElement.setAttribute('data-page-transition', appearance.value.pageTransition);
});

const applyPrimaryColor = (color) => {
    const hex = color.startsWith('#') ? color : '#' + color;
    document.documentElement.style.setProperty('--primary-color', hex);
};

const applyBorderRadius = (radius) => {
    document.documentElement.style.setProperty('--border-radius', `${radius}px`);
};

const applyBorderWidth = (width) => {
    document.documentElement.style.setProperty('--border-width', `${width}px`);
};

const applyControlHeight = (height) => {
    document.documentElement.style.setProperty('--control-height', `${height}px`);
};

const updateControlHeight = () => {
    applyControlHeight(appearance.value.controlHeight);
    saveAppearance();
};

const updateBorderRadius = () => {
    applyBorderRadius(appearance.value.borderRadius);
    saveAppearance();
};

const updateBorderWidth = () => {
    applyBorderWidth(appearance.value.borderWidth);
    saveAppearance();
};

const updatePrimaryColor = () => {
    const newColor = appearance.value.primaryColor;
    if (newColor) {
        applyPrimaryColor(newColor);
        saveAppearance();
    }
};

const setBgStyle = (val) => {
    appearance.value.bgStyle = val;
    document.documentElement.setAttribute('data-background-shapes', val !== 'off');
    saveAppearance();
    window.dispatchEvent(new Event('bg-shapes-updated'));
};
</script>

<style scoped>
.theme-swatch {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: 2px solid transparent;
}

.theme-swatch:hover {
    transform: scale(1.1);
}

.theme-swatch.active-swatch {
    box-shadow: 0 0 0 2px var(--body-bg-color), 0 0 0 4px var(--primary-color);
}

:deep(.p-colorpicker-preview) {
    width: 32px !important;
    height: 32px !important;
    border-radius: 50% !important;
    transition: transform 0.2s ease !important;
}

:deep(.p-colorpicker-preview:hover) {
    transform: scale(1.1);
}

.p-slider,
.p-slider-handle::before {
    background: var(--surface-ground) !important;
}

.p-slider .p-slider-handle {
    border-color: var(--primary-color) !important;
    background: var(--primary-color) !important;
}
</style>