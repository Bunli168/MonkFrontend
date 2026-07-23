<template>
    <div class="room-schedule-form-view mx-auto w-100" style="max-width: 850px;">
        <div class="card p-4 mb-3 shadow-sm"
            style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius); border: var(--border-width) solid var(--border-clr);">

            <!-- Step 1: Form View -->
            <div v-show="!showPreview">
                <h4 class="fw-bold mb-3 text-heading">Create Event</h4>
                <RoomScheduleForm ref="roomScheduleFormRef" />

                <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <BaseButton variant="outline-primary" @click="onCancel">Cancel</BaseButton>
                    <BaseButton type="button" @click="handlePreview" :disabled="isSubmitting">
                        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"
                            aria-hidden="true"></span>
                        Preview & Calculate
                    </BaseButton>
                </div>
            </div>

            <!-- Step 2: Preview / Review View -->
            <div v-if="showPreview">
                <div
                    class="mb-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 w-100 border-bottom pb-3">
                    <div class="d-flex align-items-center gap-2">
                        <CheckCircle class="text-success" :size="20" />
                        <h4 class="fw-bold m-0 text-heading">Review Events</h4>
                        <span class="badge bg-primary-soft text-primary ms-2">
                            {{ previewData?.totalGenerated }} Classes
                        </span>
                    </div>

                    <div class="d-flex align-items-center gap-2">
                        <BaseButton variant="outline-primary" @click="showPreview = false">Back to Edit</BaseButton>
                        <BaseButton type="button" variant="primary" @click="confirmCreate"
                            :disabled="isSubmitting || hasActiveConflicts">
                            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"
                                aria-hidden="true"></span>
                            Confirm & Create Events
                        </BaseButton>
                    </div>
                </div>

                <!-- Conflict Alert Banner -->
                <div v-if="hasActiveConflicts"
                    class="alert alert-danger d-flex align-items-start gap-2 mb-3 py-2 px-3">
                    <AlertTriangle :size="18" class="flex-shrink-0 mt-0.5" />
                    <div>
                        <h6 class="fw-bold m-0" style="font-size: 0.9rem;">Schedule Conflicts Detected</h6>
                        <span class="small" style="font-size: 0.8rem;">The room has existing schedules on some of the
                            highlighted dates. You must resolve, remove, or take over these conflicts before creating the schedule.</span>
                    </div>
                </div>

                <!-- Calculated Dates Table -->
                <BaseTable :columns="colDefs" :rows="paginatedRows" :loading="false"
                    :total-records="previewData?.dates?.length || 0" v-model:page="currentPage"
                    v-model:per-page="perPage" :show-index="true">
                    <template #date="{ data }">
                        <span class="font-monospace fw-semibold">{{ data.date }}</span>
                    </template>
                    <template #dayName="{ data }">
                        <span class="text-muted fw-medium">{{ data.dayName }}</span>
                    </template>
                    <template #session="{ data }">
                        <span class="badge bg-secondary-soft text-secondary text-uppercase">{{ data.session }}</span>
                    </template>
                    <template #time="{ data }">
                        <span>{{ data.time }}</span>
                    </template>
                    <template #status="{ data }">
                        <div v-if="data.hasConflict"
                            class="text-danger small fw-semibold d-flex align-items-center gap-1"
                            v-tooltip="data.conflictTitle">
                            <AlertTriangle :size="14" /> Conflicting
                        </div>
                        <div v-else-if="data.isTakenOver"
                            class="text-warning small fw-semibold d-flex align-items-center gap-1.5"
                            v-tooltip="'Admin took over this schedule. Overlapping user booking will be auto-rejected.'">
                            <AlertTriangle :size="14" /> Taken Over
                        </div>
                        <span v-else class="text-success d-flex align-items-center gap-1.5 small fw-semibold">
                            <CheckCircle :size="14" /> Available
                        </span>
                    </template>
                    <template #action="{ data }">
                        <div class="d-flex align-items-center justify-content-center">
                            <BaseActionMenu :items="getActionItems(data)" />
                        </div>
                    </template>
                </BaseTable>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoomScheduleStore } from '@/stores/rooms/roomSchedule';
import RoomScheduleForm from '@/components/forms/rooms/RoomScheduleForm.vue';
import { CheckCircle, AlertTriangle, Trash2 } from '@lucide/vue';

const emit = defineEmits(['close']);

const roomScheduleStore = useRoomScheduleStore();
const roomScheduleFormRef = ref(null);
const isSubmitting = ref(false);

const showPreview = ref(false);
const previewData = ref(null);
const schedulePayload = ref(null);
const takeOverScheduleIds = ref([]);

const colDefs = [
    { field: 'date', header: 'Date', sortable: false },
    { field: 'dayName', header: 'Day', sortable: false },
    { field: 'session', header: 'Session', sortable: false },
    { field: 'time', header: 'Time', sortable: false },
    { field: 'status', header: 'Status', sortable: false },
    { field: 'action', header: 'Action', sortable: false }
];

const currentPage = ref(1);
const perPage = ref(10);

const onCancel = () => {
    emit('close');
};

const handlePreview = async () => {
    const formRef = roomScheduleFormRef.value;
    if (!formRef) return;

    const payload = await formRef.validateForm();
    if (!payload) return;

    console.log(payload);

    isSubmitting.value = true;
    try {
        const result = await roomScheduleStore.previewRoomSchedule(payload.roomId, payload);
        if (result) {
            previewData.value = result;
            schedulePayload.value = payload;
            showPreview.value = true;
            currentPage.value = 1;
            takeOverScheduleIds.value = [];
        }
    } finally {
        isSubmitting.value = false;
    }
};

