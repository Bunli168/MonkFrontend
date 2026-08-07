<template>
    <div>
        <div class="card border-0" style="background-color: var(--surface-ground);">
            <!-- Filters Bar -->
            <div class="mb-3 d-flex flex-wrap justify-content-between align-items-center w-100 gap-2">
                <div class="d-flex flex-wrap align-items-center gap-3 flex-grow-1 w-100" style="min-width: 0;">
                    <BaseFilter v-model="statusFilter" :options="filterOptions" :wrap="true" />
                    <!-- Search input for TakerAbsentPermissionView -->
                    <div v-if="statusFilter === 'view'" class="d-flex gap-2 ms-auto justify-content-end" style="max-width: 500px; flex-grow: 1;">
                        <div class="input-group flex-grow-1" style="min-width: 200px; max-width: 400px;">
                            <span class="input-group-text bg-white border-end-0 text-muted">
                                <Search size="18" />
                            </span>
                            <input type="text" class="form-control border-start-0 ps-0 shadow-none" placeholder="Search by name, kudi, phone..." v-model="searchQuery" style="outline: none; box-shadow: none;">
                        </div>
                        <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 flex-grow-1 flex-md-grow-0" style="min-width: 120px;" @click="handleRefresh">
                            <RefreshCcw size="16" :class="{ 'fa-spin': isRefreshing }" />
                            Refresh
                        </button>
                    </div>
                </div>
                <BaseButton v-if="!authStore.isAdmin && !authStore.isSuperAdmin && !authStore.isAttendanceTaker" @click="showModal = true" variant="primary">
                    <i class="fas fa-plus me-1"></i> New Request
                </BaseButton>
            </div>

            <!-- Table -->
            <div v-if="statusFilter === 'view'">
                <TakerAbsentPermissionView ref="takerAbsentRef" :searchQuery="searchQuery" />
            </div>
            
            <BaseTable 
                v-else
                :columns="colDefs" 
                :rows="paginatedRequests" 
                :totalRecords="filteredRequests.length"
                :loading="isLoading"
                :show-index="true"
                :page="currentPage"
                :perPage="perPage"
                @update:page="currentPage = $event"
                @update:perPage="perPage = $event"
                @refresh-data="fetchRequests"
            >
                <template #monk="{ data: row }">
                    <div class="d-flex align-items-center gap-2">
                        <img v-if="row.User?.UserProfile?.avatar_url" :src="`https://neakavorn.work.gd${row.User.UserProfile.avatar_url}`" alt="Profile" class="rounded-circle object-fit-cover shadow-sm flex-shrink-0" style="width: 32px; height: 32px;" />
                        <div v-else class="avatar-circle d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 overflow-hidden"
                            style="width: 32px; height: 32px; background: color-mix(in srgb, var(--primary-color) 15%, transparent);">
                            <User :size="14" style="color: var(--primary-color);" />
                        </div>
                        <div class="min-w-0">
                            <div class="fw-medium" style="color: var(--text-heading-color);">
                                {{ row.User?.UserProfile?.first_name_kh }} {{ row.User?.UserProfile?.last_name_kh }}
                            </div>
                            <div class="text-muted small" v-if="row.User?.UserProfile?.kut_id">
                                Kudi: {{ row.User.UserProfile.Kut ? row.User.UserProfile.Kut.name : row.User.UserProfile.kut_id }}
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
                    <div class="text-truncate text-muted small" style="max-width: 250px;" :title="row.reason">
                        {{ row.reason || '—' }}
                    </div>
                </template>
                
                <template #status="{ data: row }">
                    <BaseBadge v-if="row.status" :status="getBadgeStatusColor(row.status)" :label="formatStatus(row.status)" />
                    <span v-else>—</span>
                </template>
                
                <template #attachment="{ data: row }">
                    <div class="d-flex justify-content-start align-items-center">
                        <a v-if="row.image_url" href="#" @click.prevent="openImageModal(`https://neakavorn.work.gd${row.image_url}`)" class="d-block" title="Click to view full image">
                            <img :src="`https://neakavorn.work.gd${row.image_url}`" alt="Leave Attachment" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; cursor: pointer; transition: transform 0.2s ease;" class="shadow-sm border border-secondary border-opacity-25 attachment-thumbnail" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
                        </a>
                        <span v-else class="text-muted fst-italic">-</span>
                    </div>
                </template>
                
                <template #actions="{ data: row }">
                    <BaseActionMenu v-if="['pending', 'pending_mekudi', 'pending_superadmin'].includes(row.status) && getActionItems(row).length > 0" :items="getActionItems(row)" />
                    <span v-else class="text-muted small">
                        <template v-if="row.status === 'pending_superadmin'">
                            <template v-if="authStore.isAdmin && !authStore.isSuperAdmin">Pending Super Admin</template>
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
                        <BaseDatePicker 
                            label="Start Date" 
                            v-model="formData.start_date" 
                            required 
                            :minDate="today"
                            :disabledDates="requestedDates"
                        />
                    </div>
                    <div class="mb-3">
                        <BaseDatePicker 
                            label="End Date" 
                            v-model="formData.end_date" 
                            required 
                            :minDate="formData.start_date || today"
                            :disabledDates="requestedDates"
                        />
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

            <!-- View Request Modal -->
            <BaseModal v-model="showViewModal" title="Request Details" size="md">
                <div v-if="selectedRequest">
                    <div class="mb-3 d-flex align-items-center gap-3">
                        <img v-if="selectedRequest.User?.UserProfile?.avatar_url" :src="`https://neakavorn.work.gd${selectedRequest.User.UserProfile.avatar_url}`" alt="Profile" class="rounded-circle object-fit-cover shadow-sm" style="width: 64px; height: 64px;" />
                        <div v-else class="avatar-circle d-flex align-items-center justify-content-center rounded-circle overflow-hidden"
                            style="width: 64px; height: 64px; background: color-mix(in srgb, var(--primary-color) 15%, transparent);">
                            <User :size="32" style="color: var(--primary-color);" />
                        </div>
                        <div>
                            <h5 class="mb-1">{{ selectedRequest.User?.UserProfile?.first_name_kh }} {{ selectedRequest.User?.UserProfile?.last_name_kh }}</h5>
                            <div class="text-muted" v-if="selectedRequest.User?.UserProfile?.kut_id">
                                Kudi: {{ selectedRequest.User.UserProfile.Kut ? selectedRequest.User.UserProfile.Kut.name : selectedRequest.User.UserProfile.kut_id }}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-medium text-dark">Date Range</label>
                        <div>{{ formatDate(selectedRequest.start_date) }} to {{ formatDate(selectedRequest.end_date) }}</div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-medium text-dark">Reason</label>
                        <div class="p-3 bg-light rounded text-dark">{{ selectedRequest.reason || '—' }}</div>
                    </div>
                    
                    <div class="mb-3" v-if="selectedRequest.image_url">
                        <label class="form-label fw-medium text-dark mb-2">Attachment</label>
                        <div>
                            <img :src="`https://neakavorn.work.gd${selectedRequest.image_url}`" 
                                 class="img-fluid rounded cursor-pointer shadow-sm" 
                                 style="max-height: 200px; object-fit: contain;" 
                                 @click="openImageModal(`https://neakavorn.work.gd${selectedRequest.image_url}`)"
                                 alt="Attachment" />
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-end mt-4">
                    <BaseButton type="button" variant="outline" @click="showViewModal = false">Close</BaseButton>
                </div>
            </BaseModal>

            <!-- Image Viewer Modal -->
            <Teleport to="body">
            <div class="modal fade" id="imageViewerModal" tabindex="-1" aria-hidden="true" ref="imageModalRef">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content border-0 shadow bg-transparent">
                        <div class="modal-header border-0 pb-0 justify-content-end">
                            <button type="button" class="btn-close btn-close-white shadow-none bg-white rounded-circle p-2 m-2" data-bs-dismiss="modal" @click="closeImageModal"></button>
                        </div>
                        <div class="modal-body text-center p-0">
                            <img v-if="currentImageModalUrl" :src="currentImageModalUrl" class="img-fluid rounded shadow" style="max-height: 80vh;" alt="Attachment View" />
                        </div>
                    </div>
                </div>
            </div>
            </Teleport>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';
