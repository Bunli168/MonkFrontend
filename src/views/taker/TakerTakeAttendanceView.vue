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

            <!-- QR Session Panel -->
            <div v-if="activeRow" class="card mx-2 border-0 shadow-sm mb-2 bg-primary bg-opacity-10">
                <div class="card-body p-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <div>
                        <h6 class="fw-bold mb-1 text-primary">Self-Scan Attendance</h6>
                        <p class="text-muted small mb-0">Allow monks to scan a QR code to mark themselves present.</p>
                    </div>
                    
                    <div v-if="qrSession.active" class="d-flex align-items-center gap-2 flex-wrap">
                        <div class="fw-bold text-success me-auto"><i class="fas fa-circle-notch fa-spin me-2"></i>Active</div>
                        <button class="btn btn-primary btn-sm px-3 fw-bold text-nowrap" @click="showQRModal = true">
                            <i class="fas fa-expand me-1"></i> Show QR
                        </button>
                        <button class="btn btn-outline-danger btn-sm px-3 text-nowrap" @click="stopQRSession">Stop Session</button>
                    </div>
                    <div v-else class="d-flex align-items-center gap-2 flex-wrap">
                        <button class="btn btn-primary btn-sm px-3 fw-bold text-nowrap" @click="startQRSession">
                            <i class="fas fa-qrcode me-2"></i> Start Session
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="w-100" style="min-width: 0;">
                <div class="row-pills-container d-flex flex-nowrap gap-2 pb-2 px-2" style="overflow-x: auto;">
                    <button v-for="(row, idx) in seatingRows" :key="idx" 
                        @click="selectRow(row)"
                        class="btn px-3 flex-shrink-0 d-flex align-items-center btn-sm row-btn"
                        :class="activeRow?.id === row.id ? 'btn-primary text-white border-primary' : 'btn-outline-secondary text-body'"
                    >
                        <span>Row {{ row.row_num }}</span>
                        <span class="badge rounded-pill ms-1" :class="activeRow?.id === row.id ? 'bg-white text-primary' : 'bg-secondary bg-opacity-25 text-body'">
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
                    <!-- Desktop Table View -->
                    <div class="d-none d-md-block">
                        <BaseTable 
                        :columns="colDefs" 
                        :rows="activeRowMonks" 
                        :selectable="true" selectionHeader="Absent"
                        :hideIndexOnMobile="true"
                        :stackOnMobile="false"
                        v-model:selection="selectedAbsentMonks"
                    >
                        <template #seatNumber="{ data: monk }">
                            <div class="text-center text-muted">
                                {{ monk.seatNumber || '-' }}
                            </div>
                        </template>
                        
                        <template #name="{ data: monk }">
                            <div class="d-flex align-items-center gap-3 py-1 cursor-pointer w-100" @click="toggleSelection(monk)">
                                <div class="avatar bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold overflow-hidden" 
                                     style="width: 35px; height: 35px; font-size: 0.9rem; flex-shrink: 0;">
                                    <img v-if="monk.profile?.avatar_url || monk.profile?.avatarUrl" :src="$authImg(monk.profile?.avatar_url || monk.profile?.avatarUrl)" class="w-100 h-100 object-fit-cover" />
                                    <img v-else src="/app-logo.png" class="w-100 h-100 object-fit-cover bg-white" />
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
                                <span class="badge border px-2 py-1" :class="[
                                    monk.attendance?.status === 'permission' ? 'bg-warning text-dark border-warning' :
                                    (monk.attendanceNotes === 'Scanned QR' || monk.attendance?.status === 'present') ? 'bg-success text-white border-success' :
                                    (monk.attendance?.status === 'absent' || selectedAbsentMonks.some(m => m.id === monk.id)) ? 'bg-danger text-white border-danger' :
                                    'bg-light text-success border-success'
                                ]">
                                    <i v-if="monk.attendanceNotes === 'Scanned QR'" class="fas fa-qrcode me-1"></i>
                                    {{ monk.attendance?.status === 'permission' ? 'Leave' :
                                       monk.attendanceNotes === 'Scanned QR' ? 'Scanned' :
                                       monk.attendance?.status === 'present' ? 'Present' :
                                       (monk.attendance?.status === 'absent' || selectedAbsentMonks.some(m => m.id === monk.id)) ? 'Absent' :
                                       'Present'
                                    }}
                                </span>
                            </div>
                        </template>
                    </BaseTable>
                    </div>

                    <!-- Mobile Notification List View -->
                    <div class="d-md-none p-2 p-sm-3 d-flex flex-column gap-2" style="background-color: var(--body-bg-color);">
                        <div v-for="monk in activeRowMonks" :key="monk.id"
                             class="notification-card bg-white p-3 d-flex align-items-center gap-3 position-relative"
                             :class="{ 'is-absent': (selectedAbsentMonks.some(m => m.id === monk.id) || monk.attendance?.status === 'absent') && monk.attendance?.status !== 'present' && monk.attendanceNotes !== 'Scanned QR' }"
                             @click="toggleSelection(monk)">
                            
                            <div class="avatar bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm overflow-hidden" 
                                 style="width: 48px; height: 48px; font-size: 1.2rem; flex-shrink: 0;">
                                <img v-if="monk.profile?.avatar_url || monk.profile?.avatarUrl" :src="$authImg(monk.profile?.avatar_url || monk.profile?.avatarUrl)" class="w-100 h-100 object-fit-cover" />
                                <img v-else src="/app-logo.png" class="w-100 h-100 object-fit-cover bg-white" />
                            </div>
                            
                            <div class="flex-grow-1" style="min-width: 0;">
                                <div class="fw-bold text-dark text-truncate mb-1" style="font-size: 1rem;">
                                    {{ monk.fullName }}
                                </div>
                                <div class="d-flex align-items-center gap-2">
                                    <span class="badge bg-light text-dark border" style="font-size: 0.75rem; font-weight: 500;">Row {{ activeRow?.row_num || '-' }}</span>
                                    <span class="badge bg-light text-dark border" style="font-size: 0.75rem; font-weight: 500;">Seat {{ monk.seatNumber || '-' }}</span>
                                </div>
                            </div>
                            
                            <div class="d-flex align-items-center ms-2">
                                <div v-if="monk.attendance?.status === 'permission'" class="badge bg-warning text-dark px-2 py-1">Leave</div>
                                <div v-else-if="monk.attendanceNotes === 'Scanned QR' || monk.attendance?.status === 'present'" class="badge bg-success px-2 py-1">
                                    <i v-if="monk.attendanceNotes === 'Scanned QR'" class="fas fa-qrcode me-1"></i>
                                    {{ monk.attendanceNotes === 'Scanned QR' ? 'Scanned' : 'Present' }}
                                </div>
                                <div v-else class="form-check m-0 custom-check">
                                    <input class="form-check-input" type="checkbox" style="width: 1.5rem; height: 1.5rem; cursor: pointer;"
                                           :checked="selectedAbsentMonks.some(m => m.id === monk.id)"
                                           @click.stop="toggleSelection(monk)">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-footer bg-white p-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 border-top">
                        <div v-show="isRowConfirmed" class="text-success fw-bold d-flex align-items-center justify-content-center justify-content-sm-start gap-2">
                            <i class="fas fa-check-circle"></i>
                            <span>Attendance Confirmed</span>
                        </div>
                        <div v-show="!isRowConfirmed" class="d-none d-sm-block"></div>
                        <BaseButton 
                            :variant="isRowConfirmed ? 'outline-primary' : 'primary'" 
                            class="px-5"
                            @click="confirmAttendance" 
                            :isLoading="isSaving"
                        >
                            {{ isRowConfirmed ? 'Update Attendance' : 'Confirm Attendance' }}
                        </BaseButton>
                    </div>
                </div>
            </div>
        </div>
        
        <BaseModal v-model="showQRModal" title="Self-Scan Attendance" size="lg" @close="onModalClose">
            <div v-if="qrSession.active" class="d-flex flex-column align-items-center justify-content-center py-2 py-md-4 px-2">
                <p class="text-muted mb-3 mb-md-4 fs-6 fs-md-5 text-center">Ask monks to point their camera at this QR code.</p>
                <div class="bg-white p-3 p-md-4 rounded-4 shadow-sm border mb-4 d-flex justify-content-center align-items-center w-100 mx-auto" style="max-width: 400px; aspect-ratio: 1;">
                    <QrcodeVue :value="JSON.stringify({ token: qrSession.token, seating_row_id: activeRow.id, date: selectedDate })" :size="400" level="H" style="width: 100%; height: auto; max-width: 350px;" />
                </div>
                <div class="h3 fw-bold text-success mb-4 text-center"><i class="fas fa-circle-notch fa-spin me-2"></i> Scanning Active</div>
                <button class="btn btn-outline-danger btn-lg rounded-pill w-100 mx-auto" style="max-width: 300px;" @click="stopQRSession">
                    Stop Session
                </button>
            </div>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseDatePicker from '@/components/base/BaseDatePicker.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import QrcodeVue from 'qrcode.vue';
