<template>
    <div class="card" style="background-color: var(--surface-ground);">
        <!-- Top Toolbar -->
        <div class="d-flex flex-column gap-3 w-100 mb-3 mx-0">
            <div class="d-flex justify-content-between align-items-center px-2">
                <h6 class="mb-0 text-dark fw-bold mb-0">Attendance Row</h6>
                <div style="width: 200px;" class="date-picker-wrapper">
                    <BaseDatePicker 
                        v-model="selectedDate" 
                        placeholder="Select Date"
                        :maxDate="new Date()"
                    />
                </div>
            </div>
            
            <div class="w-100" style="min-width: 0;">
                <div class="row-pills-container d-flex flex-nowrap gap-2 pb-2 px-2" style="overflow-x: auto;">
                    <button v-for="(row, idx) in seatingRows" :key="idx" 
                        @click="selectRow(row)"
                        class="btn rounded-pill px-3 border flex-shrink-0 d-flex align-items-center btn-sm"
                        :class="activeRow?.id === row.id ? 'btn-primary' : 'btn-light'"
                    >
                        <span>Row {{ row.row_num }}</span>
                        <span class="badge rounded-pill ms-1" :class="activeRow?.id === row.id ? 'bg-white text-primary' : 'bg-secondary bg-opacity-25 text-dark'">
                            {{ getMonksCountByRow(row.id) }}
                        </span>
                        <i v-show="isRowConfirmedById(row.id)" class="fas fa-check-circle ms-1" :class="activeRow?.id === row.id ? 'text-white' : 'text-success'"></i>
                    </button>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div v-show="activeRow" class="card-header bg-white border-bottom p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div class="fw-bold text-dark">
                    Row {{ activeRow?.row_num }}
                </div>
                <div class="d-flex flex-wrap align-items-center gap-3">
                    <div class="d-flex align-items-center gap-1">
                        <span class="fw-bold text-success">{{ activeRowMonks.length - absentCount - permissionCount }}</span>
                        <span class="text-muted small text-uppercase" style="font-size: 0.75rem;">Present</span>
                    </div>
                    <div class="d-flex align-items-center gap-1 border-start ps-3">
                        <span class="fw-bold text-danger">{{ absentCount }}</span>
                        <span class="text-muted small text-uppercase" style="font-size: 0.75rem;">Absent</span>
                    </div>
                    <div class="d-flex align-items-center gap-1 border-start ps-3">
                        <span class="fw-bold text-warning">{{ permissionCount }}</span>
                        <span class="text-muted small text-uppercase" style="font-size: 0.75rem;">Leave</span>
                    </div>
                </div>
            </div>

            <div class="card-body p-0 position-relative">
                <div v-show="!activeRow" class="text-center py-5 text-muted">
                    <p class="mb-0">Please select a row from the list above.</p>
                </div>
                
                <div v-show="activeRow && isLoadingMonks" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                </div>
                
                <div v-show="activeRow && !isLoadingMonks && activeRowMonks.length === 0" class="text-center py-5 text-muted">
                    <p class="mb-0">No monks assigned to this row.</p>
                </div>
                
                <div v-show="activeRow && !isLoadingMonks && activeRowMonks.length > 0">
                    <BaseTable 
                        :columns="colDefs" 
                        :rows="activeRowMonks" 
                        :selectable="true"
                        v-model:selection="selectedAbsentMonks"
                    >
                        <template #seatNumber="{ data: monk }">
                            <div class="text-center text-muted">
                                {{ monk.seatNumber || '-' }}
                            </div>
                        </template>
                        
                        <template #name="{ data: monk }">
                            <div class="d-flex align-items-center gap-3 py-1 cursor-pointer w-100" @click="toggleSelection(monk)">
                                <div class="avatar bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" 
                                     style="width: 35px; height: 35px; font-size: 0.9rem; flex-shrink: 0;">
                                    {{ monk.fullName.charAt(0).toUpperCase() }}
                                </div>
                                <div class="flex-grow-1" style="min-width: 0;">
                                    <div class="fw-bold text-dark d-flex align-items-center gap-2" style="font-size: 0.95rem;">
                                        {{ monk.fullName }}
                                    </div>
                                    <div class="small text-muted" style="font-size: 0.8rem;">
                                        {{ monk.chhaya_number || monk.phone || 'No Phone' }}
                                    </div>
                                </div>
                            </div>
                        </template>

                        <template #status="{ data: monk }">
                            <div class="text-end">
                                <span class="badge bg-opacity-10" :class="[
                                    monk.attendance?.status === 'permission' ? 'bg-warning text-dark' :
                                    (monk.attendance?.status === 'absent' || selectedAbsentMonks.some(m => m.id === monk.id)) ? 'bg-danger text-danger' :
                                    'bg-success text-success'
                                ]">
                                    {{ monk.attendance?.status === 'permission' ? 'Leave' :
                                       (monk.attendance?.status === 'absent' || selectedAbsentMonks.some(m => m.id === monk.id)) ? 'Absent' :
                                       'Present'
                                    }}
                                </span>
                            </div>
                        </template>
                    </BaseTable>
                    
                    <div class="card-footer bg-white p-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 border-top">
                        <div v-show="isRowConfirmed" class="text-success fw-bold d-flex align-items-center justify-content-center justify-content-sm-start gap-2">
                            <i class="fas fa-check-circle"></i>
                            <span>Attendance Confirmed</span>
                        </div>
                        <div v-show="!isRowConfirmed" class="d-none d-sm-block"></div>
                        <BaseButton 
                            :variant="isRowConfirmed ? 'outline-primary' : 'primary'" 
                            class="w-100 w-sm-auto"
                            @click="confirmAttendance" 
                            :isLoading="isSaving"
                        >
                            {{ isRowConfirmed ? 'Update Attendance' : 'Confirm Attendance' }}
                        </BaseButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseDatePicker from '@/components/base/BaseDatePicker.vue';