import { CheckCircle, XCircle, User, Search, RefreshCcw, Eye } from '@lucide/vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseFilter from '@/components/base/BaseFilter.vue';
import BaseBadge from '@/components/base/BaseBadge.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import BaseActionMenu from '@/components/base/BaseActionMenu.vue';
import BaseDatePicker from '@/components/base/BaseDatePicker.vue';
import TakerAbsentPermissionView from './TakerAbsentPermissionView.vue';

const toast = useToastStore();
const authStore = useAuthStore();
const isLoading = ref(false);
const requests = ref([]);

// Search state for TakerAbsentPermissionView
const searchQuery = ref('');
const isRefreshing = ref(false);
const takerAbsentRef = ref(null);

const handleRefresh = async () => {
    isRefreshing.value = true;
    if (takerAbsentRef.value) {
        await takerAbsentRef.value.fetchData();
    }
    isRefreshing.value = false;
};

const props = defineProps({
    pendingCount: {
        type: Number,
        default: 0
    }
});

const emit = defineEmits(['refresh-pending-count']);
const statusFilter = ref(authStore.isAdmin || authStore.isSuperAdmin || authStore.isAttendanceTaker ? 'view' : '');
const showModal = ref(false);
const isSubmitting = ref(false);

const showConfirmModal = ref(false);
const isUpdatingStatus = ref(false);
const confirmAction = ref('');
const confirmId = ref(null);

