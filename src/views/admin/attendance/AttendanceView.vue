<template>
    <div class="attendance-container d-flex flex-column gap-3">
        <div class="card p-3 mb-1 border-0 shadow-sm d-flex flex-row justify-content-between align-items-center" style="background-color: var(--surface-card);">
            <div>
                <h5 class="mb-0 fw-bold" style="color: var(--text-heading-color);">Attendance & Reports</h5>
            </div>
            <!-- Season Dropdown -->
            <select v-model="selectedSeasonId" @change="onSeasonChange" class="form-select" style="max-width: 200px;" v-if="seasons.length > 0">
                <option v-for="season in seasons" :key="season.id" :value="season.id">
                    {{ season.name }}
                </option>
            </select>
        </div>
        <Tabs v-model:value="activeTab" scrollable class="card gap-2 p-2" style="background-color: var(--surface-ground);">
            <div>
                <TabList>
                    <Tab value="attendance">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fas fa-calendar-check" style="color: var(--primary-color);"></i>
                            Master Attendance
                        </div>
                    </Tab>

                    <Tab value="report">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fas fa-history" style="color: var(--info-color, #0dcaf0);"></i>
                            Payment History
                        </div>
                    </Tab>
                    <Tab value="leave">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fas fa-envelope-open-text" style="color: var(--warning-color, #ffc107);"></i>
                            Leave Requests
                        </div>
                    </Tab>
                    <Tab value="takers">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fas fa-users-cog" style="color: var(--success-color, #198754);"></i>
                            Attendance Takers
                        </div>
                    </Tab>
                </TabList>
            </div>

            <TabPanels class="p-0 bg-transparent">
                <TabPanel value="attendance">
                    <!-- Filters Section -->
                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-body bg-white rounded-3">
                            <div class="row g-3">
                                <div class="col-md-3">
                                    <label class="form-label text-muted small fw-bold text-uppercase mb-1">Date</label>
                                    <input type="date" v-model="selectedDate" class="form-control" @change="fetchMonks">
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label text-muted small fw-bold text-uppercase mb-1">Search Monk</label>
                                    <div class="position-relative">
                                        <i class="fas fa-search position-absolute text-muted" style="left: 15px; top: 50%; transform: translateY(-50%);"></i>
                                        <input type="text" class="form-control ps-5" placeholder="Name or phone..." v-model="searchQuery">
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label text-muted small fw-bold text-uppercase mb-1">Filter by Row</label>
                                    <select v-model="selectedRowFilter" class="form-select">
                                        <option value="">All Rows</option>
                                        <option v-for="row in seatingRows" :key="row.id" :value="row.row_num">
                                            Row {{ row.row_num }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label text-muted small fw-bold text-uppercase mb-1">Status</label>
                                    <select v-model="selectedStatusFilter" class="form-select">
                                        <option value="">All Statuses</option>
                                        <option value="present">Present</option>
                                        <option value="absent">Absent</option>
                                        <option value="permission">On Leave</option>
                                    </select>
                                </div>
                                <div class="col-md-12 d-flex justify-content-end mt-3" v-if="!false">
                                    <BaseButton @click="saveAttendance" variant="primary" :isLoading="isSaving" class="px-4 fw-bold shadow-sm rounded-pill">
                                        <i class="fas fa-save me-2"></i> Save Changes
                                    </BaseButton>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Main Table -->
                    <div class="card border-0 shadow-sm">
                        <div class="card-body p-0">
                            <BaseTable 
                                :columns="colDefs" 
                                :rows="paginatedMonks" 
                                :loading="isLoadingMonks"
                                :show-index="true"
                                :total-records="filteredMonks.length"
                                v-model:page="page"
                                v-model:per-page="perPage"
                            >
                                <template #name="{ data: monk }">
                                    <div class="d-flex align-items-center gap-3 cursor-pointer" @click="cycleStatus(monk)">
                                        <div class="avatar rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm bg-gradient text-white" 
                                             :class="getStatusColor(monk.attendance?.status)"
                                             style="width: 40px; height: 40px; font-size: 1.1rem;">
                                            {{ monk.fullName ? monk.fullName.charAt(0).toUpperCase() : 'U' }}
                                        </div>
                                        <span class="fw-bold text-dark">{{ monk.fullName }}</span>
                                    </div>
                                </template>

                                <template #kudi="{ data: monk }">
                                    <span class="fw-medium">{{ monk.kudiNumber || '-' }}</span>
                                </template>

                                <template #phone="{ data: monk }">
                                    <span class="text-muted">{{ monk.phone || monk.chhaya_number || 'N/A' }}</span>
                                </template>

                                <template #row_number="{ data: monk }">
                                    <span class="fw-medium">{{ monk.rowNumber || '-' }}</span>
                                </template>

                                <template #seat_number="{ data: monk }">
                                    <span class="fw-medium">{{ monk.seatNumber || '-' }}</span>
                                </template>

                                <template #absents="{ data: monk }">
                                    <div class="d-flex justify-content-center w-100">
                                        <span class="fw-bold text-danger" style="font-size: 1rem;">
                                            {{ monk.netAbsents || 0 }}
                                        </span>
                                    </div>
                                </template>
                                


                                <template #role="{ data: monk }">
                                    <span class="badge rounded-pill border"
                                          :class="monk.role.toLowerCase().includes('bhikkhu') ? 'bg-info bg-opacity-10 text-info border-info' : 'bg-secondary bg-opacity-10 text-secondary border-secondary'">
                                        {{ monk.role }}
                                    </span>
                                </template>

                                <template #status="{ data: monk }">
                                    <div class="btn-group w-100 shadow-sm" role="group">
                                        <input type="radio" class="btn-check" :name="'status-'+monk.id" :id="'present-'+monk.id" autocomplete="off" :checked="!monk.attendance?.status || monk.attendance?.status === 'present'" @change="setStatus(monk, 'present')">
                                        <label class="btn btn-sm btn-outline-success py-1" :for="'present-'+monk.id"><i class="fas fa-check me-1"></i> Present</label>

                                        <input type="radio" class="btn-check" :name="'status-'+monk.id" :id="'absent-'+monk.id" autocomplete="off" :checked="monk.attendance?.status === 'absent'" @change="setStatus(monk, 'absent')">
                                        <label class="btn btn-sm btn-outline-danger py-1" :for="'absent-'+monk.id"><i class="fas fa-times me-1"></i> Absent</label>

                                        <input type="radio" class="btn-check" :name="'status-'+monk.id" :id="'permission-'+monk.id" autocomplete="off" :checked="monk.attendance?.status === 'permission'" @change="setStatus(monk, 'permission')">
                                        <label class="btn btn-sm btn-outline-warning py-1" :for="'permission-'+monk.id"><i class="fas fa-bed me-1"></i> Leave</label>
                                    </div>
                                </template>

                                <template #notes="{ data: monk }">
                                    <input type="text" class="form-control form-control-sm bg-light border-0" placeholder="Add note..." v-model="monk.attendanceNotes">
                                </template>
                            </BaseTable>
                        </div>
                    </div>
                </TabPanel>


                <!-- Report Tab -->
                <TabPanel value="report">
                    <AdminFineReportView v-if="activeTab === 'report'" :isComponent="true" :seasonId="selectedSeasonId" />
                </TabPanel>

                <!-- Leave Requests Tab -->
                <TabPanel value="leave">
                    <AdminLeaveRequestsView v-if="activeTab === 'leave'" :seasonId="selectedSeasonId" />
                </TabPanel>

                <!-- Takers Tab -->
                <TabPanel value="takers">
                    <AdminTakersTableView v-if="activeTab === 'takers'" />
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>

<script setup>
import { Tab, TabList, TabPanels, TabPanel, Tabs } from 'primevue';
import { ref, computed, watch, onMounted } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import AdminFineReportView from '@/views/admin/fines/AdminFineReportView.vue';
import AdminLeaveRequestsView from './AdminLeaveRequestsView.vue';
import AdminTakersTableView from './AdminTakersTableView.vue';
import { useAuthStore } from '@/stores/auth';

const toast = useToastStore();
const authStore = useAuthStore();

// State
// Helper to get local date string YYYY-MM-DD
const getLocalDateString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

const activeTab = ref('attendance');
const page = ref(1);
const perPage = ref(10);
const selectedDate = ref(getLocalDateString());
const searchQuery = ref('');
const selectedRowFilter = ref('');
const selectedStatusFilter = ref('');

// Reset page on filters change
const resetPage = () => {
    page.value = 1;
};

watch(searchQuery, resetPage);
watch(selectedRowFilter, resetPage);
watch(selectedStatusFilter, resetPage);
watch(selectedDate, resetPage);

const monks = ref([]);
const seatingRows = ref([]);

const seasons = ref([]);
const selectedSeasonId = ref(null);

const isLoadingMonks = ref(false);
const isSaving = ref(false);

const paginatedMonks = computed(() => {
    const start = (page.value - 1) * perPage.value;
    const end = start + perPage.value;
    return filteredMonks.value.slice(start, end);
});

const colDefs = computed(() => {
    const cols = [
        { field: 'name', header: 'Monk Name' },
        { field: 'role', header: 'Role' },
        { field: 'kudi', header: 'Kudi', class: 'text-center' },
        { field: 'phone', header: 'Phone' },
        { field: 'row_number', header: 'Row' },
        { field: 'seat_number', header: 'Seat' },
        { field: 'absents', header: 'Absents', class: 'text-center' }
    ];
    
    return cols;
});

const filteredMonks = computed(() => {
    return monks.value.filter(monk => {
        // Filter by Role: only show Monk, Bhikkhu, and Mekudi (Admin)
        const roleStr = (monk.role || '').toLowerCase();
        const isTargetRole = ['monk', 'bhikkhu', 'mekudi', 'admin'].some(r => roleStr === r || (roleStr.includes(r) && !roleStr.includes('super')));
        if (!isTargetRole) {
            return false;
        }

        // Filter: only show monks with netAbsents >= 9
        if ((monk.netAbsents || 0) < 9) {
            return false;
        }

        // Search filter
        const query = searchQuery.value.toLowerCase();
        const matchesSearch = !query || 
            (monk.fullName && monk.fullName.toLowerCase().includes(query)) ||
            (monk.phone && monk.phone.includes(query)) ||
            (monk.chhaya_number && monk.chhaya_number.includes(query));
            
        // Row filter
        const matchesRow = !selectedRowFilter.value || monk.rowNumber === selectedRowFilter.value;
        
        // Status filter
        const status = monk.attendance?.status || 'present';
        const matchesStatus = !selectedStatusFilter.value || status === selectedStatusFilter.value;
        
        return matchesSearch && matchesRow && matchesStatus;
    });
});

const getStatusColor = (status) => {
    if (status === 'absent') return 'bg-danger';
    if (status === 'permission') return 'bg-warning text-dark';
    return 'bg-success';
};

const setStatus = (monk, status) => {
    if (!monk.attendance) {
        monk.attendance = { status, notes: monk.attendanceNotes || '' };
    } else {
        monk.attendance.status = status;
    }
};

const cycleStatus = (monk) => {
    const current = monk.attendance?.status || 'present';
    if (current === 'present') {
        setStatus(monk, 'absent');
    } else if (current === 'absent') {
        setStatus(monk, 'permission');
    } else {
        setStatus(monk, 'present');
    }
};

const fetchSeatingRows = async () => {
    try {
        const response = await api.get('/seating-rows');
        seatingRows.value = response.data?.data || response.data || [];
    } catch (error) {
        console.error('Failed to fetch seating rows:', error);
    }
};

const fetchSeasons = async () => {
    try {
        const res = await api.get('/retreat-events');
        seasons.value = res.data.data;
        if (seasons.value.length > 0) {
            const active = seasons.value.find(s => s.is_active);
            selectedSeasonId.value = active ? active.id : seasons.value[0].id;
        }
    } catch (error) {
        console.error('Fetch seasons error:', error);
    }
};

const onSeasonChange = () => {
    fetchMonks();
};

const fetchMonks = async () => {
    if (!selectedDate.value) return;
    
    isLoadingMonks.value = true;
    try {
        const params = { date: selectedDate.value };
        if (selectedSeasonId.value) {
            params.retreat_event_id = selectedSeasonId.value;
        }
        const res = await api.get('/attendances/monks-by-date', { params });
        
        const data = res.data?.data || res.data || [];
        
        monks.value = data.map(monk => ({
            ...monk,
            attendance: monk.attendance || { status: 'present', notes: '' },
            attendanceNotes: monk.attendance?.notes || '',
        }));
    } catch (error) {
        console.error('Failed to fetch monks:', error);
        toast.showToast('Failed to fetch monks', 'error');
    } finally {
        isLoadingMonks.value = false;
    }
};

const saveAttendance = async () => {
    if (!selectedDate.value || monks.value.length === 0) return;
    
    isSaving.value = true;
    try {
        const attendances = monks.value.map(monk => ({
            user_id: monk.id,
            kut_id: monk.kut_id || monk.UserProfile?.kut_id || null,
            date: selectedDate.value,
            status: monk.attendance?.status || 'present',
            notes: monk.attendanceNotes || null,
            seating_row_id: monk.profile?.seatingRow?.id || null,
            seat_number: monk.seatNumber || null,
            retreat_event_id: selectedSeasonId.value
        }));
        
        await api.post('/attendances/bulk', { attendances });
        toast.showToast('Attendance saved successfully', 'success');
        
    } catch (error) {
        console.error('Save attendance error:', error);
        toast.showToast(error.response?.data?.message || 'Failed to save attendance', 'error');
    } finally {
        isSaving.value = false;
    }
};

onMounted(async () => {
    await fetchSeasons();
    await fetchSeatingRows();
    fetchMonks();
});
</script>

<style scoped>
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
</style>
