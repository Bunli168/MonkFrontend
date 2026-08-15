<template>
    <div class="admin-takers-table-view">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
            <div>
                <h5 class="fw-bold mb-1" style="color: var(--text-heading-color);">Attendance Takers</h5>
                <p class="text-muted small mb-0">View all users assigned as Attendance Takers.</p>
            </div>
            
            <div class="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 w-100 ms-sm-auto mt-2 mt-sm-0" style="max-width: 500px;">
                <div class="search-input flex-grow-1 w-100">
                    <BaseInput 
                        v-model="searchQuery" 
                        placeholder="Search by name, email, or phone..." 
                        :prefixIcon="Search"
                        clearable
                    />
                </div>
                <BaseButton @click="showCreateModal = true" variant="primary" class="d-flex align-items-center justify-content-center px-4 w-100 w-sm-auto text-nowrap mt-2 mt-sm-0">
                    <Plus size="16" class="me-1" /> Add Taker
                </BaseButton>
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
                <BaseTable 
                :columns="colDefs" 
                :rows="paginatedTakers" 
                :totalRecords="filteredTakers.length"
                v-model:page="currentPage"
                v-model:perPage="perPage"
                :loading="isLoading"
                :show-index="true"
                :hideIndexOnMobile="true"
            >
                <template #name="{ data: row }">
                    <div class="d-flex align-items-center gap-3 py-1">
                        <div class="avatar-circle bg-white shadow-sm flex-shrink-0 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; border-radius: 50%;">
                            <img src="/app-logo.png" class="w-100 h-100 object-fit-cover rounded-circle" />
                        </div>
                        <div>
                            <div class="fw-bold text-dark">{{ row.name }}</div>
                            <div class="small text-muted">{{ row.email || 'No email' }}</div>
                        </div>
                    </div>
                </template>

                <template #phone="{ data: row }">
                    <div class="d-flex align-items-center text-muted">
                        <i class="fas fa-phone-alt me-2 small opacity-50"></i>
                        {{ row.phone || '-' }}
                    </div>
                </template>

                <template #assigned_rows="{ data: row }">
                    <div v-if="row.assigned_rows && row.assigned_rows.length > 0" class="d-flex flex-wrap gap-1">
                        <span 
                            v-for="r in row.assigned_rows" 
                            :key="r.id" 
                            class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle"
                        >
                            Row {{ r.row_num }}
                        </span>
                    </div>
                    <span v-else class="text-muted fst-italic small">
                        No rows assigned
                    </span>
                </template>

                <template #actions="{ data: row }">
                    <BaseActionMenu :items="getActionItems(row)" />
                </template>
            </BaseTable>
            </div>
        </div>

        <BaseModal v-model="showCreateModal" title="Create New Attendance Taker" size="sm">
            <form @submit.prevent="createTaker">
                <div class="mb-3">
                    <BaseInput v-model="newTaker.name" label="Full Name" placeholder="e.g. Sok San" required />
                </div>
                <div class="mb-3">
                    <BaseInput type="email" v-model="newTaker.email" label="Email (Optional)" placeholder="example@pagoda.com" />
                </div>
                <div class="mb-4">
                    <BaseInput type="text" v-model="newTaker.phone" label="Phone Number" placeholder="e.g. 012345678" required />
                </div>
                <div class="d-flex justify-content-end gap-2">
                    <BaseButton type="button" variant="outline-secondary" @click="showCreateModal = false">Cancel</BaseButton>
                    <BaseButton type="submit" variant="primary" :isLoading="isCreating">Create Taker</BaseButton>
                </div>
            </form>
        </BaseModal>

        <BaseModal v-model="showAssignModal" title="Assign Rows" size="md">
            <div v-if="selectedTaker" class="mb-4">
                <p class="text-muted mb-3">
                    Select rows to assign to <strong>{{ selectedTaker.name }}</strong>.
                </p>
                <div class="row g-2">
                    <div class="col-4 col-sm-3" v-for="row in seatingRowsOptions" :key="row.id">
                        <div class="form-check custom-checkbox">
                            <input 
                                class="form-check-input" 
                                type="checkbox" 
                                :id="'row-' + row.id" 
                                :value="row.id" 
                                v-model="selectedRowIds"
                            >
                            <label class="form-check-label w-100" :for="'row-' + row.id" style="cursor:pointer;">
                                Row {{ row.row_num }}
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4">
                <BaseButton type="button" variant="outline-secondary" @click="showAssignModal = false">Cancel</BaseButton>
                <BaseButton type="button" variant="primary" :isLoading="isAssigning" @click="saveAssignedRows">Save Changes</BaseButton>
            </div>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Search, Plus, ListChecks, Edit, Trash2 } from '@lucide/vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import BaseActionMenu from '@/components/base/BaseActionMenu.vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();
