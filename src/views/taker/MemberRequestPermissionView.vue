<template>
    <div>
        <div class="card border-0" style="background-color: var(--surface-ground);">
            <!-- Filters Bar -->
            <div class="mb-3 d-flex justify-content-between align-items-center w-100">
                <div class="d-flex align-items-center gap-2 flex-grow-1" style="min-width: 0;">
                    <BaseFilter v-model="statusFilter" :options="filterOptions" :wrap="true" />
                </div>
                <BaseButton v-if="!authStore.isAdmin" @click="showModal = true" variant="primary">
                    <i class="fas fa-plus me-1"></i> New Request
                </BaseButton>
            </div>

            <!-- Table -->
            <BaseTable 
                :columns="colDefs" 
                :rows="filteredRequests" 
                :loading="isLoading"
                @refresh-data="fetchRequests"
            >
                <template #monk="{ data: row }">
                    <div class="d-flex align-items-center gap-2">
                        <div class="avatar-circle d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 overflow-hidden"
                            style="width: 32px; height: 32px; background: color-mix(in srgb, var(--primary-color) 15%, transparent);">
                            <User :size="14" style="color: var(--primary-color);" />
                        </div>
                        <div class="min-w-0">
                            <div class="fw-medium" style="color: var(--text-heading-color);">
                                {{ row.User?.UserProfile?.first_name_kh }} {{ row.User?.UserProfile?.last_name_kh }}
                            </div>
                            <div class="text-muted small" v-if="row.User?.UserProfile?.kut_id">
                                Kudi: {{ row.User.UserProfile.kut_id }}
                            </div>
                        </div>
                    </div>
                </template>

                <template #date_range="{ data: row }">
                    <div class="d-flex flex-column">
                        <span class="fw-medium text-dark">{{ formatDate(row.start_date) }}</span>
                        <span class="text-muted small">to {{ formatDate(row.end_date) }}</span>
                    </div>
                </template>

                <template #reason="{ data: row }">
                    <span class="text-muted small">{{ row.reason || '—' }}</span>
                </template>
                
                <template #status="{ data: row }">
                    <BaseBadge v-if="row.status" :status="getBadgeStatusColor(row.status)" :label="formatStatus(row.status)" />
                    <span v-else>—</span>
                </template>
                
                <template #actions="{ data: row }">
                    <BaseActionMenu v-if="['pending', 'pending_mekudi', 'pending_superadmin'].includes(row.status) && getActionItems(row).length > 0" :items="getActionItems(row)" />
                    <span v-else class="text-muted small">
                        <template v-if="row.status === 'pending_superadmin'">
                            <template v-if="authStore.isAdmin && !false">Pending Super Admin</template>
                            <template v-else>Awaiting Final Approval</template>
                        </template>
                        <template v-else-if="row.status === 'approved' || row.status === 'rejected'">
                            {{ row.status === 'approved' ? 'Approved' : 'Rejected' }} <template v-if="row.Approver?.UserProfile?.first_name_kh">by {{ row.Approver.UserProfile.first_name_kh }}</template>
                        </template>
                        <template v-else>{{ formatStatus(row.status) }}</template>
                    </span>
                </template>
            </BaseTable>

            <!-- New Request Modal -->
            <BaseModal v-model="showModal" title="Request Permission" size="md">
                <form @submit.prevent="submitRequest">
                    <div class="mb-3">
                        <label class="form-label fw-medium text-dark">Start Date</label>
                        <input type="date" class="form-control" v-model="formData.start_date" required :min="today" />
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-medium text-dark">End Date</label>
                        <input type="date" class="form-control" v-model="formData.end_date" required :min="formData.start_date || today" />
                    </div>
                    <div class="mb-4">
                        <label class="form-label fw-medium text-dark">Reason</label>
                        <textarea class="form-control" rows="3" v-model="formData.reason" required placeholder="Please provide a valid reason..."></textarea>
                    </div>
                    
                    <div class="d-flex justify-content-end gap-2">
                        <BaseButton type="button" variant="outline" @click="showModal = false">Cancel</BaseButton>
                        <BaseButton type="submit" variant="primary" :isLoading="isSubmitting">Submit Request</BaseButton>
                    </div>
                </form>
            </BaseModal>

            <!-- Confirm Status Modal -->
            <BaseModal v-model="showConfirmModal" title="Confirm Action" size="sm">
                <p class="mb-4 text-muted fw-medium">Are you sure you want to {{ confirmAction === 'approved' ? 'approve' : 'reject' }} this leave request?</p>
                <div class="d-flex justify-content-end gap-2">
                    <BaseButton type="button" variant="outline" @click="showConfirmModal = false">Cancel</BaseButton>
                    <BaseButton type="button" :variant="confirmAction === 'approved' ? 'primary' : 'danger'" :isLoading="isUpdatingStatus" @click="executeStatusUpdate">
                        Confirm
                    </BaseButton>
                </div>
            </BaseModal>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';
import { CheckCircle, XCircle, User } from '@lucide/vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseFilter from '@/components/base/BaseFilter.vue';
import BaseBadge from '@/components/base/BaseBadge.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import BaseActionMenu from '@/components/base/BaseActionMenu.vue';

const toast = useToastStore();
const authStore = useAuthStore();
const isLoading = ref(false);
const requests = ref([]);
const statusFilter = ref('');
const showModal = ref(false);
const isSubmitting = ref(false);

