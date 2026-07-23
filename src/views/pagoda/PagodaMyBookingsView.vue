<template>
    <div class="pb-3 h-100 d-flex flex-column align-items-center">
        <div class="w-100" style="max-width: 1000px;">
        <template v-if="authStore.isMonk">
            <MonkProfileForm />
        </template>
        <template v-else-if="authStore.isStudent">
            <StudentProfileForm />
        </template>
        <template v-else>
            <div class="row g-3 flex-grow-1" style="max-width: 1000px;">
            <div class="col-12 col-md-4 col-lg-4">
                <div class="card p-3 d-flex flex-column gap-3" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06)); position: sticky; top: 1rem;">
                    <div class="d-flex align-items-center justify-content-between">
                        <h6 class="fw-semibold mb-0 d-flex align-items-center gap-2" style="color: var(--text-base); font-size: 1rem;">
                            <Filter :size="16" />
                            <span>Filters & Actions</span>
                        </h6>
                    </div>
                    <div class="main-divider my-0"></div>

                    <!-- Filter by Status -->
                    <div v-if="!authStore.isTeacher">
                        <label class="form-label mb-2">Status</label>
                        <BaseSelect v-model="activeStatus" :options="filterOptions" placeholder="All Statuses" />
                    </div>

                    <!-- Filter by Date -->
                    <div>
                        <label class="form-label mb-2">Date</label>
                        <BaseDatePicker v-model="localDate" placeholder="Select date..." showIcon clearable />
                    </div>

                    <div class="main-divider my-0"></div>

                    <!-- View Mode toggler -->
                    <div>
                        <label class="form-label mb-2">View Mode</label>
                        <BaseSelectButton 
                            v-model="viewMode" 
                            :options="viewModeOptions"
                            optionValue="value"
                        >
                            <template #option="{ option }">
                                <component :is="option.icon" :size="15" />
                            </template>
                    </BaseSelectButton>
                    </div>

                    <!-- Create Event Action -->
                    <div v-if="authStore.isTeacher">
                        <BaseButton @click="showCreateEventModal = true" variant="primary" class="w-100 d-flex align-items-center justify-content-center gap-2">
                            <CalendarPlus :size="15" /> Create Event
                        </BaseButton>
                    </div>
                    <div v-else>
                        <BaseButton @click="goToRooms" variant="primary" class="w-100 d-flex align-items-center justify-content-center gap-2">
                            <DoorOpenIcon :size="15" /> Book a Room
                        </BaseButton>
                    </div>
                </div>
            </div>

            <!-- Right List: Cards (col-8) -->
            <div class="col-12 col-md-8 col-lg-8 d-flex flex-column">
                <transition name="fade" mode="out-in">
                    <!-- Loading State -->
                    <div v-if="roomScheduleStore.isLoading" key="loading" class="row g-3">
                        <div v-for="i in 3" :key="i" class="col-12 col-md-6">
                            <div class="card p-3 shimmer" style="height: 340px; border-radius: var(--border-radius);"></div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else-if="!roomScheduleStore.myBookings.length" key="empty" class="flex-grow-1 card d-flex flex-column align-items-center justify-content-center text-muted p-5" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06)); min-height: 300px;">
                        <BookOpen :size="64" class="mb-3 opacity-25" />
                        <h5 class="fw-bold mb-2">{{ authStore.isTeacher ? 'No schedules found' : (authStore.isMonk ? 'No monk information found' : 'No bookings found') }}</h5>
                        <p class="mb-0">You don't have any matching items.</p>
                    </div>

                    <!-- Cards Grid -->
                    <div v-else key="grid">
                        <transition-group name="list-grid" tag="div" class="row g-3">
                            <div class="col-12 col-md-6 list-grid-item" v-for="booking in roomScheduleStore.myBookings" :key="booking.id">
                    
                    <transition name="fade-layout" mode="out-in">
                        <!-- Detailed Card Style -->
                        <div v-if="viewMode === 'detailed'" key="detailed" class="card p-3 h-100 d-flex flex-column justify-content-between" style="background-color: var(--body-bg-color); border-radius: var(--border-radius)">
                            <div>
                                <div class="card-header p-0 bg-transparent mb-3 border-0" v-if="!authStore.isTeacher">
                                    <div class="d-flex align-items-center justify-content-between">
                                        <div class="d-flex align-items-center gap-2">
                                            <BaseBadge :status="booking.status" :label="formatStatus(booking.status)" />
                                            <span class="text-muted small" style="font-size: 0.72rem;">ID: #{{ booking.id }}</span>
                                        </div>
                                        
                                        <!-- Cancel button at the old ID's place (top right) -->
                                        <div v-if="booking.status === 'PENDING' || booking.status === 'SCHEDULED'">
                                            <BaseButton 
                                                variant="danger" 
                                                class="text-white d-flex align-items-center justify-content-center gap-1"
                                                @click="triggerCancel(booking.id)"
                                                style="height: 32px !important; padding-inline: 12px; font-size: 0.78rem;"
                                            >
                                                <XCircle :size="13" /> Cancel Booking
                                            </BaseButton>
                                        </div>
                                    </div>
                                </div>

                                <div class="main-divider mb-3" v-if="!authStore.isTeacher"></div>

                                <div class="card-body p-0 d-flex flex-column gap-2">
                                    <!-- Room Info Block -->
                                    <div class="rounded p-2 d-flex flex-column justify-content-center" style="background-color: var(--surface-ground);">
                                        <div class="d-flex align-items-center gap-1 text-muted mb-1" style="font-size: 0.72rem;">
                                            <DoorOpenIcon :size="12" />
                                            <span>Room</span>
                                        </div>
                                        <div class="fw-semibold text-truncate" style="font-size: 0.85rem; color: var(--text-heading-color);">
                                            {{ booking.room?.name || '—' }}
                                        </div>
                                        <div class="text-muted text-truncate" style="font-size: 0.74rem;">
                                            {{ booking.room?.building }} · Floor {{ booking.room?.floor }}
                                        </div>
                                    </div>

                                    <!-- Title & Subject Block -->
                                    <div class="rounded p-2 d-flex flex-column justify-content-center" style="background-color: var(--surface-ground);">
                                        <div class="d-flex align-items-center gap-1 text-muted mb-1" style="font-size: 0.72rem;">
                                            <BookOpen :size="12" />
                                            <span>Title & Subject</span>
                                        </div>
                                        <div class="fw-semibold text-truncate" style="font-size: 0.85rem; color: var(--text-heading-color);">
                                            {{ booking.title }}
                                        </div>
                                        <div class="text-muted text-truncate" style="font-size: 0.74rem;">
                                            {{ booking.subject }}
                                        </div>
                                    </div>

                                    <!-- Date & Time Block -->
                                    <div class="rounded p-2 d-flex flex-column justify-content-center" style="background-color: var(--surface-ground);">
                                        <div class="d-flex align-items-center gap-1 text-muted mb-1" style="font-size: 0.72rem;">
                                            <CalendarDays :size="12" />
                                            <span>Scheduled Time</span>
                                        </div>
                                        <div class="fw-semibold text-truncate" style="font-size: 0.85rem; color: var(--text-heading-color);">
                                            {{ formatDate(booking.date) }}
                                        </div>
                                        <div class="text-muted text-truncate" style="font-size: 0.74rem;">
                                            {{ booking.startTime }}h - {{ booking.endTime }}h · {{ booking.session }}
                                        </div>
                                    </div>

                                    <!-- Class / Group Block -->
                                    <div v-if="booking.className" class="rounded p-2 d-flex flex-column justify-content-center" style="background-color: var(--surface-ground);">
                                        <div class="d-flex align-items-center gap-1 text-muted mb-1" style="font-size: 0.72rem;">
                                            <Users :size="12" />
                                            <span>Class / Group</span>
                                        </div>
                                        <div class="fw-semibold text-truncate" style="font-size: 0.85rem; color: var(--text-heading-color);">
                                            {{ booking.className }}
                                        </div>
                                    </div>

                                    <!-- Rejection Reason -->
                                    <div v-if="booking.status === 'REJECTED' && booking.note"
                                        class="rounded p-2 d-flex flex-column justify-content-center"
                                        style="background-color: rgba(239, 68, 68, 0.08); border: 1px dashed rgba(239, 68, 68, 0.2);">
                                        <div class="d-flex align-items-center gap-1 text-danger mb-1" style="font-size: 0.72rem;">
                                            <AlertCircle :size="12" />
                                            <span>Rejection Reason</span>
                                        </div>
                                        <div class="fw-semibold text-danger" style="font-size: 0.82rem; line-height: 1.3;">
                                            {{ booking.note }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Minimalist Card Style -->
                        <div v-else key="minimalist" class="card p-3 h-100 d-flex flex-column justify-content-between" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); min-height: 200px;">
                            <div>
                                <!-- Header: Room and Status -->
                                <div class="d-flex align-items-center justify-content-between mb-1.5">
                                    <span class="fw-bold text-heading" style="font-size: 0.95rem; color: var(--text-heading-color);">
                                        {{ booking.room?.name || '—' }}
                                    </span>
                                    <div class="d-flex align-items-center gap-2">
                                        <span v-if="!authStore.isTeacher" class="text-muted small" style="font-size: 0.72rem;">#{{ booking.id }}</span>
                                        <BaseBadge v-if="!authStore.isTeacher" :status="booking.status" :label="formatStatus(booking.status)" />
                                    </div>
                                </div>
                                
                                <!-- Building & Floor -->
                                <div class="text-muted small mb-3 opacity-75" style="font-size: 0.72rem;">
                                    {{ booking.room?.building }} · Floor {{ booking.room?.floor }}
                                </div>

                                <!-- Title and Class/Group -->
                                <div class="fw-semibold text-truncate text-sm mb-1" style="color: var(--text-heading-color);">
                                    {{ booking.title }}
                                    <span v-if="booking.subject" class="text-muted fw-normal" style="font-size: 0.76rem;">
                                        ({{ booking.subject }})
                                    </span>
                                </div>
                                
                                <div v-if="booking.className" class="small text-muted mb-2" style="font-size: 0.72rem;">
                                    Group: <span class="fw-semibold" style="color: var(--text-heading-color);">{{ booking.className }}</span>
                                </div>
                            </div>

                            <div>
                                <div class="main-divider my-2"></div>
                                <!-- Footer: Date, Times, Cancel -->
                                <div class="d-flex align-items-center justify-content-between mt-1 small text-muted" style="font-size: 0.72rem;">
                                    <div class="d-flex align-items-center gap-1">
                                        <CalendarDays :size="11" class="opacity-75" />
                                        <span>{{ formatDate(booking.date) }} · {{ booking.startTime }}h-{{ booking.endTime }}h ({{ booking.session.charAt(0) + booking.session.slice(1).toLowerCase() }})</span>
                                    </div>
                                    
                                    <!-- Cancel at bottom right (where ID used to be) -->
                                    <div v-if="!authStore.isTeacher && (booking.status === 'PENDING' || booking.status === 'SCHEDULED')">
                                        <BaseButton 
                                            variant="danger" 
                                            class="text-white"
                                            @click="triggerCancel(booking.id)"
                                            style="height: 26px !important; padding-inline: 10px; font-size: 0.72rem;"
                                        >
                                            Cancel
                                        </BaseButton>
                                    </div>
                                </div>

                                <!-- Mini Rejection Reason -->
                                <div v-if="booking.status === 'REJECTED' && booking.note" 
                                    class="text-danger small mt-2 p-2 rounded"
                                    style="background-color: rgba(239, 68, 68, 0.05); border-left: 2px solid var(--danger-color); font-size: 0.72rem;">
                                    <strong>Reason:</strong> {{ booking.note }}
                                </div>
                            </div>
                        </div>
                    </transition>
                            </div>
                        </transition-group>
                    </div>
                </transition>

                <!-- Pagination -->
                <div v-if="roomScheduleStore.myBookings.length && roomScheduleStore.myBookingsMeta?.total > roomScheduleStore.myBookingsPerPage"
                    class="d-flex justify-content-center mt-4">
                    <BasePagination
                        v-model:page="roomScheduleStore.myBookingsPage"
                        :total="roomScheduleStore.myBookingsMeta?.total"
                        :per-page="roomScheduleStore.myBookingsPerPage"
                        @update:page="loadBookings"
                    />
                </div>
            </div>
        </div>

        <!-- Cancel Booking Confirmation Modal -->
        <BaseModal v-model="showCancelModal" title="Cancel Booking" size="sm">
            <div class="text-center p-2">
                <XCircle :size="48" class="text-danger mb-3" />
                <h6 class="mb-2 fw-semibold text-heading-color" style="font-size: 1.05rem;">Confirm Cancellation</h6>
                <p class="mb-4 text-muted" style="font-size: 0.85rem; line-height: 1.5;">
                    Are you sure you want to cancel this room booking request? This action cannot be undone.
                </p>
                <div class="d-flex gap-2 justify-content-center w-100">
                    <BaseButton 
                        variant="danger" 
                        :isLoading="cancelling === bookingToCancelId" 
                        @click="confirmCancel(bookingToCancelId)"
                        class="flex-grow-1 text-white"
                        style="height: 36px !important; font-size: 0.85rem;"
                    >
                        Yes, Cancel
                    </BaseButton>
                    <BaseButton 
                        variant="outline-secondary" 
                        @click="showCancelModal = false"
                        class="flex-grow-1"
                        style="height: 36px !important; font-size: 0.85rem;"
                    >
                        No, Keep it !
                    </BaseButton>
                </div>
            </div>
        </BaseModal>

        <!-- Create Event Modal (For Mekudi) -->
        <BaseModal v-model="showCreateEventModal" title="Create New Event" size="lg">
            <div class="p-2">
                <RoomScheduleForm ref="createEventFormRef" />
                <div class="d-flex justify-content-end gap-2 mt-4">
                    <BaseButton variant="outline-secondary" @click="showCreateEventModal = false" :disabled="isCreatingEvent">
                        Cancel
                    </BaseButton>
                    <BaseButton variant="primary" @click="handleCreateEvent" :isLoading="isCreatingEvent">
                        Create Event
                    </BaseButton>
                </div>
            </div>
        </BaseModal>
        </template>
        </div>
    </div>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRoomScheduleStore } from '@/stores/rooms/roomSchedule';