const toast = useToastStore();
const authStore = useAuthStore();

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

const selectedDate = ref(getLocalDateString());

watch(selectedDate, () => {
    if (selectedDate.value) {
        fetchData();
    }
});
const seatingRows = ref([]);
const allMonks = ref([]);
const activeRow = ref(null);
const selectedAbsentMonks = ref([]);
const isLoadingRows = ref(false);
const isLoadingMonks = ref(false);
const isSaving = ref(false);

const colDefs = computed(() => {
    return [
        { field: 'seatNumber', header: 'Seat', sortable: true, class: 'text-center', style: 'width: 80px;' },
        { field: 'name', header: 'Monk Name', sortable: false },
        { field: 'status', header: '', sortable: false, class: 'text-end', style: 'width: 150px;' },
    ];
});

const activeRowMonks = computed(() => {
    if (!activeRow.value) return [];
    return allMonks.value.filter(m => m.rowNumber === activeRow.value.row_num || m.seating_row_id === activeRow.value.id);
});

const getMonksCountByRow = (rowId) => {
    const row = seatingRows.value.find(r => r.id === rowId);
    if (!row) return 0;
    return allMonks.value.filter(m => m.rowNumber === row.row_num || m.seating_row_id === row.id).length;
};

const isRowConfirmedById = (rowId) => {
    const row = seatingRows.value.find(r => r.id === rowId);
    if (!row) return false;
    const monks = allMonks.value.filter(m => m.rowNumber === row.row_num || m.seating_row_id === row.id);
    return monks.length > 0 && monks.some(m => m.attendance?.isSubmitted);
};

const isRowConfirmed = computed(() => {
    if (!activeRow.value || activeRowMonks.value.length === 0) return false;
    return activeRowMonks.value.some(m => m.attendance?.isSubmitted);
});

const absentCount = computed(() => activeRowMonks.value.filter(m => isAbsent(m)).length);
const permissionCount = computed(() => activeRowMonks.value.filter(m => isPermission(m)).length);

const isAbsent = (monk) => monk.attendance?.status === 'absent';
const isPermission = (monk) => monk.attendance?.status === 'permission';

const setStatus = (monk, status) => {
    if (!monk.attendance) {
        monk.attendance = { status, notes: monk.attendanceNotes || '' };
    } else {
        monk.attendance.status = status;
    }
};

let isSyncingSelection = false;

