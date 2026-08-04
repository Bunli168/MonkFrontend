<template>
    <div class="retreat-event-settings">
        <!-- History Table -->
        <div class="card border-0 shadow-sm mt-4">
            <div class="card-header bg-white border-bottom py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                <h5 class="card-title mb-0 fw-bold">Season History</h5>
                <BaseButton variant="primary" size="sm" @click="openStartModal" class="btn-responsive-width d-flex justify-content-center align-items-center">
                    <PlusCircle :size="16" class="me-1" /> Start New Season
                </BaseButton>
            </div>
            <div class="card-body p-0">
                <BaseTable 
                    :columns="[
                        { field: 'name', header: 'Season Name' },
                        { field: 'start_date', header: 'Start Date' },
                        { field: 'end_date', header: 'End Date' },
                        { field: 'status', header: 'Status' },
                        ...(authStore.isSuperAdmin ? [{ field: 'action', header: 'Action' }] : [])
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
                    <template #action="{ data }">
                        <BaseActionMenu 
                            v-if="data.is_active && authStore.isSuperAdmin" 
                            :items="getActionItems(data)" 
                        />
                    </template>
                </BaseTable>
            </div>
        </div>



        <!-- Add / Edit Season Modal -->
        <BaseModal v-model="isModalOpen" :title="isEditMode ? 'Edit Season' : 'Start New Season'" @close="isModalOpen = false">
            <form @submit.prevent="submitSeasonForm">
                <div class="mb-4">
                    <p class="text-muted mb-3" v-if="!isEditMode">
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
                    <BaseButton type="submit" variant="primary" :isLoading="isSubmitting">
                        {{ isEditMode ? 'Save Changes' : 'Start Season' }}
                    </BaseButton>
                </div>
            </form>
        </BaseModal>

        <!-- Confirm Toggle Modal -->
        <BaseModal v-model="isConfirmModalOpen" title="Confirm Action" @close="closeConfirmModal">
            <div class="mb-4">
                <p class="text-muted mb-0">
                    Are you sure you want to <strong>{{ confirmActionText }}</strong> this season?
                </p>
            </div>
            <div class="d-flex justify-content-end gap-2">
                <BaseButton type="button" variant="light" @click="closeConfirmModal">Cancel</BaseButton>
                <BaseButton type="button" :variant="confirmActionText === 'CLOSE' ? 'danger' : 'primary'" :isLoading="isSubmitting" @click="executeToggleSeason">
                    Yes, {{ confirmActionText }} Season
                </BaseButton>
            </div>
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
import BaseToggle from '@/components/base/BaseToggle.vue';
import { useToastStore } from '@/stores/toast';
import { useSystemStore } from '@/stores/system';
import { useAuthStore } from '@/stores/auth';
import { PlusCircle, Pencil, Power } from '@lucide/vue';

const toast = useToastStore();
const systemStore = useSystemStore();
const authStore = useAuthStore();

const isModalOpen = ref(false);
const isEditMode = ref(false);
const editEventId = ref(null);
const isConfirmModalOpen = ref(false);
const pendingEventToToggle = ref(null);
const confirmActionText = ref('');
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
    isEditMode.value = false;
    editEventId.value = null;
    formData.value = { name: '', start_date: '', end_date: '' };
    isModalOpen.value = true;
};

const openEditModal = (evt) => {
    isEditMode.value = true;
    editEventId.value = evt.id;
    formData.value = { 
        name: evt.name, 
        start_date: evt.start_date ? evt.start_date.split('T')[0] : '', 
        end_date: evt.end_date ? evt.end_date.split('T')[0] : '' 
    };
    isModalOpen.value = true;
};

const submitSeasonForm = async () => {
    if (!formData.value.name.trim()) {
        toast.showToast('Season name is required', 'error');
        return;
    }
    
    isSubmitting.value = true;
    try {
        const payload = { 
            name: formData.value.name,
            start_date: formData.value.start_date || null,
            end_date: formData.value.end_date || null
        };
        
        let response;
        if (isEditMode.value) {
            response = await api.put(`/retreat-events/${editEventId.value}`, payload);
        } else {
            response = await api.post('/retreat-events/start-season', payload);
        }
        
        if (response.data.success) {
            toast.showToast(isEditMode.value ? 'Season updated successfully' : 'New season started successfully', 'success');
            isModalOpen.value = false;
            await systemStore.fetchCurrentSeason();
            fetchEventsList();
        }
    } catch (error) {
        toast.showToast(error?.response?.data?.message || (isEditMode.value ? 'Failed to update season' : 'Failed to start season'), 'error');
    } finally {
        isSubmitting.value = false;
    }
};

const toggleSeasonStatus = (evt) => {
    pendingEventToToggle.value = evt;
    confirmActionText.value = evt.is_closed ? 'OPEN' : 'CLOSE';
    isConfirmModalOpen.value = true;
};

const closeConfirmModal = () => {
    isConfirmModalOpen.value = false;
    pendingEventToToggle.value = null;
    // We don't reset the actual toggle UI model here easily unless we force table re-render, 
    // but typically users will wait for API or we just re-fetch to reset it.
    // Fetching events will reset the toggle to correct DB state.
    fetchEventsList();
};

const executeToggleSeason = async () => {
    if (!pendingEventToToggle.value) return;
    
    const evt = pendingEventToToggle.value;
    const action = confirmActionText.value;
    
    isSubmitting.value = true;
    try {
        const response = await api.post(`/retreat-events/toggle-season/${evt.id}`);
        if (response.data.success) {
            toast.showToast(`Season ${action.toLowerCase()}d successfully`, 'success');
            await systemStore.fetchCurrentSeason();
            fetchEventsList();
            isConfirmModalOpen.value = false;
        }
    } catch (error) {
        toast.showToast(error?.response?.data?.message || `Failed to ${action.toLowerCase()} season`, 'error');
        fetchEventsList(); // reset toggle state
    } finally {
        isSubmitting.value = false;
        pendingEventToToggle.value = null;
    }
};

const getActionItems = (evt) => {
    return [
        {
            label: 'Edit Season',
            icon: Pencil,
            iconClass: 'text-primary',
            command: () => {
                openEditModal(evt);
            }
        },
        {
            label: evt.is_closed ? 'Re-open Season' : 'Close Season',
            icon: Power,
            textClass: evt.is_closed ? 'text-success fw-medium' : 'text-danger fw-medium',
            iconClass: evt.is_closed ? 'text-success' : 'text-danger',
            command: () => {
                toggleSeasonStatus(evt);
            }
        }
    ];
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
