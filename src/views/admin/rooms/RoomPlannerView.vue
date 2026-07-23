<template>
  <div class="room-planner-container">
    <div class="row g-3">
      <!-- Left Column: Calendar selection -->
      <div class="col-lg-4">
        <div class="card p-3 h-100 planner-sidebar">
          <div class="d-flex align-items-center gap-2 mb-3">
            <CalendarDays class="text-primary" :size="20" />
            <h5 class="fw-bold m-0 text-heading">Select Date</h5>
          </div>

          <div class="calendar-wrapper overflow-hidden">
            <BaseDatePicker inline v-model="selectedDate" />
          </div>

          <div class="mt-4 info-panel p-3 rounded-3">
            <div class="d-flex align-items-center gap-2 text-primary mb-2">
              <Info :size="16" />
              <span class="fw-bold small">Planner Info</span>
            </div>
            <p class="text-muted small mb-2">
              Select a date on the calendar to see all session availabilities and schedules. You can filter results by
              specific rooms using the dropdown filter on the right.
            </p>
            <div class="border-top pt-2 mt-2">
              <span class="text-xs fw-bold text-heading d-block mb-2" style="font-size: 0.75rem;">Session
                Timings:</span>
              <div class="d-flex flex-column gap-2">
                <div class="d-flex align-items-center justify-content-between text-xs">
                  <span class="text-muted">Morning:</span>
                  <span class="fw-semibold text-heading">08:00 - 12:00</span>
                </div>
                <div class="d-flex align-items-center justify-content-between text-xs">
                  <span class="text-muted">Afternoon:</span>
                  <span class="fw-semibold text-heading">13:00 - 17:00</span>
                </div>
                <div class="d-flex align-items-center justify-content-between text-xs">
                  <span class="text-muted">Evening:</span>
                  <span class="fw-semibold text-heading">17:30 - 20:30</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Results & Controls -->
      <div class="col-lg-8">
        <div class="card p-3 h-100 planner-details">
          <!-- Top Row: Date Display & Room Filter -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
            <div class="d-flex align-items-center gap-3">
              <div class="date-badge text-center p-2 rounded-3 bg-primary-soft text-primary"
                style="width: 55px; flex-shrink: 0;">
                <span class="d-block fw-bold fs-5">{{ getDayOfMonth(selectedDate) }}</span>
                <span class="d-block text-uppercase small" style="font-size: 0.7rem; font-weight: 700;">{{
                  getMonthName(selectedDate) }}</span>
              </div>
              <div>
                <h4 class="fw-bold mb-1 text-heading">Planner Overview</h4>
                <p class="text-muted small mb-0">{{ formatFriendlyDate(selectedDate) }}</p>
              </div>
            </div>

            <div class="d-flex align-items-center gap-2 flex-wrap">
              <div style="width: 180px;">
                <BaseSelect placeholder="All Rooms" v-model="selectedRoomId" :options="roomOptions" class="w-100" />
              </div>
              <div style="width: 180px;">
                <BaseSelect placeholder="All Sessions" v-model="selectedSession" :options="sessionOptions"
                  class="w-100" />
              </div>
            </div>
          </div>

          <div class="main-divider mb-3"></div>

          <!-- Bottom: Split Sessions & Schedules -->
          <div class="row g-3">
            <!-- Left Side: Sessions -->
            <div class="col-md-6 border-end-md">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="d-flex align-items-center gap-2">
                  <SquareStack class="text-success" :size="18" />
                  <h5 class="fw-bold m-0 text-heading">Room Sessions</h5>
                  <span class="badge bg-success-soft text-success rounded-pill px-2 small">{{
                    filteredSessions.length }}</span>
                </div>
                <BaseButton size="sm" variant="outline-primary" @click="onCreateSession">
                  <Plus :size="14" class="me-1" /> New
                </BaseButton>
              </div>

              <div class="scrollable-container" style="max-height: 480px; overflow-y: auto;">
                <transition name="fade-slide" mode="out-in">
                  <div v-if="roomStore.isLoading" class="d-flex flex-column gap-2 pe-1" key="loading">
                    <div v-for="i in 3" :key="i"
                      class="skeleton-card p-3 rounded-3 border d-flex flex-column gap-2 skeleton-pulse">
                      <div class="skeleton-line title"></div>
                      <div class="d-flex justify-content-between align-items-center mt-1">
                        <div class="skeleton-line badge-pill"></div>
                        <div class="skeleton-line badge-pill"></div>
                      </div>
                    </div>
                  </div>
                  <div v-else-if="!filteredSessions.length" class="text-center py-5 text-muted" key="empty">
                    <DashboardEmptyData title="No Sessions" description="No session availability set for this date." />
                  </div>
                  <transition-group v-else name="list" tag="div" class="d-flex flex-column gap-2 pe-1" key="content">
                    <div v-for="session in filteredSessions" :key="session.id || session.roomId + '-' + session.session"
                      class="session-item-card p-3 rounded-3 border d-flex flex-column gap-2">
                      <div class="d-flex align-items-center justify-content-between">
                        <span class="fw-bold text-heading">{{ session.room?.name }}</span>
                      </div>
                      <div class="d-flex align-items-center justify-content-between text-sm mt-1">
                        <div class="d-flex align-items-center gap-2">
                          <Tag :size="13" :stroke-width="2.5" :class="`text-session-${session.session.toLowerCase()}`"
                            class="flex-shrink-0" />
                          <span class="fw-semibold text-xs text-uppercase text-muted-dark"
                            style="color: var(--text-muted);">
                            {{ session.session }}
                            <span class="ms-1 fw-normal text-muted-light font-monospace text-xxs">
                              {{ getSessionDurationLabel(session.session) }}
                            </span>
                          </span>
                        </div>
                        <BaseBadge :status="session.status" />
                      </div>
                      <div v-if="session.note"
                        class="text-xs text-muted mt-1 bg-surface p-2 rounded border border-light-subtle">
                        <strong>Note:</strong> {{ session.note }}
                      </div>
                    </div>
                  </transition-group>
                </transition>
              </div>
            </div>

            <!-- Right Side: Schedules -->
            <div class="col-md-6">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="d-flex align-items-center gap-2">
                  <CalendarCheck class="text-warning" :size="18" />
                  <h5 class="fw-bold m-0 text-heading">Events</h5>
                  <span class="badge bg-warning-soft text-warning rounded-pill px-2 py-0.5 small">{{
                    filteredSchedules.length }}</span>
                </div>
                <BaseButton size="sm" variant="primary" @click="onCreateSchedule">
                  <Plus :size="14" class="me-1" /> Add
                </BaseButton>
              </div>

              <div class="scrollable-container" style="max-height: 480px; overflow-y: auto;">
                <transition name="fade-slide" mode="out-in">
                  <div v-if="roomScheduleStore.isLoading" class="d-flex flex-column gap-2 pe-1" key="loading">
                    <div v-for="i in 3" :key="i"
                      class="skeleton-card p-3 rounded-3 border d-flex flex-column gap-2 skeleton-pulse">
                      <div class="skeleton-line title"></div>
                      <div class="skeleton-line subtitle"></div>
                      <div class="skeleton-line content mt-1"></div>
                    </div>
                  </div>
                  <div v-else-if="!filteredSchedules.length" class="text-center py-5 text-muted" key="empty">
                    <DashboardEmptyData title="No Events" description="No events booked for this date." />
                  </div>
                  <transition-group v-else name="list" tag="div" class="d-flex flex-column gap-2 pe-1" key="content">
                    <div v-for="schedule in filteredSchedules" :key="schedule.id"
                      class="schedule-item-card p-3 rounded-3 border d-flex flex-column gap-2">
                      <div class="d-flex align-items-start justify-content-between">
                        <div>
                          <h6 class="fw-bold m-0 text-primary">{{ schedule.title }}</h6>
                          <span class="text-xs text-muted">{{ schedule.subject }} • {{ schedule.className }}</span>
                        </div>
                        <button @click="handleDeleteSchedule(schedule.id)" class="btn btn-link p-0 text-danger">
                          <Trash :size="14" />
                        </button>
                      </div>

                      <div
                        class="p-2 rounded bg-surface border border-light-subtle d-flex flex-column gap-1 text-sm mt-1">
                        <div class="d-flex align-items-center gap-2">
                          <School :size="14" class="text-muted" />
                          <span class="fw-semibold text-heading">{{ schedule.room?.name }}</span>
                          <span class="text-xs text-muted">({{ schedule.room?.building }}, F{{ schedule.room?.floor
                            }})</span>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                          <div v-if="schedule.teacher?.profile?.avatarUrl"
                            class="avatar-circle d-flex align-items-center justify-content-center rounded-circle overflow-hidden flex-shrink-0"
                            style="width: 24px; height: 24px; border: 1px solid var(--border-clr);">
                            <img :src="$authImg(schedule.teacher.profile.avatarUrl)"
                              class="w-100 h-100 d-block object-fit-cover" />
                          </div>
                          <User v-else :size="14" class="text-muted" />
                          <span>{{ schedule.teacher?.firstName }} {{ schedule.teacher?.lastName }}</span>
                        </div>
                        <div class="d-flex align-items-center gap-2 text-xs">
                          <Clock :size="14" class="text-muted" />
                          <span>{{ schedule.startTime }} - {{ schedule.endTime }} ({{ schedule.session }})</span>
                        </div>
                      </div>

                      <div class="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
                        <span class="text-xs text-muted">Status:</span>
                        <div v-if="['IN_PROGRESS', 'DONE'].includes(schedule.status)" class="d-flex justify-content-end"
                          style="width: 165px;">
                          <BaseBadge :status="schedule.status" />
                        </div>
                        <div v-else style="width: 165px;">
                          <BaseSelect :options="selectableScheduleTypes" :modelValue="schedule.status"
                            class="select-sm w-100"
                            @update:modelValue="(newVal) => onUpdateScheduleStatus(schedule, newVal)" />
                        </div>
                      </div>
                    </div>
                  </transition-group>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Event Modal -->
    <BaseModal v-model="showDeleteModal" size="sm" title="Confirm Delete">
      <p class="mb-0">Are you sure you want to delete this event?</p>
      <template #footer>
        <BaseButton type="button" variant="outline-danger" class="flex-grow-1" @click="showDeleteModal = false"
          :disabled="isDeletingSchedule">
          Cancel
        </BaseButton>
        <BaseButton type="button" variant="danger" class="flex-grow-1" @click="confirmDeleteSchedule"
          :disabled="isDeletingSchedule">
          <span v-if="isDeletingSchedule" class="spinner-border spinner-border-sm me-2" role="status"
            aria-hidden="true"></span>
          {{ isDeletingSchedule ? 'Deleting...' : 'Delete' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoomStore } from '@/stores/rooms/room';
import { useRoomScheduleStore } from '@/stores/rooms/roomSchedule';
import {
  CalendarDays, SquareStack, CalendarCheck, Plus, Pencil, Trash,
  School, User, Clock, Info, Tag
} from '@lucide/vue';
import DashboardEmptyData from '@/components/common/DashboardEmptyData.vue';

const emit = defineEmits(['new-session', 'edit-session', 'new-schedule']);

const roomStore = useRoomStore();
const roomScheduleStore = useRoomScheduleStore();

const showDeleteModal = ref(false);
const scheduleIdToDelete = ref(null);
const isDeletingSchedule = ref(false);

const getTodayString = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const adjustedDate = new Date(today.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().split('T')[0];
};

const selectedDate = ref(getTodayString());
const selectedRoomId = ref('');
const selectedSession = ref('');

// Room options populated from store
const roomOptions = computed(() => {
  return [
    { label: 'All Rooms', value: '' },
    ...roomStore.rooms.map(room => ({
      label: room.name,
      value: room.id
    }))
  ];
});

const sessionOptions = [
  { label: 'All Sessions', value: '' },
  { label: 'Morning', value: 'MORNING' },
  { label: 'Afternoon', value: 'AFTERNOON' },
  { label: 'Evening', value: 'EVENING' }
];

const getSessionDurationLabel = (sessionName) => {
  const map = {
    MORNING: '(07:00 - 12:00)',
    AFTERNOON: '(13:00 - 17:00)',
    EVENING: '(17:30 - 20:30)'
  };
  return map[sessionName?.toUpperCase()] || '';
};

const selectableScheduleTypes = computed(() => {
  return (roomScheduleStore.roomScheduleTypes || []).filter(option => {
    const val = typeof option === 'object' ? option.value : option;
    return ['SCHEDULED', 'CANCELLED', 'REJECTED'].includes(val);
  });
});

const filteredSessions = computed(() => {
  let list = roomStore.roomSessions || [];
  if (selectedSession.value) {
    list = list.filter(session => session.session === selectedSession.value);
  }
  return list;
});

const filteredSchedules = computed(() => {
  let list = roomScheduleStore.roomSchedules || [];
  if (selectedSession.value) {
    list = list.filter(schedule => schedule.session === selectedSession.value);
  }
  return list;
});

const getDayOfMonth = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.getDate();
};

