<template>
    <form>
        <div class="row g-3 mb-3">
            <div class="col-md-12">
                <BaseSelect label="Monk Name" required placeholder="Select Monk" :options="teacherOptions"
                    v-model="teacherId" :error="errors.teacherId">
                </BaseSelect>
            </div>
        </div>

        <div class="mb-3 date-rules-section">
            <BaseSelectButton v-model="isRecurring" label="Date Rules" :options="dateRuleOptions" class="w-100" />

            <div class="main-divider my-3"></div>

            <div v-if="!isRecurring" class="specific-dates-wrapper">
                <div class="row g-3 align-items-end mb-3">
                    <div class="col-md-9 col-8">
                        <BaseDatePicker label="Add Required Dates" required placeholder="yyyy-mm-dd"
                            v-model="tempDate" />
                    </div>
                    <div class="col-md-3 col-4">
                        <BaseButton type="button" variant="outline-primary" class="w-100" @click="addSpecificDate">
                            Add
                        </BaseButton>
                    </div>
                </div>

                <div class="dates-chips-container p-3 rounded-3 d-flex flex-wrap gap-2" style="min-height: 50px;">
                    <span v-for="(d, idx) in dates" :key="d"
                        class="date-chip d-flex align-items-center gap-2 px-3 py-1 rounded-pill">
                        {{ d }}
                        <X :size="12" class="cursor-pointer text-danger" @click="removeSpecificDate(idx)" />
                    </span>
                    <span v-if="!dates?.length" class="text-muted small my-auto">No dates added yet.</span>
                </div>
            </div>

            <!-- Recurring Period View -->
            <div v-else class="recurring-semester-wrapper">
                <div class="row g-3">
                    <div class="col-md-6">
                        <BaseDatePicker required label="Start Date" placeholder="yyyy-mm-dd"
                            v-model="startDate" />
                    </div>
                    <div class="col-md-6">
                        <BaseDatePicker required label="End Date" placeholder="yyyy-mm-dd" v-model="endDate" />
                    </div>
                </div>

                <div class="mt-3">
                    <label class="form-label small fw-semibold text-muted d-block">Repeats On <span style="color: var(--danger-color)">*</span></label>
                    <div class="d-flex flex-wrap gap-2">
                        <button v-for="day in weekdayOptions" :key="day.value" type="button"
                            class="weekday-btn rounded-circle d-flex align-items-center justify-content-center"
                            :class="{ 'active': daysOfWeek.includes(day.value) }" @click="toggleWeekday(day.value)">
                            {{ day.label }}
                        </button>
                    </div>
                </div>
            </div>

            <small v-if="dateErrors" class="text-danger mt-1 d-block fw-semibold">{{ dateErrors }}</small>
        </div>

        <!-- Time Selection -->
        <div class="row g-3 mb-1">
            <div class="col-md-6">
                <BaseDatePicker required class="w-100" timeOnly label="Start Time" placeholder="10:00"
                    v-model="startTime" :error="errors.startTime">
                </BaseDatePicker>
            </div>
            <div class="col-md-6">
                <BaseDatePicker required class="w-100" timeOnly label="End Time" placeholder="11:00" v-model="endTime"
                    :error="errors.endTime">
                </BaseDatePicker>
            </div>
        </div>
        <!-- Time guidelines -->
        <div class="text-xs text-muted mb-3 d-flex flex-wrap gap-x-3 gap-y-1 px-1">
            <span><strong>Morning:</strong> 07:00 - 12:00</span>
            <span><strong>Afternoon:</strong> 13:00 - 17:00</span>
            <span><strong>Evening:</strong> 17:30 - 20:30</span>
        </div>

        <!-- Notes -->
        <div class="mb-0">
            <BaseInput type="textarea" :rows="2" label="Note" placeholder="Additional notes" v-model="note"
                :error="errors.note" />
        </div>
    </form>
</template>

<script setup>
import { useRoomStore } from '@/stores/rooms/room';
import { useUserStore } from '@/stores/users/user';
import { onMounted, ref, watch } from 'vue';
import { useForm, useField } from 'vee-validate';
import { roomSchemas } from '@/utils/validations';
import { X } from '@lucide/vue';

const roomStore = useRoomStore();
const userStore = useUserStore();
const teacherOptions = ref([]);
const roomOptions = ref([]);

const isRecurring = ref(false);
const startDate = ref('');
const endDate = ref('');
const daysOfWeek = ref([]);
const tempDate = ref('');
const dateErrors = ref('');

const dateRuleOptions = [
    { label: 'Specific Dates', value: false },
    { label: 'Recurring Semester', value: true }
];

