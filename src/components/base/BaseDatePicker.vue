<template>
    <div class="base-datepicker-wrapper">
        <label v-if="label" class="form-label" :class="{ 'text-danger': !!error }" :for="id">
            {{ label }} <span v-if="required" class="text-danger">*</span>
        </label>
        
        <DatePicker 
            :id="id" 
            v-model="internalValue" 
            :placeholder="placeholder"
            :disabled="disabled"
            :showIcon="showIcon"
            :inline="inline"
            iconDisplay="input"
            :dateFormat="timeOnly ? null : 'yy-mm-dd'"
            :timeOnly="timeOnly"
            :showTime="showTime"
            :hourFormat="hourFormat"
            class="w-100"
            :inputClass="['w-100']"
            :invalid="!!error"
            :selectionMode="selectionMode"
            :minDate="internalMinDate"
            :maxDate="internalMaxDate"
            @blur="$emit('blur', $event)" 
            @focus="$emit('focus', $event)"
        />

        <small v-if="error" class="text-danger mt-1 d-block">{{ error }}</small>
        <small v-else-if="hint" class="text-muted mt-1 d-block">{{ hint }}</small>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import DatePicker from 'primevue/datepicker';

const props = defineProps({
    modelValue: {
        type: [String, Date, null],
        default: null
    },
    label: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: 'Select a date'
    },
    disabled: {
        type: Boolean,
        default: false
    },
    showIcon: {
        type: Boolean,
        default: true
    },
    id: {
        type: String,
        default: () => 'datepicker-' + Math.random().toString(36).substr(2, 9)
    },
    inline: {
        type: Boolean,
        default: false
    },
    hint: {
        type: String,
        default: ''
    },
    timeOnly: {
        type: Boolean,
        default: false
    },
    showTime: {
        type: Boolean,
        default: false
    },
    required: {
        type: Boolean,
        default: false
    },
    selectionMode: {
        type: String,
        default: 'single'
    },
    hourFormat: {
        type: String,
        default: '12'
    },
    error: {
        type: String,
        default: ''
    },
    reduceRadius: {
        type: [String, Number],
        default: null
    },
    minDate: {
        type: [Date, String, null],
        default: null
    },
    maxDate: {
        type: [Date, String, null],
        default: null
    }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

const internalMinDate = computed(() => {
    if (typeof props.minDate === 'string' && props.minDate) {
        if (props.timeOnly && props.minDate.includes(':')) {
            const d = new Date();
            const parts = props.minDate.split(':');
            d.setHours(parseInt(parts[0] || 0), parseInt(parts[1] || 0), parseInt(parts[2] || 0), 0);
            return d;
        }
        return new Date(props.minDate);
    }
    return props.minDate;
});

const internalMaxDate = computed(() => {
    if (typeof props.maxDate === 'string' && props.maxDate) {
        if (props.timeOnly && props.maxDate.includes(':')) {
            const d = new Date();
            const parts = props.maxDate.split(':');
            d.setHours(parseInt(parts[0] || 0), parseInt(parts[1] || 0), parseInt(parts[2] || 0), 0);
            return d;
        }
        return new Date(props.maxDate);
    }
    return props.maxDate;
});

const internalValue = computed({
    get: () => {
        if (props.selectionMode === 'multiple' && Array.isArray(props.modelValue)) {
            return props.modelValue.map(d => new Date(d));
        }
        if (typeof props.modelValue === 'string' && props.modelValue) {
            if (props.timeOnly && props.modelValue.includes(':') && !props.modelValue.includes('-')) {
                const d = new Date();
                const parts = props.modelValue.split(':');
                d.setHours(parseInt(parts[0] || 0), parseInt(parts[1] || 0), parseInt(parts[2] || 0), 0);
                return d;
            }
            return new Date(props.modelValue);
        }
        return props.modelValue;
    },
    set: (val) => {
        if (props.selectionMode === 'multiple' && Array.isArray(val)) {
            const arr = val.map(v => {
                if (v instanceof Date && !isNaN(v)) {
                    const offset = v.getTimezoneOffset();
                    const adjustedDate = new Date(v.getTime() - (offset * 60 * 1000));
                    return adjustedDate.toISOString().split('T')[0];
                }
                return v;
            });
            emit('update:modelValue', arr);
            return;
        }
        if (val instanceof Date && !isNaN(val)) {
            if (props.timeOnly) {
                const hours = String(val.getHours()).padStart(2, '0');
                const minutes = String(val.getMinutes()).padStart(2, '0');
                emit('update:modelValue', `${hours}:${minutes}`);
            } else if (props.showTime) {
                emit('update:modelValue', val.toISOString());
            } else {
                const offset = val.getTimezoneOffset();
                const adjustedDate = new Date(val.getTime() - (offset * 60 * 1000));
                emit('update:modelValue', adjustedDate.toISOString().split('T')[0]);
            }
        } else {
            emit('update:modelValue', val);
        }
    }
});
</script>

<style>
.base-datepicker-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.p-datepicker,
.p-datepicker-calendar-container,
.p-datepicker-calendar {
    width: 100% !important;
}

.p-datepicker-input {
    border-radius: var(--border-inner-radius) !important;
    border: var(--border-width) solid var(--border-clr) !important;
    background-color: transparent !important;
    color: var(--text-base) !important;
    box-shadow: none !important;
    height: var(--control-height) !important;
}

.p-datepicker-input.p-invalid {
    border-color: var(--danger-color) !important;
}

.p-datepicker-input:enabled:hover {
    border-color: var(--border-hover-color) !important;
}

.p-datepicker-input:enabled:focus {
    border-color: var(--primary-color) !important;
}

.p-datepicker-input:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.p-datepicker-header {
    background-color: var(--body-bg-color) !important;
    border-bottom: var(--border-width) solid var(--border-clr) !important;
}

.p-datepicker-select-year,
.p-datepicker-select-month {
    color: var(--text-base) !important;
}

.p-datepicker-select-year:hover,
.p-datepicker-select-month:hover {
    color: var(--text-base) !important;
    background-color: var(--surface-ground) !important;
}

.p-datepicker-decade {
    color: var(--text-base) !important;
}

.p-datepicker-calendar th,
.p-datepicker-calendar td {
    text-align: center !important;
}

.p-datepicker-day {
    color: var(--text-base) !important;
    margin: 0 auto !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

.p-datepicker-weekday {
    color: var(--text-base) !important;
    text-align: center !important;
}

.p-datepicker-year,
.p-datepicker-month {
    color: var(--text-base) !important;
}

.p-datepicker-day:hover,
.p-datepicker-weekday:hover,
.p-datepicker-year:hover,
.p-datepicker-month:hover {
    color: var(--text-base) !important;
    background-color: var(--surface-ground) !important;
}

.p-datepicker-day:hover {
    color: var(--text-base) !important;
    background-color: var(--surface-ground) !important;
}

.p-datepicker-today>.p-datepicker-day {
    background-color: var(--primary-color) !important;
    color: var(--text-white) !important;
}

.p-datepicker-day-selected,
.p-datepicker-day-selected>.p-datepicker-day {
    background-color: var(--primary-color-soft) !important;
    color: var(--primary-color) !important;
    font-weight: 700 !important;
}

.p-datepicker-today.p-datepicker-day-selected>.p-datepicker-day,
.p-datepicker-today>.p-datepicker-day-selected {
    background-color: var(--primary-color) !important;
    color: var(--text-white) !important;
}

.p-datepicker-year-selected,
.p-datepicker-month-selected {
    background-color: var(--primary-color) !important;
    color: var(--text-white) !important;
}

.p-button-text.p-button-secondary {
    color: var(--text-base) !important;
}

.p-button-text.p-button-secondary:hover {
    color: var(--text-base) !important;
    background-color: var(--surface-ground) !important;
}

.p-datepicker-panel {
    background-color: var(--body-bg-color) !important;
    border: var(--border-width) solid var(--border-clr) !important;
    border-radius: var(--border-inner-radius) !important;
    box-shadow: none !important;
}

.p-datepicker-time-picker {
    color: var(--text-base);
}
</style>
