<template>
    <div class="card " style="background-color: var(--surface-ground);">
        <div class="mb-2 ms-auto">
            <BaseButton type="button" variant="primary" @click="onCreate()">Create Event</BaseButton>
        </div>
        <BaseTable :columns="colDefs" :rows="roomScheduleStore.roomSchedules" :loading="roomScheduleStore.isLoading"
            :total-records="roomScheduleStore.totalItems" v-model:page="roomScheduleStore.page" v-model:per-page="roomScheduleStore.perPage"
            v-model:sort-by="roomScheduleStore.sortBy" v-model:sort-order="roomScheduleStore.sortOrder"
            @refresh-data="roomScheduleStore.getAllRoomSchedules">
            <template #teacher="{ data }">
                <div class="d-flex align-items-center gap-2">
                    <div class="avatar-circle d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 overflow-hidden"
                        style="width: 32px; height: 32px; background: color-mix(in srgb, var(--primary-color) 15%, transparent); border: 1px solid var(--border-clr);">
                        <img v-if="data?.teacher?.profile?.avatarUrl" :src="$authImg(data.teacher.profile.avatarUrl)" class="w-100 h-100 d-block object-fit-cover" />
                        <User v-else :size="14" style="color: var(--primary-color);" />
                    </div>
                    <div class="min-w-0">
                        <div class="fw-medium" style="color: var(--text-heading-color);">
                            {{ data?.teacher?.firstName }} {{ data?.teacher?.lastName }}
                        </div>
                        <div class="text-muted small">Subject : {{ data?.subject }}</div>
                    </div>
                </div>
            </template>
            <template #room="{ data }">
                <div class="d-flex flex-column ">
                    <span>{{ data?.room?.name }}</span>
                    <span class="small">Session : {{ data?.session }}</span>
                </div>
            </template>
            <template #status="{ data }">
                <div v-if="['IN_PROGRESS', 'DONE'].includes(data.status)" class="d-flex align-items-center">
                    <BaseBadge :status="data.status" />
                </div>
                <BaseSelect v-else :options="selectableScheduleTypes" :modelValue="data.status"
                    @update:modelValue="(newVal) => onUpdateStatus(data, newVal)" />
            </template>
            <template #dates="{ data }">
                <div class="d-flex flex-column gap-1">
                    <div v-for="d in data.dates" :key="d">{{ formatDate(d) }}</div>
                </div>
            </template>
            <template #startTime="{ data }">
                <div>
                    {{ data?.startTime }}h
                    <span class="text-muted">
                        <MoveRight :size="14" />
                    </span>
                    {{ data?.endTime }}h
                </div>
            </template>
            <template #action="{ data }">
                <button @click="handleDelete(data.id)" class="btn p-0 text-danger d-flex">
                    <Trash :size="16" />
                </button>
            </template>
        </BaseTable>
    </div>

</template>

<script setup>
import { useRoomScheduleStore } from '@/stores/rooms/roomSchedule';
import { formatDate } from '@/utils/dateFormat';
import { MoveRight, Trash, User } from '@lucide/vue';
import { onMounted, ref, computed } from 'vue';



const selectableScheduleTypes = computed(() => {
    return (roomScheduleStore.roomScheduleTypes || []).filter(option => {
        const val = typeof option === 'object' ? option.value : option;
        return ['SCHEDULED', 'CANCELLED', 'REJECTED'].includes(val);
    });
});

const emit = defineEmits(['new', 'edit']);
const roomScheduleStore = useRoomScheduleStore();
const isFormView = ref(false);

const onCreate = () => {
    emit('new');
}

const onUpdateStatus = async (data, newStatus) => {
    if (!data || !newStatus) return;

    await roomScheduleStore.updateRoomScheduleStatus(data.id, { status: newStatus });
}

const handleDelete = async (id) => {
    await roomScheduleStore.deleteRoomSchedule(id);
    await roomScheduleStore.getAllRoomSchedules();
}

onMounted(async () => {
    await roomScheduleStore.getAllRoomSchedules();
    await roomScheduleStore.getAllRoomScheduleType();
})

const colDefs = [
    { field: 'startTime', header: 'Time' },
    { field: 'room', header: 'room', sortable: false },
    { field: 'teacher', header: 'teacher' },
    { field: 'status', header: 'status' },
    { field: 'className', header: 'Group', sortable: false },
    { field: 'dates', header: 'dates' },
    { field: 'action', header: 'Action', sortable: false, resizeIndicator: false },
]

</script>