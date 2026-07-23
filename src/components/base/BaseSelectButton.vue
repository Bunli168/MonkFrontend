<template>
    <div class="base-select-button-wrapper">
        <label v-if="label" class="form-label" :for="id">{{ label }}</label>

        <SelectButton :id="id" v-model="internalValue" :options="options" v-bind="optionProps" :disabled="disabled"
            :multiple="multiple" :allowEmpty="allowEmpty" class="w-100" aria-labelledby="basic">
            <template #option="slotProps" v-if="$slots.option">
                <slot name="option" v-bind="slotProps"></slot>
            </template>
        </SelectButton>

        <small v-if="hint" class="text-muted mt-1 d-block">{{ hint }}</small>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import SelectButton from 'primevue/selectbutton';

const props = defineProps({
    modelValue: {
        type: [String, Number, Array, Object, Boolean, null],
        default: null
    },
    options: {
        type: Array,
        default: () => []
    },
    optionLabel: {
        type: String,
        default: 'label'
    },
    optionValue: {
        type: String,
        default: 'value'
    },
    label: {
        type: String,
        default: ''
    },
    multiple: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    id: {
        type: String,
        default: () => 'selectbutton-' + Math.random().toString(36).substr(2, 9)
    },
    hint: {
        type: String,
        default: ''
    },
    allowEmpty: {
        type: Boolean,
        default: false
    },
});

const emit = defineEmits(['update:modelValue']);

const internalValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});

const optionsAreObjects = (arr) => Array.isArray(arr) && arr.length > 0 && arr.some((i) => i && typeof i === 'object');

const optionProps = computed(() => {
    return optionsAreObjects(props.options) ? { optionLabel: props.optionLabel, optionValue: props.optionValue } : {};
});
</script>

<style>
.base-select-button-wrapper {
    display: flex;
    flex-direction: column;
}

.p-selectbutton {
    width: 100%;
    height: var(--control-height) !important;
    border: var(--border-width) solid var(--border-clr) !important;
    border-radius: var(--border-inner-radius) !important;
    transition: none !important;
}

.p-selectbutton:hover {
    border-color: var(--border-hover-color) !important;
}

.p-selectbutton .p-togglebutton {
    flex: 1;
    border: none !important;
    background-color: var(--body-bg-color) !important;
    color: var(--text-base) !important;
    border-radius: var(--border-inner-radius) !important;
    transition: none !important;
}

.p-togglebutton-content {
    border-radius: var(--border-inner-radius) !important;
    box-shadow: none !important;
    transition: none !important;
}

.p-togglebutton-checked .p-togglebutton-content {
    background-color: var(--surface-ground) !important;
}

.p-selectbutton .p-togglebutton.p-disabled {
    opacity: 0.7;
    cursor: not-allowed;
}
</style>
