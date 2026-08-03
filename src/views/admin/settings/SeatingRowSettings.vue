<template>
    <div class="seating-row-settings">
        <!-- Header -->
        <div class="card p-3 mb-3 border-0 shadow-sm" style="background-color: var(--surface-card);">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                    <h5 class="mb-0 fw-bold" style="color: var(--text-heading-color);">Seating Row Management</h5>
                    <p class="mb-0 small text-muted">Manage global seating rows for attendance.</p>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <BaseButton @click="showBulkAssignModal = true" variant="outline-success">
                        <i class="fas fa-users-cog me-2"></i> Assign Taker
                    </BaseButton>
                    <BaseButton @click="showBulkCapacityModal = true" variant="outline-primary">
                        <i class="fas fa-layer-group me-2"></i> Set All Capacity
                    </BaseButton>
                    <BaseButton @click="initializeRows" variant="primary" :isLoading="isInitializing">
                        <i class="fas fa-plus me-2"></i> Initialize 17 Rows
                    </BaseButton>
                    <BaseButton v-if="false" @click="showDeleteAllModal = true" variant="danger">
                        <i class="fas fa-trash-alt me-2"></i> Delete All Rows
                    </BaseButton>
                </div>
            </div>
        </div>

        <div class="row g-3 mb-3">
            <!-- Left Column: Row List -->
            <div class="col-lg-4">
                <div class="card p-3 h-100 border-0 shadow-sm" style="background-color: var(--surface-card);">
                    <div class="d-flex align-items-center gap-2 mb-3">
                        <div class="date-badge text-center p-2 rounded-3 bg-primary-soft text-primary" style="width: 45px; height: 45px; display: flex; justify-content: center; align-items: center;">
                            <i class="fas fa-list fs-5"></i>
                        </div>
                        <h5 class="fw-bold m-0 text-heading">Row Numbers</h5>
                    </div>
                    
                    <div class="calendar-wrapper overflow-hidden border-top pt-3">
                        <div v-if="isLoadingRows" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        <div v-else-if="seatingRowsSorted.length === 0" class="text-center py-5 text-muted">
                            <p class="mb-0 small">No seating rows found.</p>
                        </div>
                        <div v-else class="kudi-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; justify-items: center; align-items: center;">
                            <div
                                v-for="row in seatingRowsSorted"
                                :key="row.id"
                                @click="selectRow(row)"
                                class="kudi-grid-item d-flex align-items-center justify-content-center transition-all"
                                :class="{ 'active-kudi text-white shadow-sm': selectedRowId === row.id }"
                                :style="selectedRowId === row.id ? 'background-color: var(--primary-color);' : 'width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1rem; color: var(--text-color); background-color: transparent;'"
                                style="width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1rem; color: var(--text-color);"
                            >
                                {{ row.row_num }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Right Column: Admin List -->
            <div class="col-lg-8">
                <div class="card p-3 h-100 border-0 shadow-sm planner-details" style="background-color: var(--surface-card);">
                    <!-- Top Row -->
                    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
                        <div class="d-flex align-items-center gap-3">
                            <div class="date-badge text-center p-2 rounded-3 bg-primary-soft text-primary" style="width: 55px; height: 55px; flex-shrink: 0; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                <span class="d-block fw-bold fs-5">{{ selectedRow ? selectedRow.row_num : '-' }}</span>
                                <span class="d-block text-uppercase small" style="font-size: 0.6rem; font-weight: 700;">Row</span>
                            </div>
                            <div v-if="!selectedRow">
                                <h4 class="fw-bold mb-1 text-heading">Seating Row Overview</h4>
                                <span class="text-muted small">Click on a Row number to view its assigned monks</span>
                            </div>
                            <div v-else>
                                <h4 class="fw-bold mb-1 text-heading">Row {{ selectedRow.row_num }}</h4>
                                <span class="text-muted small">Capacity: {{ selectedRow.capacity || 'N/A' }} seats</span>
                            </div>
                        </div>
                        
                        <!-- Actions for Selected Row -->
                        <div v-if="selectedRow" class="d-flex gap-2">
                            <BaseButton variant="outline-primary" size="sm" @click="editRow(selectedRow)">
                                <Edit size="16" class="me-1" /> Edit
                            </BaseButton>
                            <BaseButton variant="outline-danger" size="sm" @click="deleteRow(selectedRow)">
                                <Trash2 size="16" class="me-1" /> Delete
                            </BaseButton>
                        </div>
                    </div>

                    <!-- Row Seats List Content -->
                    <div class="card-body p-0">
                        <div v-if="!selectedRow" class="text-center py-5 text-muted d-flex flex-column align-items-center">
                            <div class="mb-3 p-3 bg-light rounded-circle text-muted" style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-users fs-4"></i>
                            </div>
                            <h6 class="fw-bold text-dark">No Row Selected</h6>
                            <p class="mb-0 small">Select a row from the list to view its monks.</p>
                        </div>
                        <div v-else>
                            <div class="d-flex flex-column gap-3 mb-3">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="small text-muted fw-bold">Assigned Taker</div>
                                    <div class="d-flex align-items-center gap-2" style="width: 250px;">
                                        <select class="form-select form-select-sm" :value="selectedRow.assigned_taker_id || ''" @change="e => assignTakerToRow(selectedRow.id, e.target.value)">
                                            <option value="">-- No Taker Assigned --</option>
                                            <option v-for="taker in takersList" :key="taker.id" :value="taker.id">
                                                {{ getUserDisplayName(taker) }} ({{ taker.role?.name }})
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="small text-muted">Assigned Monks</div>
                                    <div class="d-flex align-items-center gap-3">
                                        <div class="fw-semibold">{{ getUsersForRow(selectedRow.id).length }} / {{ selectedRow.capacity || 0 }}</div>
                                    </div>
                                </div>
                            </div>

                            <div class="table-responsive">
                                <table class="table table-sm table-bordered align-middle mb-0">
                                    <thead class="table-light">
                                        <tr>
                                            <th style="width: 80px" class="text-center">Seat</th>
                                            <th>Assigned Monk</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(seat, index) in seatsList" :key="index">
                                            <td class="text-center fw-semibold">{{ seat.seatNumber }}</td>
                                            <td class="d-flex justify-content-between align-items-center">
                                                <div v-if="seat.assignedUser">
                                                    {{ getUserDisplayName(seat.assignedUser) }}
                                                    <small class="text-muted d-block">{{ seat.assignedUser.email }}</small>
                                                </div>
                                                <div v-else class="text-muted fst-italic small">Empty</div>
                                                
                                                <div v-if="!seat.assignedUser">
                                                    <BaseButton variant="outline-primary" size="sm" @click="openAssignModal(seat.seatNumber)">
                                                        Assign
                                                    </BaseButton>
                                                </div>
                                                <div v-else>
                                                    <BaseButton variant="outline-danger" size="sm" @click="unassignUser(seat.assignedUser)">
                                                        Remove
                                                    </BaseButton>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card p-3 mb-3 border-0 shadow-sm" style="background-color: var(--surface-card);">
            <div class="row g-3 align-items-end">
                <div class="col-md-6">
                    <label class="form-label">Row Number</label>
                    <input v-model.number="newRow.row_num" class="form-control" type="number" placeholder="Enter row number" min="1" />
                </div>
                <div class="col-md-6">
                    <label class="form-label">Capacity</label>
                    <input v-model.number="newRow.capacity" class="form-control" type="number" placeholder="Capacity" min="0" />
                </div>
                <div class="col-12 d-flex justify-content-end">
                    <BaseButton @click="createRow" variant="success" :isLoading="isCreatingRow" :disabled="!newRow.row_num">
                        <i class="fas fa-plus me-2"></i> Create Row
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Edit Row Modal -->
        <BaseModal v-model="showEditModal" title="Edit Seating Row" @close="closeEditModal">
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Row Number</label>
                    <input v-model.number="editingRow.row_num" class="form-control" type="number" min="1" />
                </div>
                <div class="col-md-6">
                    <label class="form-label">Capacity</label>
                    <input v-model.number="editingRow.capacity" class="form-control" type="number" min="0" />
                </div>
            </div>
            <template #footer>
                <BaseButton variant="outline-secondary" @click="closeEditModal">Cancel</BaseButton>
                <BaseButton variant="primary" @click="updateRow" :isLoading="isUpdatingRow" :disabled="!editingRow.row_num">Save Changes</BaseButton>
            </template>
        </BaseModal>


        <!-- Delete Row Modal -->
        <BaseModal v-model="showDeleteModal" title="Confirm Delete" @close="closeDeleteModal">
            <div class="text-center py-3">
                <div class="mb-3">
                    <i class="fas fa-exclamation-triangle text-danger fs-1"></i>
                </div>
                <h5 class="fw-bold">Delete Row {{ rowToDelete?.row_num }}?</h5>
                <p class="text-muted mb-0">Are you sure you want to delete this row?</p>
                <p class="text-danger small mt-2">This action cannot be undone. Any monks assigned to this row will be unassigned.</p>
            </div>
            <template #footer>
                <BaseButton variant="outline-secondary" @click="closeDeleteModal">Cancel</BaseButton>
                <BaseButton variant="danger" @click="confirmDeleteRow" :isLoading="isDeletingRow">Delete</BaseButton>
            </template>
        </BaseModal>

        <!-- Delete All Rows Modal -->
        <BaseModal v-model="showDeleteAllModal" title="Confirm Delete All" @close="showDeleteAllModal = false">
            <div class="text-center py-3">
                <div class="mb-3">
                    <i class="fas fa-exclamation-triangle text-danger fs-1"></i>
                </div>
                <h5 class="fw-bold text-danger">Delete ALL Seating Rows?</h5>
                <p class="text-muted mb-0">Are you sure you want to completely delete all rows?</p>
                <p class="text-danger small mt-2">This action is irreversible. All attendance takers and seated monks will be unassigned!</p>
            </div>
            <template #footer>
                <BaseButton variant="outline-secondary" @click="showDeleteAllModal = false">Cancel</BaseButton>
                <BaseButton variant="danger" @click="confirmDeleteAll" :isLoading="isDeletingAll">Delete All</BaseButton>
            </template>
        </BaseModal>

        <!-- Assign User Modal -->
        <BaseModal v-model="showAssignModal" title="Assign Monk to Seat" @close="closeAssignModal">
            <div class="mb-3">
                <label class="form-label fw-bold">Select Monk for Seat {{ seatToAssign }}</label>
                <select class="form-select" v-model="userToAssign" :disabled="isAssigning">
                    <option value="" disabled>Select a monk...</option>
                    <option v-for="user in unassignedUsers" :key="user.id" :value="user.id">
                        {{ getUserDisplayName(user) }} ({{ user.Role?.name || 'Monk' }})
                    </option>
                </select>
            </div>
            <template #footer>
                <BaseButton variant="outline-secondary" @click="closeAssignModal">Cancel</BaseButton>
                <BaseButton variant="primary" @click="confirmAssignUser" :isLoading="isAssigning" :disabled="!userToAssign">Assign</BaseButton>
            </template>
        </BaseModal>

        <!-- Bulk Capacity Modal -->
        <BaseModal v-model="showBulkCapacityModal" title="Set Capacity for All Rows" @close="showBulkCapacityModal = false">
            <div class="mb-3">
                <label class="form-label fw-bold">Global Capacity</label>
                <p class="text-muted small">This will instantly set the capacity for EVERY existing row to the number below.</p>
                <input v-model.number="bulkCapacityValue" class="form-control" type="number" min="0" placeholder="e.g. 50" />
            </div>
            <template #footer>
                <BaseButton variant="outline-secondary" @click="showBulkCapacityModal = false">Cancel</BaseButton>
                <BaseButton variant="primary" @click="confirmBulkCapacity" :isLoading="isSettingBulkCapacity" :disabled="bulkCapacityValue === null || bulkCapacityValue < 0">Set Capacity</BaseButton>
            </template>
        </BaseModal>

        <!-- Bulk Assign Taker Modal -->
        <BaseModal v-model="showBulkAssignModal" title="Assign Taker to Rows" @close="closeBulkAssignModal">
            <div class="mb-3">
                <label class="form-label fw-bold">Select Taker</label>
                <select class="form-select" v-model="bulkAssignData.takerId">
                    <option value="">-- Select Taker --</option>
                    <option v-for="taker in takersList" :key="taker.id" :value="taker.id">
                        {{ getUserDisplayName(taker) }}
                    </option>
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label fw-bold">Select Rows</label>
                <div v-if="unassignedRows.length === 0" class="text-muted small fst-italic">
                    All rows are currently assigned to a taker.
                </div>
                <div v-else class="d-flex flex-wrap gap-2 mt-2">
                    <div v-for="row in unassignedRows" :key="row.id" 
                         class="form-check border rounded p-2 d-flex align-items-center"
                         :class="{ 'border-primary bg-primary text-white': bulkAssignData.rowIds.includes(row.id) }"
                         @click="toggleRowSelection(row.id)"
                         style="cursor: pointer; min-width: 60px; justify-content: center; transition: all 0.2s;">
                        <span class="fw-bold">Row {{ row.row_num }}</span>
                    </div>
                </div>
            </div>
            <template #footer>
                <BaseButton variant="outline-secondary" @click="closeBulkAssignModal">Cancel</BaseButton>
                <BaseButton variant="primary" @click="confirmBulkAssign" :isLoading="isBulkAssigning" :disabled="!bulkAssignData.takerId || bulkAssignData.rowIds.length === 0">Assign</BaseButton>
            </template>
        </BaseModal>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import BaseModal from '@/components/base/BaseModal.vue';
import { Edit, Trash2, Plus } from '@lucide/vue';
import { useAuthStore } from '@/stores/auth';

const toast = useToastStore();
const authStore = useAuthStore();


const seatingRows = ref([]);
const assignedUsers = ref([]);
const selectedRowId = ref(null);
const newRow = ref({ row_num: null, capacity: 0 });
const isCreatingRow = ref(false);

const showEditModal = ref(false);
const editingRow = ref({ id: null, row_num: null, capacity: 0 });
const isUpdatingRow = ref(false);

const showDeleteModal = ref(false);
const rowToDelete = ref(null);
const isDeletingRow = ref(false);

const showDeleteAllModal = ref(false);
const isDeletingAll = ref(false);

const showAssignModal = ref(false);
const seatToAssign = ref(null);
const userToAssign = ref('');
const isAssigning = ref(false);

const showBulkCapacityModal = ref(false);
const bulkCapacityValue = ref(null);
const isSettingBulkCapacity = ref(false);

const showBulkAssignModal = ref(false);
const bulkAssignData = ref({ takerId: '', rowIds: [] });
const isBulkAssigning = ref(false);

// Loading states
const isLoadingRows = ref(false);
const isInitializing = ref(false);

const seatingRowsSorted = computed(() => {
    return [...seatingRows.value].sort((a, b) => Number(a.row_num) - Number(b.row_num));
});

const unassignedRows = computed(() => {
    return seatingRowsSorted.value.filter(row => !row.assigned_taker_id);
});

const selectedRow = computed(() => {
    return seatingRows.value.find(row => Number(row.id) === Number(selectedRowId.value)) || null;
});

const selectRow = (row) => {
    selectedRowId.value = row.id;
};

const getUserDisplayName = (user) => {
    const profile = user.UserProfile || user.profile || {};
    const firstName = profile.first_name_kh || profile.first_name_en || user.firstName || user.first_name || '';
    const lastName = profile.last_name_kh || profile.last_name_en || user.lastName || user.last_name || '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    if (fullName) return fullName;
    if (user.email) return user.email;
    return profile.full_name || profile.name || 'Unnamed monk';
};

const getUserSeatNumber = (user) => {
    const profile = user.UserProfile || user.profile || {};
    return profile.seat_number || profile.seatNumber || user.seat_number || user.seatNumber || null;
};

const getUsersForRow = (rowId) => {
    return assignedUsers.value.filter(user => {
        const profile = user.UserProfile || user.profile || {};
        const rowValue = profile.seating_row_id || profile.seatingRowId || user.seating_row_id || user.seatingRowId;
        const roleName = (user.Role?.name || user.role?.name || '').toUpperCase().replace(/\s+/g, '');
        const isManagement = ['ATTENDANCETAKER', 'SUPERADMIN'].includes(roleName);
        return Number(rowValue) === Number(rowId) && !isManagement;
    });
};

const unassignedUsers = computed(() => {
    return assignedUsers.value.filter(user => {
        const profile = user.UserProfile || user.profile || {};
        const rowValue = profile.seating_row_id || profile.seatingRowId || user.seating_row_id || user.seatingRowId;
        const roleName = (user.Role?.name || user.role?.name || '').toUpperCase().replace(/\s+/g, '');
        
        const isManagement = ['ATTENDANCETAKER', 'SUPERADMIN'].includes(roleName);
        
        return !rowValue && !isManagement;
    }).sort((a, b) => {
        const roleA = (a.Role?.name || '').toUpperCase();
        const roleB = (b.Role?.name || '').toUpperCase();
        if (roleA.includes('BHIKKHU') && !roleB.includes('BHIKKHU')) return -1;
        if (!roleA.includes('BHIKKHU') && roleB.includes('BHIKKHU')) return 1;
        return 0;
    });
});

const seatsList = computed(() => {
    if (!selectedRow.value) return [];
    const capacity = selectedRow.value.capacity || 0;
    const usersInRow = getUsersForRow(selectedRow.value.id);
    const seats = [];
    
    for (let i = 1; i <= capacity; i++) {
        const user = usersInRow.find(u => Number(getUserSeatNumber(u)) === i);
        seats.push({
            seatNumber: i,
            assignedUser: user || null
        });
    }
    
    // Add users whose seat number is invalid or outside capacity
    usersInRow.forEach(u => {
        const seatNum = Number(getUserSeatNumber(u));
        if (!seatNum || seatNum > capacity || seatNum < 1) {
            seats.push({
                seatNumber: getUserSeatNumber(u) || 'Unassigned',
                assignedUser: u
            });
        }
    });
    
    return seats;
});

const takersList = computed(() => {
    return assignedUsers.value.filter(u => {
        const roleName = (u.Role?.name || u.role?.name || '').toUpperCase();
        return roleName === 'ATTENDANCETAKER';
    });
});

const assignTakerToRow = async (rowId, takerId) => {
    try {
        await api.post('/seating-rows/assign-taker', {
            row_id: rowId,
            taker_id: takerId ? Number(takerId) : null
        });
        toast.showToast('Taker assigned successfully', 'success');
        await fetchSeatingRows();
        
        // Update selectedRow to reflect the new assigned_taker_id
        const updatedRow = seatingRows.value.find(r => r.id === rowId);
        if (updatedRow) selectedRow.value = updatedRow;
    } catch (error) {
        console.error('Failed to assign taker:', error);
        toast.showToast(error.response?.data?.message || 'Failed to assign taker', 'error');
    }
};

const closeBulkAssignModal = () => {
    showBulkAssignModal.value = false;
    bulkAssignData.value = { takerId: '', rowIds: [] };
};

const toggleRowSelection = (rowId) => {
    const index = bulkAssignData.value.rowIds.indexOf(rowId);
    if (index === -1) {
        bulkAssignData.value.rowIds.push(rowId);
    } else {
        bulkAssignData.value.rowIds.splice(index, 1);
    }
};

const confirmBulkAssign = async () => {
    if (!bulkAssignData.value.takerId || bulkAssignData.value.rowIds.length === 0) return;
    isBulkAssigning.value = true;
    try {
        await Promise.all(
            bulkAssignData.value.rowIds.map(rowId => 
                api.post('/seating-rows/assign-taker', {
                    row_id: rowId,
                    taker_id: Number(bulkAssignData.value.takerId)
                })
            )
        );
        toast.showToast('Rows assigned to taker successfully', 'success');
        closeBulkAssignModal();
        await fetchSeatingRows();
        if (selectedRowId.value) {
            const updatedRow = seatingRows.value.find(r => r.id === selectedRowId.value);
            if (updatedRow) selectedRowId.value = updatedRow.id;
        }
    } catch (error) {
        console.error('Bulk assign taker error:', error);
        toast.showToast(error.response?.data?.message || 'Failed to assign some rows', 'error');
    } finally {
        isBulkAssigning.value = false;
    }
};



const createRow = async () => {
    if (!newRow.value.row_num) {
        toast.showToast('Row number is required', 'warning');
        return;
    }
    isCreatingRow.value = true;
    try {
        await api.post('/seating-rows', {
            row_num: Number(newRow.value.row_num),
            capacity: Number(newRow.value.capacity || 0)
        });
        toast.showToast('Row created successfully', 'success');
        newRow.value = { row_num: null, capacity: 0 };
        await fetchSeatingRows();
    } catch (error) {
        console.error('Create row error:', error);
        toast.showToast(error.response?.data?.message || 'Failed to create row', 'error');
    } finally {
        isCreatingRow.value = false;
    }
};

const editRow = (row) => {
    editingRow.value = { ...row };
    showEditModal.value = true;
};

const closeEditModal = () => {
    showEditModal.value = false;
    editingRow.value = { id: null, row_num: null, capacity: 0 };
};

const updateRow = async () => {
    if (!editingRow.value.row_num) return;
    isUpdatingRow.value = true;
    try {
        await api.put(`/seating-rows/${editingRow.value.id}`, {

            row_num: Number(editingRow.value.row_num),
            capacity: Number(editingRow.value.capacity || 0)
        });
        toast.showToast('Row updated successfully', 'success');
        closeEditModal();
        await fetchSeatingRows();
    } catch (error) {
        console.error('Update row error:', error);
        toast.showToast(error.response?.data?.message || 'Failed to update row', 'error');
    } finally {
        isUpdatingRow.value = false;
    }
};

const deleteRow = (row) => {
    rowToDelete.value = row;
    showDeleteModal.value = true;
};

const closeDeleteModal = () => {
    showDeleteModal.value = false;
    rowToDelete.value = null;
};

const confirmDeleteRow = async () => {
    if (!rowToDelete.value) return;
    
    isDeletingRow.value = true;
    try {
        await api.delete(`/seating-rows/${rowToDelete.value.id}`);
        toast.showToast('Row deleted successfully', 'success');
        if (selectedRowId.value === rowToDelete.value.id) {
            selectedRowId.value = null;
        }
        closeDeleteModal();
        await fetchSeatingRows();
    } catch (error) {
        console.error('Delete row error:', error);
        toast.showToast(error.response?.data?.message || 'Failed to delete row', 'error');
    } finally {
        isDeletingRow.value = false;
    }
};

const confirmDeleteAll = async () => {
    isDeletingAll.value = true;
    try {
        await api.post('/seating-rows/delete-all');
        toast.showToast('All seating rows deleted successfully', 'success');
        showDeleteAllModal.value = false;
        selectedRowId.value = null;
        await fetchSeatingRows();
    } catch (error) {
        console.error('Delete all rows error:', error);
        toast.showToast(error.response?.data?.message || 'Failed to delete all rows', 'error');
    } finally {
        isDeletingAll.value = false;
    }
};

const openAssignModal = (seatNum) => {
    seatToAssign.value = seatNum;
    userToAssign.value = '';
    showAssignModal.value = true;
};

const closeAssignModal = () => {
    showAssignModal.value = false;
    seatToAssign.value = null;
    userToAssign.value = '';
};

const confirmBulkCapacity = async () => {
    if (bulkCapacityValue.value === null || bulkCapacityValue.value < 0) return;
    
    isSettingBulkCapacity.value = true;
    try {
        await api.post('/seating-rows/bulk-capacity', { capacity: bulkCapacityValue.value });
        toast.showToast(`Set capacity to ${bulkCapacityValue.value} for all rows`, 'success');
        showBulkCapacityModal.value = false;
        bulkCapacityValue.value = null;
        await fetchSeatingRows();
    } catch (error) {
        console.error('Bulk set capacity error:', error);
        toast.showToast(error.response?.data?.message || 'Failed to set bulk capacity', 'error');
    } finally {
        isSettingBulkCapacity.value = false;
    }
};

const confirmAssignUser = async () => {
    if (!userToAssign.value || !selectedRow.value) return;
    
    isAssigning.value = true;
    try {
        await api.put(`/users/${userToAssign.value}/profile`, {
            seating_row_id: selectedRow.value.id,
            seat_number: seatToAssign.value
        });
        toast.showToast('User assigned successfully', 'success');
        closeAssignModal();
        await fetchAssignedUsers();
    } catch (error) {
        console.error('Assign user error:', error);
        toast.showToast(error.response?.data?.message || 'Failed to assign user', 'error');
    } finally {
        isAssigning.value = false;
    }
};

const unassignUser = async (user) => {
    if (!confirm('Are you sure you want to remove this user from the seat?')) return;
    try {
        await api.put(`/users/${user.id}/profile`, {
            seating_row_id: null,
            seat_number: null
        });
        toast.showToast('User removed from seat', 'success');
        await fetchAssignedUsers();
    } catch (error) {
        console.error('Unassign user error:', error);
        toast.showToast(error.response?.data?.message || 'Failed to remove user', 'error');
    }
};

const fetchAssignedUsers = async () => {
    try {
        const response = await api.get('/users?perPage=10000&includeTakers=true');
        assignedUsers.value = response.data?.data?.users || response.data?.data || response.data || [];
    } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.showToast('Failed to fetch users', 'error');
    }
};



const fetchSeatingRows = async () => {
    isLoadingRows.value = true;
    try {
        const response = await api.get('/seating-rows');
        seatingRows.value = response.data?.data || response.data || [];
        await fetchAssignedUsers();
    } catch (error) {
        console.error('Failed to fetch seating rows:', error);
        toast.showToast('Failed to fetch seating rows', 'error');
    } finally {
        isLoadingRows.value = false;
    }
};

const initializeRows = async () => {
    isInitializing.value = true;
    try {
        await api.post('/seating-rows/initialize', {});
        toast.showToast('17 seating rows initialized successfully', 'success');
        await new Promise(resolve => setTimeout(resolve, 1000));
        await fetchSeatingRows();
    } catch (error) {
        console.error('Initialize rows error:', error);
        toast.showToast(error.response?.data?.message || 'Failed to initialize rows', 'error');
    } finally {
        isInitializing.value = false;
    }
};

onMounted(() => {
    fetchSeatingRows();
});
</script>

<style scoped>
.seating-row-settings {
    scrollbar-color: color-mix(in srgb, var(--primary-color) 40%, transparent) transparent;
}
</style>