import { formatDate } from '@/utils/dateFormat';
import { DoorOpen as DoorOpenIcon, BookOpen, CalendarDays, Users, AlertCircle, LayoutGrid, List, XCircle, Filter, CalendarPlus } from '@lucide/vue';
import RoomScheduleForm from '@/components/forms/rooms/RoomScheduleForm.vue';
import MonkProfileForm from '@/views/pagoda/components/MonkProfileForm.vue';
import StudentProfileForm from '@/views/pagoda/components/StudentProfileForm.vue';
import { useToastStore } from '@/stores/toast';

import { useAuthStore } from '@/stores/auth';

const viewMode = ref(localStorage.getItem('my-bookings-view-mode') || 'detailed');

import { markRaw } from 'vue';
const viewModeOptions = [
    { icon: markRaw(LayoutGrid), value: 'detailed' },
    { icon: markRaw(List), value: 'minimalist' }
];

watch(viewMode, (newVal) => {
    localStorage.setItem('my-bookings-view-mode', newVal);
});

const router = useRouter();
const roomScheduleStore = useRoomScheduleStore();
const authStore = useAuthStore();

const activeStatus = computed({
    get: () => roomScheduleStore.myBookingsStatus,
    set: (val) => { roomScheduleStore.myBookingsStatus = val; }
});

