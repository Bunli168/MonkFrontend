<template>
  <div class="tnak-overview-view">
    <OverViewStudent v-if="authStore.isStudent" />
    <OverViewTeacher v-else-if="authStore.isTeacher" />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { onMounted } from 'vue';
import OverViewStudent from './components/OverViewStudent.vue';
import OverViewTeacher from './components/OverViewTeacher.vue';

const authStore = useAuthStore();
onMounted(async () => {
  await authStore.getProfile();
})

</script>
