<template>
    <div class="card border-0" style="background-color: var(--surface-ground);">
        <!-- Filters Bar -->
        <div class="card border-0 shadow-sm rounded-4 mb-3" style="background-color: var(--surface-card);">
            <div class="card-body p-3">
                <!-- Status Filter -->
                <div class="mb-3 mb-md-0">
                    <label class="form-label text-muted small fw-bold text-uppercase mb-1 d-block">Status</label>
                    <div class="d-grid d-md-flex gap-1 p-1 rounded-3" style="grid-template-columns: 1fr 1fr; background: #f1f5f9;">
                        <button 
                            type="button" 
                            class="btn px-3 px-md-4 py-2 fw-medium rounded-3 border-0 text-nowrap flex-fill flex-md-grow-0"
                            :class="statusFilter === '' ? 'bg-white shadow-sm text-dark' : 'bg-transparent text-muted'"
                            @click="statusFilter = ''">
                            All
                        </button>
                        <button 
                            type="button" 
                            class="btn px-3 px-md-4 py-2 fw-medium rounded-3 border-0 d-flex align-items-center justify-content-center gap-2 text-nowrap flex-fill flex-md-grow-0"
                            :class="statusFilter === 'approved' ? 'bg-white shadow-sm text-success' : 'bg-transparent text-muted'"
                            @click="statusFilter = 'approved'">
                            <span class="rounded-circle d-inline-block" style="width: 8px; height: 8px; background: #22c55e;"></span>
                            Approved
                        </button>
                        <button 
                            type="button" 
                            class="btn px-3 px-md-4 py-2 fw-medium rounded-3 border-0 d-flex align-items-center justify-content-center gap-2 text-nowrap flex-fill flex-md-grow-0"
                            :class="statusFilter === (authStore.isSuperAdmin ? 'pending_superadmin' : 'pending') ? 'bg-white shadow-sm text-warning' : 'bg-transparent text-muted'"
                            @click="statusFilter = authStore.isSuperAdmin ? 'pending_superadmin' : 'pending'">
                            <span class="rounded-circle d-inline-block" style="width: 8px; height: 8px; background: #f59e0b;"></span>
                            Pending
                        </button>
                        <button 
                            type="button" 
                            class="btn px-3 px-md-4 py-2 fw-medium rounded-3 border-0 d-flex align-items-center justify-content-center gap-2 text-nowrap flex-fill flex-md-grow-0"
                            :class="statusFilter === 'rejected' ? 'bg-white shadow-sm text-danger' : 'bg-transparent text-muted'"
                            @click="statusFilter = 'rejected'">
                            <span class="rounded-circle d-inline-block" style="width: 8px; height: 8px; background: #ef4444;"></span>
                            Rejected
                        </button>
                    </div>
                </div>
                <!-- Row & Kudi Filters -->
                <div class="d-flex gap-2 gap-md-3 mt-3">
                    <div class="flex-fill" style="min-width: 0;">
                        <label class="form-label text-muted small fw-bold text-uppercase mb-1">Row</label>
                        <select v-model="selectedRowFilter" class="form-select form-select-sm form-select-md-default">
                            <option value="">All Rows</option>
                            <option value="unassigned">⚠️ Unassigned</option>
                            <option v-for="row in seatingRows" :key="row.id" :value="row.row_num">
                                Row {{ row.row_num }}
                            </option>
                        </select>
                    </div>
                    <div class="flex-fill" style="min-width: 0;">
                        <label class="form-label text-muted small fw-bold text-uppercase mb-1">Kudi</label>
                        <select v-model="selectedKudiFilter" class="form-select form-select-sm form-select-md-default">
                            <option value="">All Kudis</option>
                            <option value="unassigned">⚠️ Unassigned</option>
                            <option v-for="kudi in kudiList" :key="kudi.id || kudi.name" :value="kudi.name">
                                {{ kudi.name || `Kudi ${kudi.id}` }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <!-- Table -->
        <BaseTable 
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
                    <div class="avatar-circle d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 overflow-hidden"
                        style="width: 32px; height: 32px; background: color-mix(in srgb, var(--primary-color) 15%, transparent);">
                        <User :size="14" style="color: var(--primary-color);" />
                    </div>
                    <div class="min-w-0">
                        <div class="fw-medium" style="color: var(--text-heading-color);">
                            {{ row.User?.UserProfile?.first_name_kh || row.User?.email }} {{ row.User?.UserProfile?.last_name_kh || '' }}
                        </div>
                        <div class="d-flex align-items-center gap-2 mt-0.5" style="font-size: 0.75rem;" v-if="row.User?.UserProfile?.kut_id || row.User?.UserProfile?.Kut?.name">
                            <span class="text-muted">
                                Kudi: {{ row.User.UserProfile.Kut ? row.User.UserProfile.Kut.name : row.User.UserProfile.kut_id }}
                            </span>
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
                <a v-if="row.image_url" :href="`https://neakavorn.work.gd${row.image_url}`" target="_blank" class="text-primary text-decoration-none">
                    <i class="bi bi-paperclip"></i> View
                </a>
                <span v-else class="text-muted fst-italic">-</span>
            </template>
            
            <template #actions="{ data: row }">
                <BaseActionMenu v-if="['pending', 'pending_mekudi', 'pending_superadmin'].includes(row.status) && getActionItems(row).length > 0" :items="getActionItems(row)" />
                <span v-else class="text-muted small">
                    <template v-if="row.status === 'pending_superadmin'">
                        <template v-if="authStore.isSuperAdmin">Awaiting Final Approval</template>
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
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
    seasonId: {
        type: [String, Number],
        default: null
    }
});

