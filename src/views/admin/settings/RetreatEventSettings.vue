<template>
    <div class="retreat-event-settings">
        <!-- History Table -->
        <div class="card border-0 shadow-sm mt-4">
            <div class="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0 fw-bold">Season History</h5>
                <BaseButton variant="primary" size="sm" @click="openStartModal">
                    <i class="bi bi-plus-circle me-1"></i> Start New Season
                </BaseButton>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="table-light">
                            <tr>
                                <th class="py-3 px-4">Season Name</th>
                                <th class="py-3 px-4">Start Date</th>
                                <th class="py-3 px-4">End Date</th>
                                <th class="py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="eventsList.length === 0">
                                <td colspan="4" class="text-center py-4 text-muted">No history found</td>
                            </tr>
                            <tr v-for="evt in eventsList" :key="evt.id">
                                <td class="py-3 px-4 fw-medium">{{ evt.name }}</td>
                                <td class="py-3 px-4">{{ evt.start_date || '-' }}</td>
                                <td class="py-3 px-4">{{ evt.end_date || '-' }}</td>
                                <td class="py-3 px-4">
                                    <span v-if="evt.is_active && !evt.is_closed" class="badge bg-success-subtle text-success">
                                        Active & Open
                                    </span>
                                    <span v-else-if="evt.is_active && evt.is_closed" class="badge bg-secondary-subtle text-secondary">
                                        Closed
                                    </span>
                                    <span v-else class="badge bg-light text-muted border">
                                        Archived
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>



        <!-- Start New Season Modal -->
        <BaseModal v-model="isModalOpen" title="Start New Season" @close="isModalOpen = false">
            <form @submit.prevent="submitStartSeason">
                <div class="mb-4">
                    <p class="text-muted mb-3">
                        Starting a new season will automatically archive any previous seasons. Users will be able to register for this new season immediately.
                    </p>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Season Name <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" v-model="formData.name" placeholder="e.g., ចូលព្រះវស្សា ២០២៦" required />
                    </div>
                    <div class="row">
                        <div class="col-6 mb-3">
                            <BaseDatePicker v-model="formData.start_date" label="Start Date" placeholder="Select Start Date" />
                        </div>
                        <div class="col-6 mb-3">
                            <BaseDatePicker v-model="formData.end_date" label="End Date" placeholder="Select End Date" />
                        </div>
                    </div>
                </div>
                
                <div class="d-flex justify-content-end gap-2">
                    <BaseButton type="button" variant="light" @click="isModalOpen = false">Cancel</BaseButton>
                    <BaseButton type="submit" variant="primary" :isLoading="isSubmitting">Start Season</BaseButton>
                </div>
            </form>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import { useSystemStore } from '@/stores/system';

const toast = useToastStore();
const systemStore = useSystemStore();

const isModalOpen = ref(false);
const isSubmitting = ref(false);
const formData = ref({
    name: '',
    start_date: '',
    end_date: ''
});

const eventsList = ref([]);

const fetchEventsList = async () => {
    try {
        const response = await api.get('/retreat-events');
        if (response.data.success) {
            eventsList.value = response.data.data;
        }
    } catch (error) {
        console.error('Failed to fetch events history', error);
    }
};

onMounted(() => {
    systemStore.fetchCurrentSeason();
    fetchEventsList();
});

const openStartModal = () => {
    formData.value = { name: '', start_date: '', end_date: '' };
    isModalOpen.value = true;
};

const submitStartSeason = async () => {
    if (!formData.value.name.trim()) {
        toast.showToast('Season name is required', 'error');
        return;
    }
    
    isSubmitting.value = true;
    try {
        const response = await api.post('/retreat-events/start-season', { 
            name: formData.value.name,
            start_date: formData.value.start_date || null,
            end_date: formData.value.end_date || null
        });
        if (response.data.success) {
            toast.showToast('New season started successfully', 'success');
            isModalOpen.value = false;
            await systemStore.fetchCurrentSeason();
            fetchEventsList();
        }
    } catch (error) {
        toast.showToast(error?.response?.data?.message || 'Failed to start season', 'error');
    } finally {
        isSubmitting.value = false;
    }
};

const confirmCloseSeason = async () => {
    if (confirm('Are you sure you want to CLOSE the current season? Users will no longer be able to take attendance.')) {
        isSubmitting.value = true;
        try {
            const response = await api.post('/retreat-events/close-season');
            if (response.data.success) {
                toast.showToast('Season closed successfully', 'success');
                await systemStore.fetchCurrentSeason();
                fetchEventsList();
            }
        } catch (error) {
            toast.showToast(error?.response?.data?.message || 'Failed to close season', 'error');
        } finally {
            isSubmitting.value = false;
        }
    }
};


</script>

<style scoped>
.btn-action-square {
    width: 32px;
    height: 32px;
    border-radius: var(--border-inner-radius);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    transition: all 0.2s;
}
.bg-success-subtle {
    background-color: rgba(25, 135, 84, 0.1) !important;
}
.bg-secondary-subtle {
    background-color: rgba(108, 117, 125, 0.1) !important;
}
</style>
