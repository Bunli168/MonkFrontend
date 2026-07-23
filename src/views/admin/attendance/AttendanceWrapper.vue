<template>
  <component :is="activeComponent" />
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import SuperAdminAttendanceView from './SuperAdminAttendanceView.vue';
import AttendanceView from './AttendanceView.vue';

const authStore = useAuthStore();

const activeComponent = computed(() => {
    if (authStore.isSuperAdmin) {
        return SuperAdminAttendanceView;
    }
    return AttendanceView;
});
</script>