const showViewModal = ref(false);
const selectedRequest = ref(null);

const openViewModal = (row) => {
    selectedRequest.value = row;
    showViewModal.value = true;
};

// Image Viewer State
const imageModalRef = ref(null);
let imageModalInstance = null;
const currentImageModalUrl = ref('');

const today = new Date().toISOString().split('T')[0];

const formData = ref({
    start_date: '',
    end_date: '',
    reason: ''
});

const filterOptions = computed(() => {
    const pendingValue = false ? 'pending_superadmin' : 'pending';
    const options = [
        { label: 'View', value: 'view' },
        { label: 'Approved', value: 'approved' },
        { label: 'Pending', value: pendingValue, badge: props.pendingCount > 0 ? props.pendingCount : null, variant: props.pendingCount > 0 ? 'danger' : '' },
        { label: 'Rejected', value: 'rejected' }
    ];
    if (!authStore.isAdmin && !authStore.isSuperAdmin && !authStore.isAttendanceTaker) {
        // Members don't have the View tab
        options.shift(); 
        options.unshift({ label: 'All Requests', value: '' });
    }
    return options;
});

const colDefs = computed(() => {
    const cols = [];
    if (authStore.isAdmin || authStore.isSuperAdmin || authStore.isAttendanceTaker) {
        cols.push({ field: 'monk', header: 'Monk', sortable: false });
    }
    cols.push(
        { field: 'date_range', header: 'Date Range', sortable: false },
        { field: 'reason', header: 'Reason', sortable: false },
        { field: 'attachment', header: 'Attachment', sortable: false },
        { field: 'status', header: 'Status', sortable: true },
        { field: 'actions', header: 'Details', sortable: false, class: 'text-end' }
    );
    return cols;
});

