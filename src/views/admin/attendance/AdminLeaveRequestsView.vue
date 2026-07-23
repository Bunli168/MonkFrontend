<template>
    <div class="card border-0" style="background-color: var(--surface-ground);">
        <!-- Filters Bar -->
        <div class="mb-3 d-flex align-items-center gap-2 w-100">
            <div class="flex-grow-1" style="min-width: 0;">
                <BaseFilter v-model="statusFilter" :options="filterOptions" />
            </div>
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
                        <template v-if="false">Awaiting Final Approval</template>
                        <template v-else>Pending Super Admin</template>
                    </template>
                    <template v-else-if="row.status === 'approved' || row.status === 'rejected'">
                        {{ row.status === 'approved' ? 'Approved' : 'Rejected' }} <template v-if="row.Approver?.UserProfile?.first_name_kh">by {{ row.Approver.UserProfile.first_name_kh }}</template>
                    </template>
                    <template v-else>{{ formatStatus(row.status) }}</template>
                </span>
            </template>
        </BaseTable>

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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import { CheckCircle, XCircle, User } from '@lucide/vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseFilter from '@/components/base/BaseFilter.vue';
import BaseBadge from '@/components/base/BaseBadge.vue';
import BaseActionMenu from '@/components/base/BaseActionMenu.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';

const toast = useToastStore();
const isLoading = ref(false);
const requests = ref([]);
const statusFilter = ref('');

const showConfirmModal = ref(false);
const isUpdatingStatus = ref(false);
const confirmAction = ref('');
const confirmId = ref(null);

import { useAuthStore } from '@/stores/auth';

const props = defineProps({
    seasonId: {
        type: [String, Number],
        default: null
    }
});

const authStore = useAuthStore();
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
    return [
        { field: 'monk', header: 'Monk', sortable: false },
        { field: 'date_range', header: 'Date Range', sortable: false },
        { field: 'reason', header: 'Reason', sortable: false },
        { field: 'status', header: 'Status', sortable: true },
        { field: 'actions', header: 'Actions', sortable: false, class: 'text-end' }
    ];
});

const filteredRequests = computed(() => {
    return requests.value;
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
        if (false) return 'Pending';
        return 'Pending Super Admin';
    }
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const getBadgeStatusColor = (status) => {
    if (!status) return '';
    if (status === 'pending_superadmin' && !false) {
        return 'PENDING';
    }
    if (status === 'pending_mekudi' || status === 'pending') return 'PENDING';
    return status.toUpperCase();
};

const fetchRequests = async () => {
    isLoading.value = true;
    try {
        const params = { status: statusFilter.value };
        if (props.seasonId) {
            params.retreat_event_id = props.seasonId;
        }
        const response = await api.get('/leave-requests', { params });
        requests.value = response.data || [];
    } catch (error) {
        console.error('Failed to load leave requests:', error);
        toast.showToast('Failed to load requests', 'error');
    } finally {
        isLoading.value = false;
    }
};

watch([statusFilter, () => props.seasonId], () => {
    fetchRequests();
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

onMounted(() => {
    fetchRequests();
});
</script>

<style scoped>
</style>