const getMonthName = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { month: 'short' });
};

const formatFriendlyDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};



// Fetch data logic
const loadData = async () => {
  const formattedDate = selectedDate.value;
  const roomId = selectedRoomId.value;

  const params = {
    date: formattedDate
  };
  if (roomId) {
    params.roomId = roomId;
  }

  // Load sessions
  await roomStore.getAllRoomSessions({ ...params, forceRefresh: true });

  // Load schedules
  await roomScheduleStore.getAllRoomSchedules(params);
};

// Watchers
watch([selectedDate, selectedRoomId], async () => {
  await loadData();
});

onMounted(async () => {
  // Make sure we have the list of rooms for the dropdown
  await roomStore.getAllRooms();
  // Load schedule status types for status change dropdown
  await roomScheduleStore.getAllRoomScheduleType();
  // Initial fetch for schedules and sessions
  await loadData();
  // Enable real-time updates
  roomStore.setupSocketListeners();
  roomScheduleStore.setupSocketListeners();
});

// Action methods
const onCreateSession = () => {
  emit('new-session');
};

const onEditSession = (session) => {
  emit('edit-session', session);
};

const handleDeleteSession = async (id) => {
  if (!confirm('Are you sure you want to delete this session availability?')) return;
  const res = await roomStore.deleteRoomSession(id);
  if (res !== false) {
    await loadData();
  }
};

