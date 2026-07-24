<template>
    <div class="base-select-wrapper">
        <label v-if="label" class="form-label" :for="id">
            {{ label }}
            <span v-if="required" style="color: var(--danger-color)">*</span>
        </label>
        <component :is="selectComponent" :id="id" v-model="internalValue" :options="options" v-bind="optionProps"
            :placeholder="placeholder" :disabled="disabled" :required="required" :showClear="clearable" :filter="filter" :multiple="multiple"
            :loading="loading" :invalid="!!error" :class="['w-100']">
            <template #dropdownicon>
                <ChevronDown v-if="!disabled" size="18" />
                <span v-else></span>
            </template>
            <template #clearicon v-if="clearable">
                <X size="16" />
            </template>
            <template #filtericon v-if="filter">
                <Search size="16" />
            </template>
            <template #removeicon v-if="multiple">
                <X size="14" />
            </template>
            <template #value="slotProps" v-if="$slots.value">
                <slot name="value" v-bind="slotProps"></slot>
            </template>
            <template #option="slotProps">
                <div :ref="el => checkLastItem(el, slotProps.index, options.length)" class="w-100">
                    <slot name="option" v-bind="slotProps" v-if="$slots.option"></slot>
                    <span v-else>{{ typeof slotProps.option === 'object' ? slotProps.option[optionLabel] : slotProps.option }}</span>
                </div>
            </template>
            <template #footer v-if="loading || $slots.footer">
                <slot name="footer" v-if="$slots.footer"></slot>
                <div v-else-if="loading" class="p-2 text-center text-muted small d-flex align-items-center justify-content-center border-top">
                    <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    <span>Loading more...</span>
                </div>
            </template>
        </component>
        <small v-if="error" class="text-danger mt-1 d-block">{{ error }}</small>
        <small v-else-if="hint" class="text-muted mt-1 d-block">{{ hint }}</small>
    </div>
</template>

<script setup>
import { computed, ref, onBeforeUnmount } from 'vue';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import { ChevronDown, Search, X } from '@lucide/vue';

const props = defineProps({
    modelValue: {
        type: [String, Number, Boolean, Array, Object, null],
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
    placeholder: {
        type: String,
        default: 'Select'
    },
    multiple: {
        type: Boolean,
        default: false
    },
    filter: {
        type: Boolean,
        default: false
    },
    clearable: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    },
    id: {
        type: String,
        default: () => 'select-' + Math.random().toString(36).substr(2, 9)
    },
    hint: {
        type: String,
        default: ''
    },
    error: {
        type: String,
        default: ''
    },
    required: {
        type: Boolean,
        default: false
    },
    reduceRadius: {
        type: [String, Number],
        default: null
    }
});

const emit = defineEmits(['update:modelValue', 'load-more']);

const observer = ref(null);

const checkLastItem = (el, index, total) => {
    if (index === total - 1 && el) {
        if (!observer.value) {
            observer.value = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    emit('load-more');
                }
            });
        }
        observer.value.disconnect(); // Clear any previous observation
        observer.value.observe(el);
    }
};

onBeforeUnmount(() => {
    if (observer.value) {
        observer.value.disconnect();
    }
});

const internalValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});

const selectComponent = computed(() => props.multiple ? MultiSelect : Select)

const optionsAreObjects = (arr) => Array.isArray(arr) && arr.length > 0 && arr.some((i) => i && typeof i === 'object');

const optionProps = computed(() => {
    return optionsAreObjects(props.options) ? { optionLabel: props.optionLabel, optionValue: props.optionValue } : {};
});
</script>

<style>
.base-select-wrapper {
    display: flex;
    flex-direction: column;
}

.p-select,
.p-multiselect {
    border-radius: var(--border-inner-radius) !important;
    border: var(--border-width) solid var(--border-clr) !important;
    background-color: transparent !important;
    box-shadow: none !important;
    height: var(--control-height) !important;
    display: flex;
    align-items: center;
}

.p-select.p-invalid,
.p-multiselect.p-invalid {
    border: var(--border-width) solid var(--danger-color) !important;
}

.p-select.p-invalid .p-select-label,
.p-multiselect.p-invalid .p-multiselect-label {
    color: var(--danger-color) !important;
}

.p-select-label,
.p-multiselect-label {
    color: var(--text-base) !important;
}

.p-select:not(.p-disabled):hover,
.p-multiselect:not(.p-disabled):hover {
    border-color: var(--border-hover-color) !important;
}

.p-select-option,
.p-multiselect-option {
    background-color: var(--body-bg-color) !important;
    color: var(--text-base) !important;
    border-radius: calc(var(--border-inner-radius) - 4px) !important;
}

.p-select-option:hover,
.p-select-option.p-select-option-selected,
.p-multiselect-option:hover,
.p-multiselect-option.p-multiselect-option-selected {
    background-color: var(--surface-ground) !important;
}

.p-select-option:hover,
.p-select-option.p-select-option-selected {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.p-select-option.p-select-option-selected::after {
    content: '✔';
    color: var(--primary-color);
}

.p-select-overlay,
.p-multiselect-overlay {
    background-color: var(--body-bg-color) !important;
    border: var(--border-width) solid var(--border-clr) !important;
    border-radius: var(--border-inner-radius) !important;
    overflow: hidden;
    box-shadow: none !important;
}

.p-multiselect-filter {
    border-radius: var(--border-inner-radius) !important;
    border: var(--border-width) solid var(--border-clr) !important;
    background-color: transparent !important;
    box-shadow: none !important;
    height: var(--control-height) !important;
    color: var(--text-base) !important;
}

.p-multiselect-empty-message {
    color: var(--text-base);
}
</style>