const toggleSelection = (monk) => {
    if (monk.attendance?.status === 'permission') {
        return;
    }
    const isSelected = selectedAbsentMonks.value.some(s => s.id === monk.id);
    if (isSelected) {
        selectedAbsentMonks.value = selectedAbsentMonks.value.filter(s => s.id !== monk.id);
    } else {
        selectedAbsentMonks.value = [...selectedAbsentMonks.value, monk];
    }
};

watch(() => activeRowMonks.value, (newMonks) => {
    isSyncingSelection = true;
    selectedAbsentMonks.value = newMonks.filter(m => m.attendance?.status === 'absent');
    setTimeout(() => isSyncingSelection = false, 0);
}, { immediate: true });

watch(() => selectedAbsentMonks.value, (newSelection) => {
    if (isSyncingSelection) return;
    activeRowMonks.value.forEach(monk => {
        // Do not override if the monk has an approved leave
        if (monk.attendance?.status === 'permission') return;
        
        const isSelected = newSelection.some(s => s.id === monk.id);
        setStatus(monk, isSelected ? 'absent' : 'present');
    });
}, { deep: true });

const fetchData = async () => {
    isLoadingRows.value = true;
    isLoadingMonks.value = true;
    try {
        const [rowsRes, monksRes] = await Promise.all([
            api.get('/seating-rows'),
            api.get('/attendances/monks-by-date', { params: { date: selectedDate.value } })
        ]);
        
        const rawRows = rowsRes.data?.data || rowsRes.data || [];
        
        // Filter rows for Taker/Admin role
        if (!false) {
            seatingRows.value = rawRows.filter(r => r.assigned_taker_id === authStore.user.id);
        } else {
            seatingRows.value = rawRows;
        }

        const rawMonks = monksRes.data?.data || monksRes.data || [];
        
        allMonks.value = rawMonks.map(monk => ({
            ...monk,
            attendance: monk.attendance || { status: 'present', isSubmitted: false },
            attendanceNotes: monk.attendance?.notes || '',
        }));
        
        if (activeRow.value) {
            const stillExists = seatingRows.value.find(r => r.id === activeRow.value.id);
            if (!stillExists) {
                activeRow.value = null;
            }
        } else if (seatingRows.value.length > 0) {
            activeRow.value = seatingRows.value[0];
        }
        
    } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.showToast('Failed to fetch data', 'error');
    } finally {
        isLoadingRows.value = false;
        isLoadingMonks.value = false;
    }
};

const selectRow = (row) => {
    activeRow.value = row;
};

const confirmAttendance = async () => {
    if (!activeRow.value || activeRowMonks.value.length === 0) return;
    
    isSaving.value = true;
    try {
        const attendances = activeRowMonks.value.map(monk => ({
            user_id: monk.id,
            kut_id: monk.kut_id || monk.profile?.kut_id || null,
            date: selectedDate.value,
            status: monk.attendance?.status || 'present',
            notes: monk.attendanceNotes || null,
            seating_row_id: activeRow.value.id,
            seat_number: monk.seatNumber
        }));
        
        await api.post('/attendances/bulk', { attendances });
        toast.showToast('Attendance confirmed successfully', 'success');
        
        // Refresh to get latest state
        await fetchData();
    } catch (error) {
        console.error('Failed to save attendance:', error);
        toast.showToast('Failed to save attendance', 'error');
    } finally {
        isSaving.value = false;
    }
};

onMounted(() => {
    fetchData();
});
</script>

<style scoped>
.row-pills-container {
    overflow-x: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
}
.row-pills-container::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
}
.pill-btn:not(.btn-primary):hover {
    background-color: var(--bs-light) !important;
    border-color: var(--bs-border-color) !important;
    color: var(--bs-dark) !important;
}
.cursor-pointer {
    cursor: pointer;
}
.btn-group .btn {
    padding: 0.35rem 0.75rem;
}
.btn-check:checked + .btn-outline-success {
    background-color: var(--bs-success);
    color: white;
}
.btn-check:checked + .btn-outline-danger {
    background-color: var(--bs-danger);
    color: white;
}
.btn-check:checked + .btn-outline-warning {
    background-color: var(--bs-warning);
    color: var(--bs-dark);
}
.date-picker-wrapper {
    width: 100%;
}
@media (min-width: 768px) {
    .date-picker-wrapper {
        width: auto;
    }
}
</style>