const toast = useToastStore();
const authStore = useAuthStore();
const isLoading = ref(false);
const requests = ref([]);
const seatingRows = ref([]);
const kudiList = ref([]);
const statusFilter = ref('');
const selectedRowFilter = ref('');
const selectedKudiFilter = ref('');

const showConfirmModal = ref(false);
const isUpdatingStatus = ref(false);
const confirmAction = ref('');
const confirmId = ref(null);

const filterOptions = computed(() => {
    const pendingValue = authStore.isSuperAdmin ? 'pending_superadmin' : 'pending';
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
        { field: 'attachment', header: 'Attachment', sortable: false },
        { field: 'status', header: 'Status', sortable: true },
        { field: 'actions', header: 'Actions', sortable: false, class: 'text-end' }
    ];
});

const matchKudiExact = (monkKudiRaw, filterValRaw) => {
    if (!filterValRaw) return true;
    if (filterValRaw === 'unassigned') {
        return !monkKudiRaw || monkKudiRaw === '-' || monkKudiRaw === 'Unassigned';
    }
    if (!monkKudiRaw) return false;

    const monkStr = monkKudiRaw.toString().trim();
    const filterStr = filterValRaw.toString().trim();

    if (monkStr.toLowerCase() === filterStr.toLowerCase()) return true;

    const extractDigits = (s) => {
        const khmerNums = ['<ctrl42>','១','២','៣','៤','៥','៦','៧','៨','៩'];
        let res = s;
        khmerNums.forEach((kh, i) => {
            res = res.replaceAll(kh, i.toString());
        });
        const match = res.match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
    };

    const monkNum = extractDigits(monkStr);
    const filterNum = extractDigits(filterStr);

    if (monkNum !== null && filterNum !== null) {
        return monkNum === filterNum;
    }

    return monkStr.toLowerCase() === filterStr.toLowerCase();
};

const filteredRequests = computed(() => {
    return requests.value.filter(row => {
        // Status filter
        let matchesStatus = true;
        if (statusFilter.value) {
            if (statusFilter.value === 'pending') {
                matchesStatus = row.status === 'pending' || row.status === 'pending_mekudi';
            } else {
                matchesStatus = row.status === statusFilter.value;
            }
        }

        // Row filter
        let matchesRow = true;
        const monkRow = row.User?.UserProfile?.SeatingRow?.row_num || row.User?.UserProfile?.seating_row_id;
        if (selectedRowFilter.value === 'unassigned') {
            matchesRow = !monkRow;
        } else if (selectedRowFilter.value) {
            matchesRow = monkRow === selectedRowFilter.value || monkRow?.toString() === selectedRowFilter.value.toString();
        }

        // Kudi filter
        const monkKudi = row.User?.UserProfile?.Kut?.name || row.User?.UserProfile?.kut_id;
        const matchesKudi = matchKudiExact(monkKudi, selectedKudiFilter.value);

        return matchesStatus && matchesRow && matchesKudi;
    });
});

