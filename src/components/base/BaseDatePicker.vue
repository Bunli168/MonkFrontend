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
            :required="required"
            :showIcon="showIcon"
            :inline="inline"
            appendTo="body"
            :readonlyInput="readonlyInput"
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
    },
    readonlyInput: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

const parseLocalDate = (dateVal) => {
    if (!dateVal || typeof dateVal !== 'string') return dateVal;
    if (props.timeOnly && dateVal.includes(':') && !dateVal.includes('-')) {
        const d = new Date();
        const parts = dateVal.split(':');
        d.setHours(parseInt(parts[0] || 0), parseInt(parts[1] || 0), parseInt(parts[2] || 0), 0);
        return d;
    }
    // If dateVal is in format YYYY-MM-DD
    if (dateVal.includes('-')) {
        const parts = dateVal.split('T')[0].split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            return new Date(year, month, day, 0, 0, 0, 0);
        }
    }
    return new Date(dateVal);
};

const internalMinDate = computed(() => {
    return parseLocalDate(props.minDate);
});

const internalMaxDate = computed(() => {
    return parseLocalDate(props.maxDate);
});

const internalValue = computed({
    get: () => {
        if (props.selectionMode === 'multiple' && Array.isArray(props.modelValue)) {
            return props.modelValue.map(d => parseLocalDate(d));
        }
        return parseLocalDate(props.modelValue);
    },
    set: (val) => {
        if (props.selectionMode === 'multiple' && Array.isArray(val)) {
            const arr = val.map(v => {
                if (v instanceof Date && !isNaN(v)) {
                    const year = v.getFullYear();
                    const month = String(v.getMonth() + 1).padStart(2, '0');
                    const day = String(v.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
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
                const year = val.getFullYear();
                const month = String(val.getMonth() + 1).padStart(2, '0');
                const day = String(val.getDate()).padStart(2, '0');
                emit('update:modelValue', `${year}-${month}-${day}`);
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