const filterOptions = computed(() => [
    { label: authStore.isTeacher ? 'All Schedules' : (authStore.isMonk ? 'All Information' : 'All Bookings'), value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Scheduled', value: 'SCHEDULED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Cancelled', value: 'CANCELLED' },
]);

const localDate = ref(null);

const goToRooms = () => router.push({ name: 'pagoda-rooms' });

const loadBookings = async () => {
    await roomScheduleStore.getMyBookings();
};

watch(activeStatus, async () => {
    roomScheduleStore.myBookingsPage = 1;
    await loadBookings();
});

watch(localDate, async (newVal) => {
    if (newVal) {
        const d = new Date(newVal);
        const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        roomScheduleStore.myBookingsDate = ymd;
    } else {
        roomScheduleStore.myBookingsDate = '';
    }
    roomScheduleStore.myBookingsPage = 1;
    await loadBookings();
});

const formatStatus = (status) => {
    const map = {
        PENDING: 'Pending',
        SCHEDULED: 'Scheduled',
        REJECTED: 'Rejected',
        CANCELLED: 'Cancelled',
        DONE: 'Done',
        IN_PROGRESS: 'In Progress',
    };
    return map[status] || status;
};

// ─── Cancel Booking ─────────────────────────────────────────────────────────
const showCancelModal   = ref(false);
const bookingToCancelId = ref(null);
const cancelling        = ref(null);  // booking.id being cancelled (spinner)

const triggerCancel = (id) => {
    bookingToCancelId.value = id;
    showCancelModal.value = true;
};

const confirmCancel = async (id) => {
    cancelling.value = id;
    const ok = await roomScheduleStore.cancelBooking(id);
    cancelling.value = null;
    if (ok) {
        showCancelModal.value = false;
        bookingToCancelId.value = null;
        await loadBookings();
    }
};

// ─── Create Event ───────────────────────────────────────────────────────────
const showCreateEventModal = ref(false);
const createEventFormRef = ref(null);
const isCreatingEvent = ref(false);
const toastStore = useToastStore();

const handleCreateEvent = async () => {
    if (!createEventFormRef.value) return;
    const formData = await createEventFormRef.value.validateForm();
    if (!formData) return; // Validation failed

    isCreatingEvent.value = true;
    try {
        const success = await roomScheduleStore.createRoomSchedule(formData);
        if (success) {
            toastStore.showToast('Event created successfully', 'success');
            showCreateEventModal.value = false;
            createEventFormRef.value.resetForm();
            await loadBookings();
        }
    } catch (error) {
        console.error('Failed to create event:', error);
    } finally {
        isCreatingEvent.value = false;
    }
};

onMounted(() => {
    if (!authStore.isMonk) {
        loadBookings();
        roomScheduleStore.setupSocketListeners();
    }
});
</script>

<style scoped>
/* View switcher button styling */
.view-mode-btn {
    transition: all 0.2s ease;
}
.view-mode-btn.active {
    background-color: var(--primary-color) !important;
    color: #ffffff !important;
}

/* Card Shape Change Transition */
.fade-layout-enter-active,
.fade-layout-leave-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-layout-enter-from,
.fade-layout-leave-to {
    opacity: 0;
    transform: scale(0.97) translateY(5px);
}

/* Cards Grid Transition (list-grid) */
.list-grid-item {
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-grid-enter-active,
.list-grid-leave-active {
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-grid-enter-from,
.list-grid-leave-to {
    opacity: 0;
    transform: scale(0.9) translateY(15px);
}
.list-grid-leave-active {
    position: absolute;
}
.list-grid-move {
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Vue Fade Transition */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Skeleton shimmer */
.shimmer {
    background: linear-gradient(90deg, var(--surface-ground) 25%, var(--body-bg-color) 50%, var(--surface-ground) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border: 1px solid var(--border-clr);
}
@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
</style>
