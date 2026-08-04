<template>
  <div class="d-flex flex-column gap-3">

    <div v-if="isTeacher">
      <h5 class="mb-3">Notification Settings</h5>
      <div class="card bg-transparent" style=" border-radius: calc(var(--border-radius) - 1rem);">
        <div class="d-flex flex-column gap-3">
          <template v-if="isTeacher">
            
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h6 class="mb-1">Schedule Alerts</h6>
                <p class="mb-0 small text-muted">Receive notifications for your upcoming schedules.</p>
              </div>
              <div @click.capture.stop="handleToggleClick($event, 'receiveScheduleAlerts')">
                <BaseToggle :modelValue="settings.receiveScheduleAlerts" />
              </div>
            </div>

            <div class="main-divider"></div>
            
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h6 class="mb-1">Alert Timing</h6>
                <p class="mb-0 small text-muted">Minutes before the schedule to receive the alert.</p>
              </div>
              <div style="width: 170px;" ref="alertTimingWrapper">
                <BaseSelect 
                  :modelValue="settings.alertMinutesBefore" 
                  :options="timingOptions"
                  @update:modelValue="handleSelectChange"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Confirm Popover -->
    <BasePopOver ref="confirmPopover">
      <div style="min-width: 200px;">
        <p class="mb-3 fw-medium text-base">Are you sure to save the setting?</p>
        <div class="d-flex justify-content-end gap-2">
          <BaseButton variant="outline-warning" class="flex-grow-1" size="sm" @click="cancelToggle">Cancel</BaseButton>
          <BaseButton variant="warning" class="flex-grow-1" size="sm" :isLoading="isSavingSettings" @click="confirmToggle">Confirm</BaseButton>
        </div>
      </div>
    </BasePopOver>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/users/user';
import { useToastStore } from '@/stores/toast';
import BaseModal from '@/components/base/BaseModal.vue';
import BasePopOver from '@/components/base/BasePopOver.vue';
import { Save } from '@lucide/vue';

const authStore = useAuthStore();
const userStore = useUserStore();
const toastStore = useToastStore();

const isTeacher = computed(() => authStore.user?.role?.id === 2);
const isUser = computed(() => authStore.user?.role?.name?.toUpperCase() === 'USER');

const settings = ref({
  receiveReportAlerts: false,
  receiveScheduleAlerts: false,
  alertMinutesBefore: 5
});
const originalMinutes = ref(5);
const isSavingSettings = ref(false);

const loadSettings = async () => {
  const data = await userStore.getNotificationSettings();
  if (data) {
    settings.value.receiveReportAlerts = data.receiveReportAlerts ?? false;
    settings.value.receiveScheduleAlerts = data.receiveScheduleAlerts ?? false;
    settings.value.alertMinutesBefore = data.alertMinutesBefore ?? 5;
    originalMinutes.value = settings.value.alertMinutesBefore;
  }
};

const saveSettings = async () => {
  isSavingSettings.value = true;
  const payload = {
    receiveReportAlerts: settings.value.receiveReportAlerts,
  };
  
  if (isTeacher.value) {
    payload.receiveScheduleAlerts = settings.value.receiveScheduleAlerts;
    payload.alertMinutesBefore = Number(settings.value.alertMinutesBefore) || 5;
  }

  const success = await userStore.updateNotificationSettings(payload);
  isSavingSettings.value = false;
  return success;
};

const pendingToggleKey = ref(null);
const confirmPopover = ref(null);

const handleToggleClick = (event, key) => {
  pendingToggleKey.value = key;
  confirmPopover.value.toggle(event);
};

const timingOptions = [
  { label: '1 minutes before', value: 1 },
  { label: '5 minutes before', value: 5 },
  { label: '10 minutes before', value: 10 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '2 hours before', value: 120 },
  { label: '1 day before', value: 1440 }
];

const alertTimingWrapper = ref(null);

const handleSelectChange = async (newValue) => {
  settings.value.alertMinutesBefore = newValue;
  if (Number(settings.value.alertMinutesBefore) !== Number(originalMinutes.value)) {
    const success = await saveSettings();
    if (success) {
      originalMinutes.value = settings.value.alertMinutesBefore;
    } else {
      settings.value.alertMinutesBefore = originalMinutes.value;
    }
  }
};

const cancelToggle = () => {
  confirmPopover.value.hide();
  pendingToggleKey.value = null;
};

const confirmToggle = async () => {
  const key = pendingToggleKey.value;
  if (!key) return;
  
  settings.value[key] = !settings.value[key];
  const success = await saveSettings();
  if (!success) {
    settings.value[key] = !settings.value[key];
  }
  
  confirmPopover.value.hide();
  pendingToggleKey.value = null;
};

onMounted(() => {
  loadSettings();
});

const isLoading = ref(false);


</script>
