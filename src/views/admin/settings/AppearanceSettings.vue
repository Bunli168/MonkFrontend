<template>
  <div class="appearance-settings">
    <h6 class="fw-bold">Appearance</h6>
    <div class="mt-3">
      <label class="form-label">Theme</label>
      <select class="form-select" v-model="theme" @change="save">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
    <div class="mt-3">
      <label class="form-label">Primary Color</label>
      <input type="color" class="form-control form-control-color" v-model="primaryColor" @input="save" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();
const theme = ref('system');
const primaryColor = ref('#7952b3');

const load = async () => {
  try {
    const res = await api.get('/system/settings');
    if (res.data.success && res.data.data) {
      theme.value = res.data.data.theme || 'system';
      primaryColor.value = res.data.data.primaryColor || primaryColor.value;
    }
  } catch (e) {
    // ignore
  }
};

const save = async () => {
  try {
    await api.post('/system/settings', { theme: theme.value, primaryColor: primaryColor.value });
    toast.success('Appearance saved');
  } catch (e) {
    toast.error('Failed to save appearance');
  }
};

onMounted(load);
</script>

<style scoped>
.appearance-settings { max-width: 560px; }
</style>