import { socket } from '@/utils/socket';

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
        { field: 'status', header: '', sortable: false, class: 'text-end d-none d-md-table-cell', headerClass: 'd-none d-md-table-cell', style: 'width: 150px;' },
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
    if (monk.attendance?.status === 'permission' || monk.attendanceNotes === 'Scanned QR') {
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
    // Only select monks whose attendance is explicitly saved as 'absent' in the database
    selectedAbsentMonks.value = newMonks.filter(m => m.attendance?.status === 'absent');
    setTimeout(() => isSyncingSelection = false, 0);
}, { immediate: true });

watch(() => selectedAbsentMonks.value, (newSelection) => {
    if (isSyncingSelection) return;

    const permissionMonksInSelection = newSelection.filter(s => s.attendance?.status === 'permission' || s.attendanceNotes === 'Scanned QR');
    if (permissionMonksInSelection.length > 0) {
        isSyncingSelection = true;
        selectedAbsentMonks.value = newSelection.filter(s => s.attendance?.status !== 'permission' && s.attendanceNotes !== 'Scanned QR');
        setTimeout(() => isSyncingSelection = false, 0);
        return;
    }

    activeRowMonks.value.forEach(monk => {
        if (monk.attendance?.status === 'permission' || monk.attendanceNotes === 'Scanned QR') return;
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
        
        allMonks.value = rawMonks.map(monk => {
            const hasAtt = !!monk.attendance;
            const attStatus = hasAtt ? monk.attendance.status : 'absent';
            const attNotes = monk.attendance?.notes || '';
            return {
                ...monk,
                attendanceNotes: attNotes,
                attendance: {
                    status: attNotes === 'Scanned QR' ? 'present' : attStatus,
                    isSubmitted: hasAtt
                }
            };
        });
        
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
        const attendances = activeRowMonks.value.map(monk => {
            let finalStatus = monk.attendance?.status || 'present';
            let finalNotes = monk.attendanceNotes || null;

            if (monk.attendanceNotes === 'Scanned QR') {
                finalStatus = 'present';
                finalNotes = 'Scanned QR';
            } else if (monk.attendance?.status === 'permission') {
                finalStatus = 'permission';
            }

            return {
                user_id: monk.id,
                kut_id: monk.kut_id || monk.profile?.kut_id || null,
                date: selectedDate.value,
                status: finalStatus,
                notes: finalNotes,
                seating_row_id: activeRow.value.id,
                seat_number: monk.seatNumber
            };
        });
        
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

// --- QR Session Logic ---
const qrSession = ref({ active: false, token: null, expiresAt: null });
const showQRModal = ref(false);

const checkQRSession = async () => {
    if (!activeRow.value) return;
    try {
        const res = await api.get('/attendances/session/check', { params: { seating_row_id: activeRow.value.id } });
        if (res.data.success && res.data.data.active) {
            qrSession.value = { ...res.data.data, active: true };
        } else {
            qrSession.value.active = false;
        }
    } catch (e) {
        console.error('Check QR Error:', e);
    }
};

const startQRSession = async () => {
    if (!activeRow.value) return;
    try {
        const dateStr = typeof selectedDate.value === 'string' 
            ? selectedDate.value 
            : new Date(selectedDate.value).toISOString().split('T')[0];

        const res = await api.post('/attendances/session/toggle', { 
            seating_row_id: activeRow.value.id, 
            date: dateStr, 
            action: 'start',
            duration_minutes: 1440 // Never expires essentially
        });
        
        if (res.data.success) {
            qrSession.value = { active: true, ...res.data.data };
            showQRModal.value = true;
            toast.showToast('QR Session started', 'success');
        }
    } catch (e) {
        console.error('Start QR Session Error:', e);
        const errMsg = e.response?.data?.message || e.message || 'Failed to start QR session';
        toast.showToast(errMsg, 'error');
    }
};

const stopQRSession = async () => {
    if (!activeRow.value) return;
    try {
        await api.post('/attendances/session/toggle', { 
            seating_row_id: activeRow.value.id, 
            date: selectedDate.value, 
            action: 'stop'
        });
        qrSession.value.active = false;
        showQRModal.value = false;
        toast.showToast('QR Session stopped', 'info');
        
        // Refresh to show exact real-time attendance
        await fetchData();
    } catch (e) {
        toast.showToast('Failed to stop QR session', 'error');
    }
};

const onModalClose = () => {
    showQRModal.value = false;
};

// Real-time socket updates for scanning
onMounted(() => {
    fetchData();
    socket.on('attendance_updated', (data) => {
        if (String(data.seating_row_id) === String(activeRow.value?.id) && data.date === selectedDate.value) {
            fetchData();
        }
    });
});

onUnmounted(() => {
    if (socket) {
        socket.off('attendance_updated');
    }
});

watch(activeRow, () => {
    checkQRSession();
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

/* iOS Notification Style Card */
.notification-card {
    border-radius: 16px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.04);
    transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.2s ease;
    border: 1px solid rgba(0,0,0,0.04);
    cursor: pointer;
}
.notification-card:active {
    transform: scale(0.98);
    background-color: var(--surface-ground) !important;
}
.notification-card.is-absent {
    background-color: #fff8f8 !important;
    border-color: #ffcccc;
}
.custom-check .form-check-input {
    border-color: #cbd5e1;
    border-radius: 6px;
}
.custom-check .form-check-input:checked {
    background-color: var(--bs-danger);
    border-color: var(--bs-danger);
}

</style>
