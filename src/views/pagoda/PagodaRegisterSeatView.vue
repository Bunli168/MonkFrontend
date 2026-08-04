<template>
    <div class="py-4">
        <div class="card border-0" style="background-color: var(--surface-ground);">
            <div class="card-body px-0 py-3">
                <div v-if="hasSeat" class="alert alert-success d-flex align-items-center mb-0" style="background-color: var(--primary-color-soft); border: 1px solid var(--primary-color); color: var(--text-heading-color);">
                    <i class="fas fa-check-circle fs-4 me-3" style="color: var(--primary-color);"></i>
                    <div>
                        <h6 class="fw-bold mb-1">Current Seat Assignment</h6>
                        <p class="mb-0">You are assigned to <strong>Row {{ currentSeatRowDisplay }}</strong>, <strong>Seat {{ currentSeatNumber }}</strong>.</p>
                        <p class="mb-0 small text-muted mt-1">Please contact your administrator if you need to change your seat.</p>
                    </div>
                </div>
                <div v-else class="alert alert-warning d-flex align-items-center mb-4">
                    <i class="fas fa-exclamation-triangle fs-4 me-3"></i>
                    <div>
                        <h6 class="fw-bold mb-1">No Seat Assigned</h6>
                        <p class="mb-0">You do not have a seat assigned yet. Please select an available row and seat below.</p>
                    </div>
                </div>

                <!-- Registration Form -->
                <div v-if="!hasSeat" class="row g-3 align-items-end">
                    <div class="col-md-4">
                        <label class="form-label small fw-bold">Select Row</label>
                        <select class="form-select" v-model="registerForm.seating_row_id" :disabled="isRegisteringSeat" @change="onRowChange">
                            <option value="">-- Choose Row --</option>
                            <option v-for="row in availableRows" :key="row.id" :value="row.id">
                                Row {{ row.row_num }}
                            </option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label small fw-bold">Seat Number</label>
                        <select class="form-select" v-model="registerForm.seat_number" :disabled="!registerForm.seating_row_id || isRegisteringSeat || isLoadingTakenSeats">
                            <option value="">{{ isLoadingTakenSeats ? 'Loading...' : '-- Choose Seat --' }}</option>
                            <option v-for="seat in availableSeats" :key="seat" :value="seat">
                                Seat {{ seat }}
                            </option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <button class="btn btn-primary w-100" @click="registerSeat" :disabled="!registerForm.seating_row_id || !registerForm.seat_number || isRegisteringSeat">
                            <span v-if="isRegisteringSeat" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            <i class="fas fa-save me-2" v-else></i>
                            Save Seat Assignment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';

const toast = useToastStore();
const authStore = useAuthStore();

const availableRows = ref([]);
const takenSeats = ref([]);
const isLoadingTakenSeats = ref(false);
const isRegisteringSeat = ref(false);

const registerForm = ref({
    seating_row_id: '',
    seat_number: ''
});

const hasSeat = computed(() => {
    return !!(authStore.user?.profile?.seating_row_id || authStore.user?.UserProfile?.seating_row_id);
});

const currentSeatRowId = computed(() => {
    return authStore.user?.profile?.seating_row_id || authStore.user?.UserProfile?.seating_row_id;
});

const currentSeatRowDisplay = computed(() => {
    const rowId = currentSeatRowId.value;
    if (rowId && availableRows.value.length > 0) {
        const row = availableRows.value.find(r => r.id === rowId);
        if (row) return row.row_num;
    }
    return authStore.user?.profile?.seatingRow?.row_num || rowId;
});

const currentSeatNumber = computed(() => {
    return authStore.user?.profile?.seat_number || authStore.user?.UserProfile?.seat_number;
});

const availableSeats = computed(() => {
    if (!registerForm.value.seating_row_id) return [];
    
    const row = availableRows.value.find(r => r.id === registerForm.value.seating_row_id);
    const capacity = row?.capacity || 50; 
    
    let allSeats = Array.from({ length: capacity }, (_, i) => i + 1);
    
    // Filter out taken seats, UNLESS it's the user's own current seat
    return allSeats.filter(seat => {
        if (registerForm.value.seating_row_id === currentSeatRowId.value && seat === parseInt(currentSeatNumber.value)) {
            return true; // Keep user's own seat
        }
        return !takenSeats.value.includes(seat);
    });
});

const onRowChange = async () => {
    registerForm.value.seat_number = '';
    if (!registerForm.value.seating_row_id) {
        takenSeats.value = [];
        return;
    }
    await fetchTakenSeats(registerForm.value.seating_row_id);
};

const fetchTakenSeats = async (rowId) => {
    isLoadingTakenSeats.value = true;
    try {
        const response = await api.get(`/seating-rows/${rowId}/taken-seats`);
        takenSeats.value = response.data?.takenSeats || [];
    } catch (error) {
        console.error('Failed to fetch taken seats:', error);
    } finally {
        isLoadingTakenSeats.value = false;
    }
};

const fetchRows = async () => {
    try {
        const response = await api.get('/seating-rows');
        availableRows.value = response.data?.data || response.data || [];
        availableRows.value.sort((a, b) => a.row_num - b.row_num);
        
        if (hasSeat.value) {
            registerForm.value.seating_row_id = currentSeatRowId.value;
            registerForm.value.seat_number = currentSeatNumber.value ? parseInt(currentSeatNumber.value) : '';
            await fetchTakenSeats(registerForm.value.seating_row_id);
        }
    } catch (error) {
        console.error('Failed to fetch seating rows:', error);
    }
};

const registerSeat = async () => {
    if (!registerForm.value.seating_row_id || !registerForm.value.seat_number) return;
    
    isRegisteringSeat.value = true;
    try {
        await api.put(`/users/${authStore.user.id}/profile`, {
            seating_row_id: registerForm.value.seating_row_id,
            seat_number: String(registerForm.value.seat_number)
        });
        toast.showToast('Seat updated successfully!', 'success');
        await authStore.fetchCurrentUser();
    } catch (error) {
        console.error('Failed to update seat:', error);
        toast.showToast(error.response?.data?.message || 'Failed to update seat', 'error');
    } finally {
        isRegisteringSeat.value = false;
    }
};

onMounted(() => {
    fetchRows();
});
</script>