const pendingCount = computed(() => {
    return requests.value.filter(r =>
        r.status === 'pending' || r.status === 'pending_mekudi' || r.status === 'pending_superadmin'
    ).length;
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
        if (authStore.isSuperAdmin) return 'Pending';
        return 'Pending Super Admin';
    }
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const getBadgeStatusColor = (status) => {
    if (!status) return 'secondary';
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    if (status.includes('pending')) return 'warning';
    return 'info';
};

const getActionItems = (row) => {
    const items = [];
    const canApprove = (authStore.isMekudi && (row.status === 'pending' || row.status === 'pending_mekudi')) ||
                       (authStore.isSuperAdmin && (row.status === 'pending' || row.status === 'pending_superadmin' || row.status === 'pending_mekudi'));
    if (canApprove) {
        items.push({
            label: 'Approve Request',
            icon: CheckCircle,
            command: () => openConfirmModal(row.id, 'approved')
        });
        items.push({
            label: 'Reject Request',
            icon: XCircle,
            command: () => openConfirmModal(row.id, 'rejected')
        });
    }
    return items;
};

const openConfirmModal = (id, action) => {
    confirmId.value = id;
    confirmAction.value = action;
    showConfirmModal.value = true;
};

const executeStatusUpdate = async () => {
    if (!confirmId.value || !confirmAction.value) return;
    isUpdatingStatus.value = true;
    try {
        await api.put(`/leave-requests/${confirmId.value}/status`, { status: confirmAction.value });
        toast.showToast(`Leave request ${confirmAction.value} successfully`, 'success');
        showConfirmModal.value = false;
        fetchRequests();
    } catch (e) {
        console.error('Failed to update leave request status:', e);
        toast.showToast(e.response?.data?.message || 'Failed to update status', 'error');
    } finally {
        isUpdatingStatus.value = false;
    }
};

const fetchSeatingRows = async () => {
    try {
        const res = await api.get('/seating-rows');
        seatingRows.value = res.data?.data || res.data || [];
    } catch (e) {
        console.error('Failed to fetch seating rows:', e);
    }
};

const sortKudisNumerically = (list) => {
    return list.slice().sort((a, b) => {
        const extractNum = (item) => {
            const val = (item.name || item.id || '').toString();
            const khmerNums = ['<ctrl42>','១','២','៣','៤','៥','៦','៧','៨','៩'];
            let res = val;
            khmerNums.forEach((kh, i) => {
                res = res.replaceAll(kh, i.toString());
            });
            const match = res.match(/\d+/);
            return match ? parseInt(match[0], 10) : 999999;
        };
        const numA = extractNum(a);
        const numB = extractNum(b);
        if (numA !== numB) return numA - numB;
        return (a.name || '').localeCompare(b.name || '');
    });
};

const fetchKudis = async () => {
    try {
        const res = await api.get('/kuts');
        const raw = res.data?.data || res.data || [];
        kudiList.value = sortKudisNumerically(raw);
    } catch (e) {
        console.error('Failed to fetch kuts:', e);
    }
};

const fetchRequests = async () => {
    isLoading.value = true;
    try {
        const params = {};
        if (props.seasonId) {
            params.retreat_event_id = props.seasonId;
        }
        const res = await api.get('/leave-requests', { params });
        requests.value = res.data?.data || res.data || [];
    } catch (e) {
        console.error('Failed to fetch leave requests:', e);
        toast.showToast('Failed to load leave requests', 'error');
    } finally {
        isLoading.value = false;
    }
};

watch(() => props.seasonId, () => {
    fetchRequests();
});

onMounted(async () => {
    await fetchSeatingRows();
    await fetchKudis();
    fetchRequests();
});

defineExpose({
    pendingCount
});
</script>

<style scoped>
.min-w-0 {
    min-width: 0;
}
</style>
