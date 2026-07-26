<template>
    <div class="super-admin-attendance-container d-flex flex-column gap-3">
        <div class="card p-3 mb-1 border-0 shadow-sm d-flex flex-row justify-content-between align-items-center" style="background-color: var(--surface-card);">
            <div>
                <h5 class="mb-0 fw-bold" style="color: var(--text-heading-color);">Attendance Overview</h5>
            </div>
            <!-- Season Dropdown -->
            <select v-model="selectedSeasonId" @change="onSeasonChange" class="form-select" style="max-width: 200px;" v-if="seasons.length > 0">
                <option v-for="season in seasons" :key="season.id" :value="season.id">
                    {{ season.name }}
                </option>
            </select>
        </div>

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
                </div>
            </div>
        </div>

        <!-- Main Table -->
        <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
                <BaseTable 
                    :columns="colDefs" 
                    :rows="filteredMonks" 
                    :loading="isLoadingMonks"
                    :show-index="true"
                    :per-page="50"
                >
                    <template #name="{ data: monk }">
                        <div class="d-flex align-items-center gap-3">
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

                    <template #role="{ data: monk }">
                        <span class="badge rounded-pill border"
                              :class="monk.role.toLowerCase().includes('bhikkhu') ? 'bg-info bg-opacity-10 text-info border-info' : 'bg-secondary bg-opacity-10 text-secondary border-secondary'">
                            {{ monk.role }}
                        </span>
                    </template>
                    
                    <template #status="{ data: monk }">
                        <div class="text-center w-100">
                            <span class="badge rounded-pill px-3 py-2 fw-bold" :class="getStatusColor(monk.attendance?.status || 'present')">
                                {{ (monk.attendance?.status || 'present').toUpperCase() }}
                            </span>
                        </div>
                    </template>

                    <template #notes="{ data: monk }">
                        <span class="text-muted">{{ monk.attendanceNotes || '-' }}</span>
                    </template>
                </BaseTable>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import api from '@/api/api';
import BaseTable from '@/components/base/BaseTable.vue';

const authStore = useAuthStore();
const toastStore = useToastStore();

const monks = ref([]);
const isLoadingMonks = ref(false);
const searchQuery = ref('');
const selectedRowFilter = ref('');
const selectedStatusFilter = ref('');
const seatingRows = ref([]);
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const seasons = ref([]);
const selectedSeasonId = ref(null);

const colDefs = computed(() => {
    const cols = [
        { field: 'name', header: 'Monk Name' },
        { field: 'role', header: 'Role' },
        { field: 'kudi', header: 'Kudi', class: 'text-center' },
        { field: 'phone', header: 'Phone' }
    ];
    
    cols.push(
        { field: 'row_number', header: 'Row' },
        { field: 'seat_number', header: 'Seat' },
        { field: 'status', header: 'Attendance', sortable: false, class: 'text-center', style: 'min-width: 150px;' },
        { field: 'notes', header: 'Notes', sortable: false, style: 'min-width: 200px;' }
    );
    
    return cols;
});

const getStatusColor = (status) => {
    if (!status) return 'bg-success';
    switch (status.toLowerCase()) {
        case 'present': return 'bg-success';
        case 'absent': return 'bg-danger';
        case 'permission': return 'bg-warning text-dark';
        default: return 'bg-secondary';
    }
};

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

        const matchesSearch = monk.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                              (monk.phone && monk.phone.includes(searchQuery.value)) ||
                              (monk.chhaya_number && monk.chhaya_number.includes(searchQuery.value));
        const matchesRow = selectedRowFilter.value === '' || monk.rowNumber === parseInt(selectedRowFilter.value);
        
        let matchesStatus = true;
        if (selectedStatusFilter.value) {
            const currentStatus = monk.attendance?.status || 'present';
            matchesStatus = currentStatus === selectedStatusFilter.value;
        }

        return matchesSearch && matchesRow && matchesStatus;
    });
});

const fetchSeasons = async () => {
    try {
        const res = await api.get('/retreat-events');
        seasons.value = res.data;
        
        const activeSeason = seasons.value.find(s => s.is_active);
        if (activeSeason) {
            selectedSeasonId.value = activeSeason.id;
        } else if (seasons.value.length > 0) {
            selectedSeasonId.value = seasons.value[0].id;
        }
    } catch (error) {
        console.error('Failed to fetch seasons:', error);
    }
};

const fetchSeatingRows = async () => {
    try {
        const params = {};
        if (selectedSeasonId.value) {
            params.retreat_event_id = selectedSeasonId.value;
        }
        const res = await api.get('/seating-rows', { params });
        seatingRows.value = res.data.rows || res.data;
    } catch (error) {
        console.error('Failed to fetch seating rows:', error);
    }
};

const fetchMonks = async () => {
    isLoadingMonks.value = true;
    try {
        const res = await api.get('/users', {
            params: {
                role: 'Monk',
                limit: 1000,
                retreat_event_id: selectedSeasonId.value
            }
        });
        
        const monksData = res.data.users || res.data;
        
        const attendanceRes = await api.get('/attendance/daily', {
            params: { 
                date: selectedDate.value,
                retreat_event_id: selectedSeasonId.value
            }
        });
        
        const attendanceMap = {};
        if (attendanceRes.data && attendanceRes.data.length > 0) {
            attendanceRes.data.forEach(record => {
                attendanceMap[record.monk_id] = record;
            });
        }
        
        monks.value = monksData.map(monk => {
            const rowSeat = monk.SeatingRows && monk.SeatingRows.length > 0 
                ? monk.SeatingRows[0] 
                : { row_num: null, MonkSeating: { seat_number: null } };
                
            const record = attendanceMap[monk.id];
                
            return {
                id: monk.id,
                fullName: `${monk.UserProfile?.first_name_kh || ''} ${monk.UserProfile?.last_name_kh || ''}`.trim() || monk.name,
                role: monk.Role?.name || 'Monk',
                kudiNumber: monk.UserProfile?.kudi_number || null,
                phone: monk.UserProfile?.phone_number || monk.phone,
                chhaya_number: monk.UserProfile?.chhaya_number,
                rowNumber: rowSeat.row_num,
                seatNumber: rowSeat.MonkSeating?.seat_number,
                attendance: record ? { status: record.status, id: record.id } : null,
                attendanceNotes: record ? record.notes : ''
            };
        });
        
        // Default sort by row and seat
        monks.value.sort((a, b) => {
            if (a.rowNumber === b.rowNumber) {
                return (a.seatNumber || 999) - (b.seatNumber || 999);
            }
            return (a.rowNumber || 999) - (b.rowNumber || 999);
        });
        
    } catch (error) {
        console.error('Failed to fetch monks data:', error);
        toastStore.showToast('Failed to load data', 'error');
    } finally {
        isLoadingMonks.value = false;
    }
};

const onSeasonChange = () => {
    fetchSeatingRows();
    fetchMonks();
};

onMounted(async () => {
    await fetchSeasons();
    fetchSeatingRows();
    fetchMonks();
});
</script>
