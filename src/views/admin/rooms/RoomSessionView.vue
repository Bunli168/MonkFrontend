<template>
    <div class="row g-2">
        <div class="col-lg-8">
            <div v-if="roomStore.isLoading">
                <RoomSessionSkeleton :count="6" />
            </div>
            <div v-else-if="!roomStore.roomSessions?.length">
                <DashboardEmptyData 
                    title="No Sessions Found" 
                    description="Create a new room session using the form to get started." 
                />
            </div>
            <div v-else class="row g-2">
                <div class="col-md-6" v-for="session in roomStore.roomSessions">
                    <div class="card gap-2 p-2" style="background-color: var(--body-bg-color);">
                        <div class="card-header bg-transparent d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center gap-2">
                                <span>{{ session.room?.name }}</span>
                                <small class="small" :class="{
                                    'text-success': session.status == 'AVAILABLE',
                                    'text-warning': session.status == 'BOOKED',
                                    'text-muted': session.status == 'UNAVAILABLE'
                                }">
                                    {{ session.status }}
                                </small>
                            </div>
                            <!-- No actions allowed -->
                        </div>
                        <div class="card-body d-flex justify-content-between"
                            style="background-color: var(--surface-ground);">
                            <span>{{ formatDate(session.date) }}</span>
                            <span>
                                {{ session.session }}
                                <small class="ms-1 fw-normal text-muted font-monospace text-xxs">
                                    {{ getSessionDurationLabel(session.session) }}
                                </small>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-4">
            <div class="card">
                <div class="card-body p-0" style="background-color: var(--body-bg-color);">
                    <BaseButton @click="onCreate()" class="w-100">Create New Session</BaseButton>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import DashboardEmptyData from '@/components/common/DashboardEmptyData.vue';
import RoomSessionSkeleton from '@/components/skeletons/RoomSessionSkeleton.vue';
import { useRoomStore } from '@/stores/rooms/room';
import { formatDate } from '@/utils/dateFormat';
import { Pencil, Trash } from '@lucide/vue';
import { onMounted } from 'vue';

const emit = defineEmits(['new', 'edit']);
const roomStore = useRoomStore();

const getSessionDurationLabel = (sessionName) => {
    const map = {
        MORNING: '(07:00 - 12:00)',
        AFTERNOON: '(13:00 - 17:00)',
        EVENING: '(17:30 - 20:30)'
    };
    return map[sessionName?.toUpperCase()] || '';
};

const onCreate = () => {
    emit('new');
}

const onUpdate = (data) => {
    emit('edit', data);
}

const handleDelete = async (id) => {
    if (!id) return;
    await roomStore.deleteRoomSession(id)
    await roomStore.getAllRoomSessions();
}



onMounted(async () => {
    await roomStore.getAllRoomSessions();
})

</script>