const searchQuery = ref('');
const isLoading = ref(false);

const users = ref([]);
const seatingRows = ref([]);

const colDefs = [
    { field: 'name', header: 'Taker Name', width: '25%', class: 'mobile-stack' },
    { field: 'phone', header: 'Phone Number', width: '20%' },
    { field: 'assigned_rows', header: 'Assigned Rows', width: '40%', class: 'mobile-stack' },
    { field: 'actions', header: 'Actions', width: '15%', class: 'text-center mobile-stack', sortable: false }
];

const showCreateModal = ref(false);
const isCreating = ref(false);
const takerRoleId = ref(null);
const newTaker = ref({
    name: '',
    email: '',
    phone: ''
});

// Assign Rows modal state
const showAssignModal = ref(false);
const isAssigning = ref(false);
const selectedTaker = ref(null);
const selectedRowIds = ref([]);
const initialRowIds = ref([]);

const seatingRowsOptions = computed(() => {
    return [...seatingRows.value].sort((a, b) => a.row_num - b.row_num);
});

const openAssignModal = (taker) => {
    selectedTaker.value = taker;
    selectedRowIds.value = taker.assigned_rows.map(r => r.id);
    initialRowIds.value = [...selectedRowIds.value];
    showAssignModal.value = true;
};

const editTaker = (taker) => {
    toast.showToast('Edit feature coming soon', 'info');
};

const deleteTaker = (taker) => {
    toast.showToast('Delete feature coming soon', 'info');
};

const getActionItems = (row) => {
    return [
        {
            label: 'Assign Rows',
            icon: ListChecks,
            command: () => openAssignModal(row),
            iconClass: 'text-primary'
        },
        {
            label: 'Edit',
            icon: Edit,
            command: () => editTaker(row),
            iconClass: 'text-warning'
        },
        {
            label: 'Delete',
            icon: Trash2,
            command: () => deleteTaker(row),
            iconClass: 'text-danger'
        }
    ];
};

const saveAssignedRows = async () => {
    if (!selectedTaker.value) return;
    
    isAssigning.value = true;
    try {
        const takerId = selectedTaker.value.id;
        
        // Find rows that need to be unassigned (were in initial, but not in selected)
        const rowsToUnassign = initialRowIds.value.filter(id => !selectedRowIds.value.includes(id));
        // Find rows that need to be assigned (in selected, but not in initial)
        const rowsToAssign = selectedRowIds.value.filter(id => !initialRowIds.value.includes(id));
        
        const promises = [];
        
        // Unassign rows
        for (const rowId of rowsToUnassign) {
            promises.push(api.post('/seating-rows/assign-taker', { row_id: rowId, taker_id: null }));
        }
        
        // Assign new rows
        for (const rowId of rowsToAssign) {
            promises.push(api.post('/seating-rows/assign-taker', { row_id: rowId, taker_id: takerId }));
        }
        
        await Promise.all(promises);
        
        toast.showToast('Rows assigned successfully', 'success');
        showAssignModal.value = false;
        
        // Refresh table data
        await fetchTakersAndRows();
    } catch (error) {
        console.error('Failed to assign rows:', error);
        toast.showToast('Failed to assign rows', 'error');
    } finally {
        isAssigning.value = false;
    }
};

const fetchTakerRole = async () => {
    try {
        const response = await api.get('/roles');
        const roles = response.data?.data || response.data || [];
        const role = roles.find(r => r.name === 'AttendanceTaker' || r.name === 'ATTENDANCETAKER');
        if (role) {
            takerRoleId.value = role.id;
        }
    } catch (error) {
        console.error('Failed to fetch roles:', error);
    }
};