const showConfirmModal = ref(false);
const isUpdatingStatus = ref(false);
const confirmAction = ref('');
const confirmId = ref(null);

const today = new Date().toISOString().split('T')[0];

const formData = ref({
    start_date: '',
    end_date: '',
    reason: ''
});

const filterOptions = computed(() => {
    const pendingValue = false ? 'pending_superadmin' : 'pending';
    return [
        { label: 'All Requests', value: '' },
        { label: 'Approved', value: 'approved' },
        { label: 'Pending', value: pendingValue },
        { label: 'Rejected', value: 'rejected' }
    ];
});

const colDefs = computed(() => {
    const cols = [];
    if (authStore.isAdmin) {
        cols.push({ field: 'monk', header: 'Monk', sortable: false });
    }
    cols.push(
        { field: 'date_range', header: 'Date Range', sortable: false },
        { field: 'reason', header: 'Reason', sortable: false },
        { field: 'status', header: 'Status', sortable: true },
        { field: 'actions', header: 'Details', sortable: false, class: 'text-end' }
    );
    return cols;
});

const filteredRequests = computed(() => {
    if (!statusFilter.value) return requests.value;
    // Note: Backend handles 'pending' combining 'pending_mekudi' and 'pending' 
    // for Admin. But for regular members we do client-side filtering if it's '/my' endpoint
    if (!authStore.isAdmin) {
        if (statusFilter.value === 'pending') {
            return requests.value.filter(req => req.status === 'pending_mekudi' || req.status === 'pending' || req.status === 'pending_superadmin');
        }
        return requests.value.filter(req => req.status === statusFilter.value);
    }
    return requests.value; // For Admins, backend filters
});

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
};

const formatStatus = (status) => {
    if (!status) return '';
    if (status === 'pending_mekudi' || status === 'pending') return 'Pending';
    if (status === 'pending_superadmin') {
        if (authStore.isAdmin && !false) return 'Pending Super Admin';
        return 'Pending';
    }
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const getBadgeStatusColor = (status) => {
    if (!status) return '';
    if (status === 'pending_superadmin' && authStore.isAdmin && !false) {
        return 'PENDING';
    }
    if (status === 'pending_superadmin' || status === 'pending_mekudi' || status === 'pending') return 'PENDING';
    return status.toUpperCase();
};

const fetchRequests = async () => {
    isLoading.value = true;
    try {
        if (authStore.isAdmin) {
            const response = await api.get('/leave-requests', {
                params: { status: statusFilter.value }
            });
            requests.value = response.data || [];
        } else {
            const response = await api.get('/leave-requests/my');
            requests.value = response.data || [];
        }
    } catch (error) {
        console.error('Failed to load leave requests:', error);
        toast.showToast('Failed to load requests', 'error');
    } finally {
        isLoading.value = false;
    }
};

watch(statusFilter, () => {
    if (authStore.isAdmin) {
        fetchRequests();
    }
});

const getActionItems = (row) => {
    const isAwaitingSuperAdmin = row.status === 'pending_superadmin';
    const isAwaitingAdmin = row.status === 'pending' || row.status === 'pending_mekudi';

    if (isAwaitingSuperAdmin) {
        if (!false) return [];
        return [
            {
                label: 'Approve Final',
                icon: CheckCircle,
                iconClass: 'text-success',
                command: () => updateStatus(row.id, 'approved')
            },
            {
                label: 'Reject',
                icon: XCircle,
                iconClass: 'text-danger',
                command: () => updateStatus(row.id, 'rejected')
            }
        ];
    }

    if (isAwaitingAdmin) {
        if (!authStore.isAdmin) return [];
        return [
            {
                label: 'Approve',
                icon: CheckCircle,
                iconClass: 'text-success',
                command: () => updateStatus(row.id, 'approved')
            },
            {
                label: 'Reject',
                icon: XCircle,
                iconClass: 'text-danger',
                command: () => updateStatus(row.id, 'rejected')
            }
        ];
    }

    return [];
};

const updateStatus = (id, status) => {
    confirmId.value = id;
    confirmAction.value = status;
    showConfirmModal.value = true;
};

const executeStatusUpdate = async () => {
    isUpdatingStatus.value = true;
    try {
        await api.put(`/leave-requests/${confirmId.value}/status`, { status: confirmAction.value });
        toast.showToast(`Request ${confirmAction.value} successfully`, 'success');
        showConfirmModal.value = false;
        fetchRequests();
    } catch (error) {
        console.error(`Failed to ${confirmAction.value} request:`, error);
        toast.showToast(error.response?.data?.message || `Failed to ${confirmAction.value} request`, 'error');
    } finally {
        isUpdatingStatus.value = false;
    }
};

const submitRequest = async () => {
    if (!formData.value.start_date || !formData.value.end_date || !formData.value.reason) {
        toast.showToast('Please fill in all fields', 'warning');
        return;
    }

    isSubmitting.value = true;
    try {
        await api.post('/leave-requests', formData.value);
        toast.showToast('Request submitted successfully', 'success');
        showModal.value = false;
        
        // Reset form
        formData.value = {
            start_date: '',
            end_date: '',
            reason: ''
        };
        
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
</script>

<style scoped>
</style>