const weekdayOptions = [
    { label: 'M', value: 1 },
    { label: 'T', value: 2 },
    { label: 'W', value: 3 },
    { label: 'T', value: 4 },
    { label: 'F', value: 5 },
    { label: 'S', value: 6 },
    { label: 'S', value: 0 }
];

onMounted(async () => {
    await roomStore.getAllRooms();
    await roomStore.getAllRoomSessionType();
    roomOptions.value = roomStore.rooms.map(r => ({ label: r.name, value: r.id }));

    await userStore.getAllUsers({ roleId: 3 });
    teacherOptions.value = userStore.users.map(u => ({ label: u.name, value: u.id }));
});

const props = defineProps({
    initialData: Object
});

const { validate, setValues, errors, resetForm } = useForm({
    validationSchema: roomSchemas.schedule,
    initialValues: {
        teacherId: null,
        dates: [],
        startTime: "",
        endTime: "",
        note: ""
    }
});

const { value: teacherId } = useField('teacherId');
const { value: dates } = useField('dates');
const { value: startTime } = useField('startTime');
const { value: endTime } = useField('endTime');
const { value: note } = useField('note');

const toggleWeekday = (val) => {
    const idx = daysOfWeek.value.indexOf(val);
    if (idx !== -1) {
        daysOfWeek.value.splice(idx, 1);
    } else {
        daysOfWeek.value.push(val);
    }
};

const addSpecificDate = () => {
    if (!tempDate.value) return;
    if (dates.value.includes(tempDate.value)) {
        tempDate.value = '';
        return;
    }
    if (!dates.value) {
        dates.value = [];
    }
    dates.value.push(tempDate.value);
    tempDate.value = '';
    dateErrors.value = '';
};

const removeSpecificDate = (idx) => {
    dates.value.splice(idx, 1);
};

const initForm = () => {
    isRecurring.value = false;
    startDate.value = '';
    endDate.value = '';
    daysOfWeek.value = [];
    tempDate.value = '';
    dateErrors.value = '';

    if (props.initialData) {
        setValues({
            teacherId: props.initialData.teacherId || '',
            dates: props.initialData.dates || [],
            startTime: props.initialData.startTime || '',
            endTime: props.initialData.endTime || '',
            note: props.initialData.note || '',
        });
        if (props.initialData.isRecurring) {
            isRecurring.value = true;
            startDate.value = props.initialData.startDate || '';
            endDate.value = props.initialData.endDate || '';
            daysOfWeek.value = props.initialData.daysOfWeek || [];
        }
    } else {
        resetForm();
    }
};

const validateForm = async () => {
    const { valid } = await validate();
    dateErrors.value = '';

    if (isRecurring.value) {
        if (!startDate.value) {
            dateErrors.value = 'Start Date is required.';
            return false;
        }
        if (!endDate.value) {
            dateErrors.value = 'End Date is required.';
            return false;
        }
        if (!daysOfWeek.value || daysOfWeek.value.length === 0) {
            dateErrors.value = 'At least one repeat day must be selected.';
            return false;
        }
    } else {
        if (!dates.value || dates.value.length === 0) {
            dateErrors.value = 'At least one specific date must be added.';
            return false;
        }
    }

    if (valid) {
        return {
            teacherId: teacherId.value,
            isRecurring: isRecurring.value,
            startTime: startTime.value,
            endTime: endTime.value,
            note: note.value || '',
            ...(isRecurring.value ? {
                startDate: startDate.value,
                endDate: endDate.value,
                daysOfWeek: daysOfWeek.value
            } : {
                dates: dates.value
            })
        };
    }
    return false;
};

const customResetForm = () => {
    resetForm();
    isRecurring.value = false;
    startDate.value = '';
    endDate.value = '';
    daysOfWeek.value = [];
    tempDate.value = '';
    dateErrors.value = '';
};

watch(() => props.initialData, () => {
    initForm();
}, { deep: true, immediate: true });

defineExpose({ validateForm, initForm, resetForm: customResetForm });
</script>

<style scoped>

.dates-chips-container {
    background-color: var(--surface-ground);
    border: 1px solid var(--border-clr);
    padding: 0.75rem;
}

.date-chip {
    background-color: var(--body-bg-color);
    border: 1px solid var(--border-clr);
    color: var(--text-base);
    font-size: 0.85rem;
    font-weight: 500;
    padding: 0.35rem 0.75rem;
}

.weekday-btn {
    width: 36px;
    height: 36px;
    border: 1px solid var(--border-clr);
    background-color: var(--body-bg-color);
    color: var(--text-base);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    line-height: 1;
}

.weekday-btn.active {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-white);
}

.weekday-btn:hover:not(.active) {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

</style>