const filteredRequests = computed(() => {
    if (!statusFilter.value) return requests.value;
    // Note: Backend handles 'pending' combining 'pending_mekudi' and 'pending' 
    // for Admin. But for regular members we do client-side filtering if it's '/my' endpoint
    if (!authStore.isAdmin && !authStore.isSuperAdmin && !authStore.isAttendanceTaker) {
        if (statusFilter.value === 'pending') {
            return requests.value.filter(req => req.status === 'pending_mekudi' || req.status === 'pending' || req.status === 'pending_superadmin');
        }
        return requests.value.filter(req => req.status === statusFilter.value);
    }
    return requests.value; // For Admins, backend filters
});

const requestedDates = computed(() => {
    // Only for members who see their own requests here
    if (authStore.isAdmin || authStore.isSuperAdmin || authStore.isAttendanceTaker) return [];
    
    const dates = [];
    requests.value.forEach(req => {
        if (req.status === 'rejected') return;
        const start = new Date(req.start_date);
        const end = new Date(req.end_date);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            dates.push(`${y}-${m}-${day}`);
        }
    });
    return dates;
});

const currentPage = ref(1);
const perPage = ref(10);

const paginatedRequests = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    const end = start + perPage.value;
    return filteredRequests.value.slice(start, end);
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
        if (authStore.isAdmin && !authStore.isSuperAdmin) return 'Pending Super Admin';
        return 'Pending';
    }
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const getBadgeStatusColor = (status) => {
    if (!status) return '';
    if (status === 'pending_superadmin' && authStore.isAdmin && !authStore.isSuperAdmin) {
        return 'PENDING';
    }
    if (status === 'pending_superadmin' || status === 'pending_mekudi' || status === 'pending') return 'PENDING';
    return status.toUpperCase();
};

const fetchRequests = async () => {
    if (statusFilter.value === 'view') return;
    isLoading.value = true;
    try {
        if (authStore.isAdmin || authStore.isSuperAdmin || authStore.isAttendanceTaker) {
            const statusParams = statusFilter.value === 'view' ? '' : statusFilter.value;
            const response = await api.get('/leave-requests', {
                params: { status: statusParams }
            });
            requests.value = response.data || [];
        } else {
            const response = await api.get('/leave-requests/my');
            requests.value = response.data || [];
        }
        
        // Refresh pending count when fetching requests
        if (authStore.isAdmin || authStore.isSuperAdmin || authStore.isAttendanceTaker) {
            emit('refresh-pending-count');
        }
    } catch (error) {
        console.error('Failed to load leave requests:', error);
        toast.showToast('Failed to load requests', 'error');
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchRequests();
});

watch(statusFilter, () => {
    currentPage.value = 1;
    if (authStore.isAdmin || authStore.isSuperAdmin || authStore.isAttendanceTaker) {
        fetchRequests();
    }
});

// Image Modal Functions
import * as bootstrap from 'bootstrap';

const openImageModal = (url) => {
    currentImageModalUrl.value = url;
    if (!imageModalInstance && imageModalRef.value) {
        imageModalInstance = new bootstrap.Modal(imageModalRef.value);
    }
    imageModalInstance?.show();
};

const closeImageModal = () => {
    imageModalInstance?.hide();
    setTimeout(() => {
        currentImageModalUrl.value = '';
    }, 300);
};

const getActionItems = (row) => {
    const isAwaitingSuperAdmin = row.status === 'pending_superadmin';
    const isAwaitingAdmin = row.status === 'pending' || row.status === 'pending_mekudi';

    const viewOption = {
        label: 'View',
        icon: Eye,
        iconClass: 'text-info',
        command: () => openViewModal(row)
    };

    if (isAwaitingSuperAdmin) {
        if (!authStore.isSuperAdmin) return [];
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
            },
            viewOption
        ];
    }

    if (isAwaitingAdmin) {
        if (!authStore.isAdmin && !authStore.isSuperAdmin && !authStore.isAttendanceTaker) return [];
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
            },
            viewOption
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
        if (authStore.isAdmin || authStore.isSuperAdmin || authStore.isAttendanceTaker) {
            emit('refresh-pending-count');
        }
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
