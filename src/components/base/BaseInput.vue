<template>
    <div class="base-input-wrapper">
        <div v-if="label || computedMaxlength" class="d-flex justify-content-between align-items-center mb-2 w-100">
            <label v-if="label" class="form-label mb-0" :for="id">
                {{ label }}
                <span v-if="required" style="color: var(--danger-color)">*</span>
            </label>
            <span v-else></span>

            <small v-if="computedMaxlength" class="text-muted ms-auto flex-shrink-0" style="font-size: 0.75rem;">
                {{ (internalValue || '').toString().length }} / {{ computedMaxlength }}
            </small>
        </div>

        <Password v-if="type === 'password'" :inputId="id" v-model="internalValue" :placeholder="placeholder"
            :disabled="disabled" class="w-100" :inputClass="['w-100', 'p-password-dynamic']" :feedback="false"
            toggleMask :invalid="!!error" @blur="$emit('blur', $event)" @focus="$emit('focus', $event)"
            :inputStyle="reduceRadius ? { borderRadius: `calc(var(--border-radius) - ${reduceRadius}rem) !important` } : {}" />

        <InputNumber v-else-if="type === 'number'" :inputId="id" v-model="internalValue" :placeholder="placeholder"
            :disabled="disabled" class="w-100" :inputClass="['w-100']" :invalid="!!error" @blur="$emit('blur', $event)"
            @focus="$emit('focus', $event)" />

        <div v-else-if="type === 'textarea'" class="position-relative w-100 d-flex flex-column">
            <Textarea :id="id" v-model="internalValue" :placeholder="placeholder"
                :disabled="disabled" :class="['w-100', 'p-textarea-dynamic']" :rows="rows" autoResize :invalid="!!error"
                :maxlength="computedMaxlength"
                @blur="$emit('blur', $event)" @focus="$emit('focus', $event)" />
        </div>

        <div v-else class="position-relative w-100 d-flex align-items-center">
            <component v-if="prefixIcon" :is="prefixIcon" class="input-icon-left" :size="18" />
            <InputText :id="id" :type="type" :placeholder="placeholder" :class="['w-100', { 'with-prefix': prefixIcon, 'with-suffix': clearable }]" :disabled="disabled"
                :maxlength="computedMaxlength"
                v-model="internalValue" :invalid="!!error" @blur="$emit('blur', $event)" @focus="$emit('focus', $event)" />
            <button v-if="internalValue && clearable && !disabled" @click="onClear" class="clear-button btn p-0 position-absolute d-flex align-items-center justify-content-center" type="button" aria-label="Clear input">
                <X :size="16" />
            </button>
        </div>

        <small v-if="error" class="text-danger mt-1 d-block">{{ error }}</small>
        <small v-else-if="hint" class="text-muted mt-1 d-block">{{ hint }}</small>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { X } from '@lucide/vue';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';

const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'text'
    },
    placeholder: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    id: {
        type: String,
        default: () => 'input-' + Math.random().toString(36).substr(2, 9)
    },
    reduceRadius: {
        type: [String, Number],
        default: null
    },
    hint: {
        type: String,
        default: ''
    },
    rows: {
        type: Number,
        default: 3
    },
    error: {
        type: String,
        default: ''
    },
    required: {
        type: Boolean,
        default: false
    },
    prefixIcon: {
        type: [Object, Function],
        default: null
    },
    clearable: {
        type: Boolean,
        default: false
    },
    maxlength: {
        type: Number,
        default: null
    }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'clear']);

const computedMaxlength = computed(() => {
    if (props.type === 'textarea') {
        return props.maxlength || 256;
    }
    return props.maxlength;
});

const onClear = () => {
    emit('update:modelValue', '');
    emit('clear');
};

const internalValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});
</script>

<style scoped>
.base-input-wrapper {
    display: flex;
    flex-direction: column;
}

.p-inputtext,
:deep(.p-inputnumber-input) {
    border-radius: var(--border-inner-radius);
    border: var(--border-width) solid var(--border-clr);
    box-shadow: none;
    background-color: transparent !important;
    color: var(--text-base);
    height: var(--control-height) !important;
}

:deep(.p-password-input) {
    border: var(--border-width) solid var(--border-clr) !important;
    color: var(--text-base) !important;
    border-radius: var(--border-inner-radius) !important;
    background-color: transparent !important;
    box-shadow: none;
    height: var(--control-height) !important;
    line-height: var(--control-height) !important;
}

.p-inputtext.p-invalid,
:deep(.p-inputnumber-input).p-invalid,
:deep(.p-password-input).p-invalid,
:deep(.p-textarea-dynamic).p-invalid {
    border-color: var(--danger-color) !important;
}

:deep(.p-password-input:hover),
:deep(.p-inputtext:hover),
:deep(.p-inputnumber-input:hover),
:deep(.p-textarea-dynamic:hover) {
    border-color: var(--border-hover-color) !important;
}

.p-inputtext:enabled:focus,
:deep(.p-inputnumber-input):enabled:focus,
:deep(.p-password-input:focus),
:deep(.p-textarea-dynamic:focus) {
    border-color: var(--primary-color) !important;
}

.p-textarea-dynamic {
    display: block !important;
    width: 100% !important;
    min-height: var(--control-height) !important;
    border: var(--border-width) solid var(--border-clr) !important;
    box-shadow: none;
    border-radius: var(--border-inner-radius);
    background-color: transparent !important;
    color: var(--text-base);
    line-height: 1.4 !important;
}

.p-inputtext:disabled,
.p-textarea-dynamic:disabled,
:deep(.p-inputnumber-input):disabled {
    opacity: 0.9;
    color: var(--text-base);
}

.p-textarea-dynamic:disabled:hover,
.p-inputtext:disabled:hover,
:deep(.p-inputnumber-input):disabled:hover {
    border-color: var(--border-clr) !important;
    cursor: not-allowed;
}

.with-prefix {
    padding-left: 2.5rem !important;
}

.with-suffix {
    padding-right: 2.5rem !important;
}

.input-icon-left {
    position: absolute;
    left: 0.75rem;
    color: var(--text-base);
    z-index: 1;
    pointer-events: none;
}

.clear-button {
    right: 0.75rem;
    color: var(--secondary-color);
    text-decoration: none;
    z-index: 1;
}

.clear-button:hover {
    color: var(--text-base);
}
</style>