const onCreateSchedule = () => {
  emit('new-schedule');
};

const onUpdateScheduleStatus = async (schedule, newStatus) => {
  if (!schedule || !newStatus) return;
  const res = await roomScheduleStore.updateRoomScheduleStatus(schedule.id, { status: newStatus });
  if (res) {
    await loadData();
  }
};

const handleDeleteSchedule = (id) => {
  scheduleIdToDelete.value = id;
  showDeleteModal.value = true;
};

const confirmDeleteSchedule = async () => {
  if (!scheduleIdToDelete.value) return;
  isDeletingSchedule.value = true;
  try {
    const res = await roomScheduleStore.deleteRoomSchedule(scheduleIdToDelete.value);
    if (res) {
      showDeleteModal.value = false;
      scheduleIdToDelete.value = null;
      await loadData();
    }
  } finally {
    isDeletingSchedule.value = false;
  }
};
</script>

<style scoped>
.planner-sidebar {
  background-color: var(--body-bg-color);
  border-radius: var(--border-inner-radius);
  border: var(--border-width) solid var(--border-clr);
}

.planner-details {
  background-color: var(--body-bg-color);
  border-radius: var(--border-inner-radius);
  border: var(--border-width) solid var(--border-clr);
}

.info-panel {
  background-color: var(--surface-ground);
  border: 1px solid var(--border-clr);
}

