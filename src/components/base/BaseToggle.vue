<template>
    <div :class="['base-toggle-wrapper', { 'is-inline': inline }]">
        <label v-if="label" class="form-label" :for="id">{{ label }}</label>

        <div class="toggle-control">
            <button type="button" :id="id" role="switch" :aria-checked="internalValue"
                :aria-label="ariaLabel || label || undefined" :disabled="disabled"
                :class="['toggle', { 'is-on': internalValue, 'is-disabled': disabled }]" @click="toggle">
                <span class="track" aria-hidden="true"></span>
                <span class="knob" aria-hidden="true"></span>
            </button>

            <span v-if="showLabels" class="toggle-text">
                <span v-if="!internalValue" class="off">{{ offLabel }}</span>
                <span v-else class="on">{{ onLabel }}</span>
            </span>
        </div>

        <small v-if="hint" class="text-muted mt-1 d-block">{{ hint }}</small>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    id: {
        type: String,
        default: () => 'toggle-' + Math.random().toString(36).substr(2, 9)
    },
    hint: {
        type: String,
        default: ''
    },
    inline: {
        type: Boolean,
        default: false
    },
    onLabel: {
        type: String,
        default: ''
    },
    offLabel: {
        type: String,
        default: ''
    },
    ariaLabel: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:modelValue', 'change'])

const internalValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const showLabels = computed(() => props.onLabel || props.offLabel)
const onLabel = computed(() => props.onLabel || 'On')
const offLabel = computed(() => props.offLabel || 'Off')

const toggle = () => {
    if (props.disabled) return
    const next = !internalValue.value
    internalValue.value = next
    emit('change', next)
}
</script>

<style scoped>
.base-toggle-wrapper {
    display: flex;
    flex-direction: column;
}

.toggle-control {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.toggle {
    --toggle-width: 40px;
    --toggle-height: 20px;
    /* fixed height */
    position: relative;
    display: inline-block;
    width: var(--toggle-width);
    height: var(--toggle-height);
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
}

.toggle.is-disabled {
    cursor: not-allowed;
    opacity: 0.7;
}

.toggle .track {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 999px;
    background: var(--surface-50);
    border: var(--border-width) solid var(--border-clr);
    transition: background .18s ease, border-color .18s ease;
}

.toggle .knob {
    position: absolute;
    top: 50%;
    left: 4px;
    transform: translateY(-50%);
    width: calc(var(--toggle-height) - 8px);
    height: calc(var(--toggle-height) - 8px);
    background: var(--primary-color);
    /* knob primary when OFF */
    border-radius: 50%;
    transition: left .18s ease, transform .18s ease, background .12s ease;
}

.toggle.is-on .track {
    background: var(--primary-color);
    border-color: var(--primary-color);
}

.toggle.is-on .knob {
    left: calc(100% - (var(--toggle-height) - 8px) - 4px);
}

.toggle.is-on .knob {
    background: #fff;
    /* knob white when ON */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.toggle-text {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 0.85rem;
    color: var(--text-muted);
}

.toggle-text .on {
    color: var(--primary-color);
}
</style>
