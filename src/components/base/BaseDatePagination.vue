<template>
    <div class="base-date-pagination">
        <div class="d-flex align-items-center gap-2 mb-3">
            <CalendarDays class="text-primary" :size="20" />
            <span class="fw-semibold text-heading" style="font-size: 0.95rem;">Select Date / ជ្រើសរើសថ្ងៃ</span>
        </div>

        <div class="calendar-wrapper overflow-hidden">
            <BaseDatePicker inline v-model="currentDate" />
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { CalendarDays } from '@lucide/vue';
import BaseDatePicker from '@/components/base/BaseDatePicker.vue';

const props = defineProps({
    modelValue: {
        type: [Date, String],
        default: () => new Date()
    }
});

const emit = defineEmits(['update:modelValue']);

const currentDate = ref(props.modelValue);

watch(currentDate, (newValue) => {
    emit('update:modelValue', newValue);
});

watch(() => props.modelValue, (newValue) => {
    currentDate.value = newValue;
});
</script>

<style scoped>
.base-date-pagination {
    display: flex;
    flex-direction: column;
}
</style>