const confirmCreate = async () => {
    if (!schedulePayload.value) return;

    isSubmitting.value = true;
    try {
        const payload = {
            ...schedulePayload.value,
            takeOverScheduleIds: takeOverScheduleIds.value
        };
        const apiResult = await roomScheduleStore.createRoomSchedule(payload);

        if (apiResult) {
            const formRef = roomScheduleFormRef.value;
            if (formRef && formRef.resetForm) formRef.resetForm();
            showPreview.value = false;
            previewData.value = null;
            schedulePayload.value = null;
            takeOverScheduleIds.value = [];
            emit('close');
        }
    } finally {
        isSubmitting.value = false;
    }
};

const isDateConflicting = (dateStr) => {
    if (!previewData.value || !previewData.value.conflicts) return false;
    return previewData.value.conflicts.some(c => c.date === dateStr);
};

const getConflictTitle = (dateStr) => {
    if (!previewData.value || !previewData.value.conflicts) return '';
    const conflict = previewData.value.conflicts.find(c => c.date === dateStr);
    return conflict ? `Conflict: ${conflict.title}` : 'Conflict detected';
};

const getConflictData = (dateStr) => {
    if (!previewData.value || !previewData.value.conflicts) return [];
    return previewData.value.conflicts.filter(c => c.date === dateStr);
};

const isDateTakenOver = (dateStr) => {
    const conflictsForDate = getConflictData(dateStr);
    if (!conflictsForDate || conflictsForDate.length === 0) return false;
    return conflictsForDate.every(c => takeOverScheduleIds.value.includes(c.id));
};

const hasActiveConflicts = computed(() => {
    if (!previewData.value || !previewData.value.dates) return false;
    return previewData.value.dates.some(item => {
        const dateStr = typeof item === 'object' ? item.date : item;
        return isDateConflicting(dateStr) && !isDateTakenOver(dateStr);
    });
});

const takeOverDate = (dateStr) => {
    const conflictsForDate = getConflictData(dateStr);
    if (conflictsForDate) {
        conflictsForDate.forEach(c => {
            if (c.id && !takeOverScheduleIds.value.includes(c.id)) {
                takeOverScheduleIds.value.push(c.id);
            }
        });
    }
};

const cancelTakeOverDate = (dateStr) => {
    const conflictsForDate = getConflictData(dateStr);
    if (conflictsForDate) {
        const idsToRemove = conflictsForDate.map(c => c.id);
        takeOverScheduleIds.value = takeOverScheduleIds.value.filter(id => !idsToRemove.includes(id));
    }
};

const getActionItems = (row) => {
    const items = [];
    
    if (row.hasConflict) {
        items.push({
            label: 'Take Over',
            icon: AlertTriangle,
            iconClass: 'text-warning',
            command: () => takeOverDate(row.date)
        });
    } else if (row.isTakenOver) {
        items.push({
            label: 'Undo Take Over',
            icon: CheckCircle,
            iconClass: 'text-success',
            command: () => cancelTakeOverDate(row.date)
        });
    }

    items.push({
        label: 'Remove Date',
        icon: Trash2,
        iconClass: 'text-danger',
        command: () => removeDate(row.date)
    });

    return items;
};

const tableRows = computed(() => {
    if (!previewData.value || !previewData.value.dates) return [];
    return previewData.value.dates.map(item => {
        const dateStr = typeof item === 'object' ? item.date : item;
        const dayName = typeof item === 'object' ? item.dayName : '';
        const isTakenOver = isDateTakenOver(dateStr);
        const hasConflict = isDateConflicting(dateStr) && !isTakenOver;
        const conflictTitle = getConflictTitle(dateStr);
        return {
            date: dateStr,
            dayName: dayName,
            session: schedulePayload.value?.session || 'MORNING',
            time: `${schedulePayload.value?.startTime || ''} - ${schedulePayload.value?.endTime || ''}`,
            hasConflict,
            isTakenOver,
            conflictTitle
        };
    });
});

const paginatedRows = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    const end = start + perPage.value;
    return tableRows.value.slice(start, end);
});

const removeDate = (dateStr) => {
    if (!previewData.value || !previewData.value.dates) return;
    const idx = previewData.value.dates.findIndex(item => {
        const d = typeof item === 'object' ? item.date : item;
        return d === dateStr;
    });
    if (idx !== -1) {
        // Clear taken over ids for this date
        const conflictsForDate = getConflictData(dateStr);
        if (conflictsForDate) {
            const idsToRemove = conflictsForDate.map(c => c.id);
            takeOverScheduleIds.value = takeOverScheduleIds.value.filter(id => !idsToRemove.includes(id));
        }

        previewData.value.dates.splice(idx, 1);
        previewData.value.totalGenerated = previewData.value.dates.length;

        previewData.value.hasConflicts = previewData.value.dates.some(item => {
            const d = typeof item === 'object' ? item.date : item;
            return isDateConflicting(d);
        });

        const remainingDates = previewData.value.dates.map(item => {
            return typeof item === 'object' ? item.date : item;
        });

        schedulePayload.value = {
            ...schedulePayload.value,
            isRecurring: false,
            dates: remainingDates
        };

        const maxPage = Math.ceil(previewData.value.dates.length / perPage.value) || 1;
        if (currentPage.value > maxPage) {
            currentPage.value = maxPage;
        }

        if (previewData.value.dates.length === 0) {
            showPreview.value = false;
            previewData.value = null;
            schedulePayload.value = null;
        }
    }
};
</script>

<style scoped>
.bg-light-soft {
    background-color: var(--surface-ground);
}

.bg-danger-soft {
    background-color: rgba(220, 53, 69, 0.08) !important;
}

.bg-primary-soft {
    background-color: var(--primary-color-soft);
}

.bg-secondary-soft {
    background-color: rgba(108, 117, 125, 0.1);
}
</style>