const createTaker = async () => {
    if (!takerRoleId.value) {
        toast.showToast('Attendance Taker role not found in system', 'error');
        return;
    }
    
    isCreating.value = true;
    try {
        const parts = newTaker.value.name.trim().split(' ');
        const firstName = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];
        const lastName = parts.length > 1 ? parts[0] : '';
        
        const payload = {
            firstName,
            lastName,
            email: newTaker.value.email || undefined,
            phone_number: newTaker.value.phone,
            roleId: takerRoleId.value
        };
        
        await api.post('/users/register', payload);
        toast.showToast('Attendance Taker created successfully', 'success');
        showCreateModal.value = false;
        
        // Reset form
        newTaker.value = { name: '', email: '', phone: '' };
        
        // Refresh table
        await fetchTakersAndRows();
    } catch (error) {
        console.error('Create taker error:', error);
        const errMsg = error.response?.data?.message || 'Failed to create taker';
        toast.showToast(errMsg, 'error');
    } finally {
        isCreating.value = false;
    }
};

const fetchTakersAndRows = async () => {
    isLoading.value = true;
    try {
        const [usersRes, rowsRes] = await Promise.all([
            api.get('/users?perPage=10000&includeTakers=true'),
            api.get('/seating-rows')
        ]);
        
        users.value = usersRes.data?.data?.users || usersRes.data?.data || usersRes.data || [];
        seatingRows.value = rowsRes.data?.data || rowsRes.data || [];
    } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.showToast('Failed to fetch takers data', 'error');
    } finally {
        isLoading.value = false;
    }
};

const getUserDisplayName = (user) => {
    const profile = user.UserProfile || user.profile || {};
    const firstName = profile.first_name_kh || profile.first_name_en || user.firstName || user.first_name || '';
    const lastName = profile.last_name_kh || profile.last_name_en || user.lastName || user.last_name || '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    if (fullName) return fullName;
    return profile.full_name || profile.name || 'Unnamed Taker';
};

const takersData = computed(() => {
    // 1. Filter out only ATTENDANCETAKER role
    const takers = users.value.filter(u => {
        const roleName = (u.Role?.name || u.role?.name || '').toUpperCase();
        return roleName === 'ATTENDANCETAKER';
    });

    // 2. Map their assigned rows
    return takers.map(taker => {
        // Find all rows where this taker is the assigned_taker_id
        const assignedRows = seatingRows.value
            .filter(r => r.assigned_taker_id === taker.id)
            .map(r => ({ id: r.id, row_num: r.row_num }))
            .sort((a, b) => a.row_num - b.row_num);

        return {
            id: taker.id,
            name: getUserDisplayName(taker),
            email: taker.email,
            phone: taker.phone || taker.UserProfile?.phone_number || taker.profile?.phone || '',
            assigned_rows: assignedRows
        };
    });
});

const filteredTakers = computed(() => {
    if (!searchQuery.value) return takersData.value;
    
    const query = searchQuery.value.toLowerCase();
    return takersData.value.filter(taker => 
        (taker.name && taker.name.toLowerCase().includes(query)) ||
        (taker.email && taker.email.toLowerCase().includes(query)) ||
        (taker.phone && taker.phone.includes(query))
    );
});

const currentPage = ref(1);
const perPage = ref(10);

watch(searchQuery, () => {
    currentPage.value = 1;
});

const paginatedTakers = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    const end = start + perPage.value;
    return filteredTakers.value.slice(start, end);
});

onMounted(() => {
    fetchTakerRole();
    fetchTakersAndRows();
});
</script>

<style scoped>
.admin-takers-table-view {
    min-height: 400px;
}
.avatar-circle {
    font-size: 1.1rem;
}

@media screen and (max-width: 767.98px) {
    :deep(td.mobile-stack .cell-content) {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 0.5rem !important;
    }
    :deep(td.mobile-stack .cell-value) {
        justify-content: flex-start !important;
        text-align: left !important;
        width: 100% !important;
    }
    :deep(td.mobile-stack .cell-value > div),
    :deep(td.mobile-stack .cell-value > button) {
        width: 100% !important;
        justify-content: flex-start !important;
    }
    :deep(td.mobile-stack .cell-value > button) {
        justify-content: center !important;
    }
    /* Name column specific override for text alignment on mobile */
    :deep(td.mobile-stack .cell-value .text-start) {
        text-align: left !important;
    }
}
</style>
