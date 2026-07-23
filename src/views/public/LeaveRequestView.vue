<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card border-0 shadow-lg" style="border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <div class="bg-primary text-white p-4 text-center">
            <h4 class="mb-1 fw-bold">Leave Request Form</h4>
            <p class="mb-0 text-white-50">Pagoda Management System</p>
          </div>
          
          <div class="card-body p-4 p-md-5">
            <form @submit.prevent="submitLeave">
              
              <div class="mb-4">
                <label class="form-label fw-medium text-muted small text-uppercase">Your Details</label>
                <!-- Usually they would log in, but assuming public/authenticated form, we select Kut and User -->
                <div class="mb-3">
                  <label class="form-label">Select Pagoda (Kut)</label>
                  <select v-model="form.kut_id" class="form-select" required @change="fetchMonks">
                    <option value="" disabled>Select your Kut...</option>
                    <option v-for="kut in kuts" :key="kut.id" :value="kut.id">{{ kut.name }}</option>
                  </select>
                </div>
                
                <div class="mb-3" v-if="form.kut_id">
                  <label class="form-label">Your Name (Monk)</label>
                  <select v-model="form.user_id" class="form-select" required>
                    <option value="" disabled>Select your name...</option>
                    <option v-for="monk in monks" :key="monk.id" :value="monk.id">{{ monk.email }} - {{ monk.phone || 'No phone' }}</option>
                  </select>
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label fw-medium text-muted small text-uppercase">Leave Details</label>
                <div class="mb-3">
                  <label class="form-label">Date of Leave</label>
                  <input type="date" v-model="form.date" class="form-control" required :min="today" />
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Reason</label>
                  <textarea v-model="form.notes" class="form-control" rows="3" placeholder="Please explain why you need leave..." required></textarea>
                </div>
              </div>

              <div class="d-grid mt-4">
                <button type="submit" class="btn btn-primary btn-lg" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submit Request
                </button>
              </div>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();

const kuts = ref([]);
const monks = ref([]);
const isSubmitting = ref(false);

const today = new Date().toISOString().split('T')[0];

const form = ref({
  kut_id: '',
  user_id: '',
  date: today,
  notes: ''
});

const fetchKuts = async () => {
  try {
    const res = await api.get('/kuts');
    kuts.value = res.data?.data || res.data || [];
  } catch (err) {
    console.error('Failed to load Kuts', err);
  }
};

const fetchMonks = async () => {
  if (!form.value.kut_id) return;
  try {
    // We can fetch all users in a kut.
    // For simplicity, let's fetch from the attendance endpoint or users endpoint.
    const res = await api.get('/attendances/monks-by-kut-date', {
      params: { kut_id: form.value.kut_id, date: form.value.date }
    });
    monks.value = res.data?.data || res.data || [];
    form.value.user_id = ''; // reset selection
  } catch (err) {
    console.error('Failed to fetch monks', err);
  }
};

const submitLeave = async () => {
  isSubmitting.value = true;
  try {
    await api.post('/attendances/leave-request', form.value);
    toast.showToast('Leave request submitted successfully. Admin has been notified.', 'success');
    
    // Reset form
    form.value.notes = '';
    form.value.date = today;
  } catch (error) {
    console.error(error);
    toast.showToast(error.response?.data?.message || 'Failed to submit request', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchKuts();
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: var(--body-bg-color);
}
</style>
