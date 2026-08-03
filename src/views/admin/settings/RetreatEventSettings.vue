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
                <BaseTable 
                    :columns="[
                        { field: 'name', header: 'Season Name' },
                        { field: 'start_date', header: 'Start Date' },
                        { field: 'end_date', header: 'End Date' },
                        { field: 'status', header: 'Status' }
                    ]"
                    :rows="paginatedEvents"
                    :total-records="eventsList.length"
                    v-model:page="currentPage"
                    v-model:per-page="itemsPerPage"
                    :loading="false"
                >
                    <template #start_date="{ data }">
                        {{ data.start_date || '-' }}
                    </template>
                    <template #end_date="{ data }">
                        {{ data.end_date || '-' }}
                    </template>
                    <template #status="{ data }">
                        <span :class="getStatusBadgeClass(data)">
                            {{ getStatusText(data) }}
                        </span>
                    </template>
                </BaseTable>
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
import { ref, onMounted, computed } from 'vue';
import api from '@/api/api';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import BaseDatePicker from '@/components/base/BaseDatePicker.vue';
import BaseTable from '@/components/base/BaseTable.vue';
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

const currentPage = ref(1);
const itemsPerPage = ref(5);

const totalPages = computed(() => {
    return Math.ceil(eventsList.value.length / itemsPerPage.value);
});

const paginatedEvents = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return eventsList.value.slice(start, end);
});

const isExpired = (endDate) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return new Date() > end;
};

const getStatusText = (evt) => {
    if (evt.is_active) {
        if (evt.is_closed || isExpired(evt.end_date)) return 'Closed';
        return 'Active & Open';
    }
    return 'Archived';
};

const getStatusBadgeClass = (evt) => {
    if (evt.is_active) {
        if (evt.is_closed || isExpired(evt.end_date)) return 'badge bg-secondary-subtle text-secondary';
        return 'badge bg-success-subtle text-success';
    }
    return 'badge bg-light text-muted border';
};

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