.bg-primary-soft {
  background-color: var(--primary-color-soft);
}

.bg-success-soft {
  background-color: rgba(25, 135, 84, 0.15);
}

.bg-warning-soft {
  background-color: rgba(255, 193, 7, 0.15);
}

.border-end-md {
  border-right: var(--border-width) solid var(--border-clr);
}

@media (max-width: 768px) {
  .border-end-md {
    border-right: none;
    border-bottom: var(--border-width) solid var(--border-clr);
    padding-bottom: 20px;
    margin-bottom: 20px;
  }
}

.scrollable-container::-webkit-scrollbar {
  width: 6px;
}

.scrollable-container::-webkit-scrollbar-track {
  background: transparent;
}

.scrollable-container::-webkit-scrollbar-thumb {
  background: var(--border-clr);
  border-radius: 3px;
}

.scrollable-container::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

.session-item-card,
.schedule-item-card {
  background-color: var(--surface-ground);
}

.bg-surface {
  background-color: var(--body-bg-color);
}

.text-xs {
  font-size: 0.75rem;
}

.text-sm {
  font-size: 0.875rem;
}

.hover-primary:hover {
  color: var(--primary-color) !important;
}

.text-session-morning {
  color: #0dcaf0 !important;
}

.text-session-afternoon {
  color: #fd7e14 !important;
}

.text-session-evening {
  color: #6f42c1 !important;
}

/* Skeleton Loaders for smooth loading visual experience */
.skeleton-card {
  background-color: var(--surface-ground);
  border-color: var(--border-clr) !important;
  min-height: 86px;
}

.skeleton-line {
  background: rgba(108, 117, 125, 0.12);
  border-radius: 4px;
}

.skeleton-line.title {
  width: 55%;
  height: 16px;
}

.skeleton-line.subtitle {
  width: 35%;
  height: 12px;
}

.skeleton-line.content {
  width: 80%;
  height: 38px;
  border-radius: 6px;
}

.skeleton-line.badge-pill {
  width: 60px;
  height: 18px;
  border-radius: 12px;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.6;
  }
}

.skeleton-pulse {
  animation: pulse 1.5s infinite ease-in-out;
}

:deep(.select-sm .p-select-label) {
  padding-left: 8px !important;
  padding-right: 24px !important;
  font-size: 0.8rem !important;
  text-transform: uppercase !important;
  font-weight: 600 !important;
}

:deep(.select-sm .p-select-dropdown) {
  width: 24px !important;
}

/* Container transitions for loading, empty, and data views */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Card list animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
