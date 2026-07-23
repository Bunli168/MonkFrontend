<template>
    <div class="pagoda-leave-requests-view container-xl py-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div>
                <h4 class="fw-bold mb-1">Leave Requests</h4>
                <p class="text-muted mb-0">Submit and track your requests for leave or absence.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2" @click="showForm = true">
                <i class="fas fa-plus"></i> New Request
            </button>
        </div>

        <div class="card border-0 shadow-sm mb-4" v-if="showForm">
            <div class="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold">New Leave Request</h5>
                <button type="button" class="btn-close" @click="showForm = false"></button>
            </div>
            <div class="card-body">
                <form @submit.prevent="submitRequest">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <BaseDatePicker 
                                label="Start Date" 
                                v-model="formData.start_date" 
                                required 
                                :minDate="today"
                            />
                        </div>
                        <div class="col-md-6">
                            <BaseDatePicker 
                                label="End Date" 
                                v-model="formData.end_date" 
                                required 
                                :minDate="formData.start_date || today"
                            />
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-medium">Reason for Leave</label>
                            <textarea class="form-control" v-model="formData.reason" rows="3" required placeholder="Please explain why you need to take leave..."></textarea>
                        </div>
                        <div class="col-12 d-flex justify-content-end gap-2 mt-4">
                            <button type="button" class="btn btn-light border" @click="showForm = false">Cancel</button>
                            <button type="submit" class="btn btn-primary d-flex align-items-center gap-2" :disabled="isSubmitting">
                                <i class="fas fa-paper-plane" v-if="!isSubmitting"></i>
                                <span v-if="isSubmitting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Submit Request
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom py-3">
                <h5 class="mb-0 fw-bold">My Requests History</h5>
            </div>
            <div class="card-body p-0">
                <BaseTable 
                    :columns="colDefs" 
                    :rows="myRequests" 
                    :loading="isLoading"
                    :show-index="true"
                >
                    <template #date_range="{ data: row }">
                        <span>{{ formatDate(row.start_date) }} <i class="fas fa-arrow-right text-muted mx-1"></i> {{ formatDate(row.end_date) }}</span>
                    </template>
                    <template #status="{ data: row }">
                        <span class="badge rounded-pill" :class="getStatusClass(row.status)">
                            {{ row.status.charAt(0).toUpperCase() + row.status.slice(1) }}
                        </span>
                    </template>
                    <template #approved_by="{ data: row }">
                        <span v-if="row.Approver && row.status !== 'pending'" class="text-muted">
                            {{ row.Approver.UserProfile?.first_name_kh }} {{ row.Approver.UserProfile?.last_name_kh }}
                        </span>
                        <span v-else class="text-muted fst-italic">N/A</span>
                    </template>
                </BaseTable>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseDatePicker from '@/components/base/BaseDatePicker.vue';

const toast = useToastStore();
const showForm = ref(false);
const isSubmitting = ref(false);
const isLoading = ref(false);
const myRequests = ref([]);

const today = new Date().toISOString().split('T')[0];

const formData = ref({
    start_date: '',
    end_date: '',
    reason: ''
});

const colDefs = computed(() => {
    return [
        { field: 'date_range', header: 'Date Range', sortable: false },
        { field: 'reason', header: 'Reason', sortable: false },
        { field: 'status', header: 'Status', sortable: true, class: 'text-center' },
        { field: 'approved_by', header: 'Reviewed By', sortable: false }
    ];
});

const getStatusClass = (status) => {
    if (status === 'approved') return 'bg-success bg-opacity-10 text-success';
    if (status === 'rejected') return 'bg-danger bg-opacity-10 text-danger';
    return 'bg-warning bg-opacity-10 text-warning';
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
};

const fetchRequests = async () => {
    isLoading.value = true;
    try {
        const response = await api.get('/leave-requests/my');
        myRequests.value = response.data || [];
    } catch (error) {
        console.error('Failed to load leave requests:', error);
        toast.showToast('Failed to load requests', 'error');
    } finally {
        isLoading.value = false;
    }
};

const submitRequest = async () => {
    isSubmitting.value = true;
    try {
        await api.post('/leave-requests', formData.value);
        toast.showToast('Leave request submitted successfully', 'success');
        showForm.value = false;
        formData.value = { start_date: '', end_date: '', reason: '' };
        fetchRequests();
    } catch (error) {
        console.error('Failed to submit request:', error);
        toast.showToast(error.response?.data?.message || 'Failed to submit request', 'error');
    } finally {
        isSubmitting.value = false;
    }
};

onMounted(() => {
    fetchRequests();
});

defineExpose({
    showForm
});
</script>

<style scoped>
textarea {
    resize: none;
}
</style>
