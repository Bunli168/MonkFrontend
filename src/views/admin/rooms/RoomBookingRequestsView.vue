<template>
    <div class="card" style="background-color: var(--surface-ground);">
        <!-- Filters Bar -->
        <div class="mb-2 d-flex align-items-center gap-2 w-100">
            <div class="flex-grow-1" style="min-width: 0;">
                <BaseFilter v-model="activeStatus" :options="filterOptions" />
            </div>
        </div>

        <!-- Table -->
        <BaseTable :columns="colDefs" :rows="roomSchedulesList" :loading="roomScheduleStore.isLoading"
            :total-records="roomScheduleStore.totalItems" v-model:page="roomScheduleStore.page" v-model:per-page="roomScheduleStore.perPage"
            v-model:sort-by="roomScheduleStore.sortBy" v-model:sort-order="roomScheduleStore.sortOrder"
            @refresh-data="loadBookings">
            <template #requester="{ data }">
                <div class="d-flex align-items-center gap-2">
                    <div class="avatar-circle d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 overflow-hidden"
                        style="width: 32px; height: 32px; background: color-mix(in srgb, var(--primary-color) 15%, transparent);">
                        <img v-if="data?.teacher?.profile?.avatarUrl" :src="$authImg(data?.teacher?.profile?.avatarUrl)" class="w-100 h-100 d-block object-fit-cover" />
                        <User v-else :size="14" style="color: var(--primary-color);" />
                    </div>
                    <div class="min-w-0">
                        <div class="fw-medium" style="color: var(--text-heading-color);">
                            {{ data?.teacher?.firstName }} {{ data?.teacher?.lastName }}
                        </div>
                        <div class="text-muted small">{{ data?.subject }}</div>
                    </div>
                </div>
            </template>

            <template #room="{ data }">
                <div class="d-flex flex-column">
                    <span class="fw-medium" style="color: var(--text-heading-color);">{{ data?.room?.name }}</span>
                    <span class="text-muted small">{{ data?.session }}</span>
                </div>
            </template>

            <template #date="{ data }">
                <div class="d-flex flex-column">
                    <span class="fw-medium">{{ formatDate(data?.date) }}</span>
                    <span class="text-muted small">{{ data?.startTime }}h – {{ data?.endTime }}h</span>
                </div>
            </template>

            <template #class="{ data }">
                <span class="badge rounded-pill px-2 py-1 fw-medium"
                    style="background: var(--surface-ground); color: var(--text-color); border: 1px solid var(--border-clr);">
                    {{ data?.className || '—' }}
                </span>
            </template>

            <template #status="{ data }">
                <BaseBadge v-if="data?.status" :status="data.status" :label="formatStatus(data.status)" />
                <span v-else>—</span>
            </template>

            <template #action="{ data }">
                <BaseActionMenu v-if="data?.status === 'PENDING'" :items="getBookingActionItems(data)" />
                <span v-else class="text-muted small">—</span>
            </template>
        </BaseTable>

        <!-- Reject Reason Modal -->
        <BaseModal v-model="showRejectModal" title="Reject Booking Request" size="sm">
            <div class="d-flex flex-column gap-3">
                <div class="p-3 rounded-3 d-flex align-items-center gap-3"
                    style="background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.15);">
                    <XCircle :size="20" class="text-danger flex-shrink-0" />
                    <div>
                        <p class="fw-semibold m-0 small" style="color: var(--text-heading-color);">
                            {{ rejectTarget?.teacher?.firstName }} {{ rejectTarget?.teacher?.lastName }}
                        </p>
                        <p class="text-muted m-0 small">
                            {{ rejectTarget?.room?.name }} · {{ rejectTarget?.session }} · {{ formatDate(rejectTarget?.date) }}
                        </p>
                    </div>
                </div>
                <BaseInput
                    v-model="rejectReason"
                    label="Rejection Reason (optional)"
                    type="textarea"
                    placeholder="e.g. Room already reserved for maintenance..."
                />
            </div>
            <template #footer>
                <div class="d-flex justify-content-end gap-2 w-100">
                    <BaseButton variant="outline-primary" @click="showRejectModal = false">Cancel</BaseButton>
                    <BaseButton variant="danger" @click="handleReject" :disabled="isRejecting">
                        <span v-if="isRejecting" class="spinner-border spinner-border-sm me-1" role="status" />
                        Confirm Reject
                    </BaseButton>
                </div>
            </template>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoomScheduleStore } from '@/stores/rooms/roomSchedule';
import { formatDate } from '@/utils/dateFormat';
import {
    CheckCircle, XCircle, User
} from '@lucide/vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseFilter from '@/components/base/BaseFilter.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseActionMenu from '@/components/base/BaseActionMenu.vue';

const roomScheduleStore = useRoomScheduleStore();

const activeStatus = ref('PENDING');
const actionLoading = ref(null);

const getBookingActionItems = (booking) => [
    {
        label: 'Approve',
        icon: CheckCircle,
        iconClass: 'text-success',
        command: () => handleApprove(booking)
    },
    {
        label: 'Reject',
        icon: XCircle,
        iconClass: 'text-danger',
        command: () => openRejectModal(booking)
    }
];

// Reject modal state
const showRejectModal = ref(false);
const rejectTarget = ref(null);
const rejectReason = ref('');
const isRejecting = ref(false);

const filterOptions = computed(() => [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'SCHEDULED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'All Requests', value: '' },
]);

const roomSchedulesList = computed(() => {
    return roomScheduleStore.roomSchedules;
});

const loadBookings = async () => {
    const params = {};
    if (activeStatus.value) {
        params.status = activeStatus.value;
    }
    await roomScheduleStore.getAllRoomSchedules(params);
};

watch(activeStatus, async () => {
    roomScheduleStore.page = 1;
    await loadBookings();
});

const handleApprove = async (booking) => {
    actionLoading.value = booking.id;
    const ok = await roomScheduleStore.approveBooking(booking.id);
    if (ok) await loadBookings();
    actionLoading.value = null;
};

const openRejectModal = (booking) => {
    rejectTarget.value = booking;
    rejectReason.value = '';
    showRejectModal.value = true;
};

const handleReject = async () => {
    if (!rejectTarget.value) return;
    isRejecting.value = true;
    const ok = await roomScheduleStore.rejectBooking(rejectTarget.value.id, rejectReason.value);
    if (ok) {
        showRejectModal.value = false;
        rejectTarget.value = null;
        await loadBookings();
    }
    isRejecting.value = false;
};



const formatStatus = (status) => {
    const map = {
        PENDING: 'Pending',
        SCHEDULED: 'Approved',
        REJECTED: 'Rejected',
        CANCELLED: 'Cancelled',
        DONE: 'Done',
        IN_PROGRESS: 'In Progress',
    };
    return map[status] || status;
};

const colDefs = [
    { field: 'requester', header: 'Requester', sortable: false },
    { field: 'room', header: 'Room / Session', sortable: false },
    { field: 'date', header: 'Date & Time', sortable: false },
    { field: 'class', header: 'Class', sortable: false },
    { field: 'status', header: 'Status', sortable: false },
    { field: 'action', header: 'Actions', sortable: false, resizeIndicator: false },
];

onMounted(() => loadBookings());
</script>

<style scoped>
.min-w-0 { min-width: 0; }
</style>
