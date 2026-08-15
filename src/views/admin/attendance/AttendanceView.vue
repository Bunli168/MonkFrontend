<template>
    <div class="attendance-container d-flex flex-column gap-3">
        <div class="card p-3 mb-1 border-0 shadow-sm d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2" style="background-color: var(--surface-card);">
            <div>
                <h5 class="mb-0 fw-bold" style="color: var(--text-heading-color);">Attendance & Reports</h5>
            </div>
            <!-- Season Dropdown -->
            <div class="w-100 w-sm-auto" style="max-width: 250px;" v-if="seasons.length > 0">
                <BaseSelect 
                    v-model="selectedSeasonId" 
                    :options="seasons.map(s => ({label: s.name, value: s.id}))" 
                    @update:modelValue="onSeasonChange"
                />
            </div>
        </div>

        <Tabs v-model:value="activeTab" scrollable class="card gap-2 p-2" style="background-color: var(--surface-ground);">
            <div>
                <TabList>
                    <Tab value="attendance">
                        <div class="d-flex align-items-center gap-2">
                            <CalendarCheck :size="16" class="text-primary" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'attendance'}">Master Attendance</span>
                        </div>
                    </Tab>

                    <Tab value="leave">
                        <div class="d-flex align-items-center gap-2">
                            <MailOpen :size="16" class="text-warning" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'leave'}">Leave Requests</span>
                            <span
                                v-if="leaveViewRef?.pendingCount > 0"
                                class="badge rounded-pill ms-1"
                                style="background: #ef4444; color: #fff; font-size: 0.68rem; padding: 2px 7px; line-height: 1.5;"
                            >{{ leaveViewRef.pendingCount }}</span>
                        </div>
                    </Tab>

                    <Tab value="report">
                        <div class="d-flex align-items-center gap-2">
                            <History :size="16" class="text-info" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'report'}">Payment History</span>
                        </div>
                    </Tab>

                    <Tab value="takers">
                        <div class="d-flex align-items-center gap-2">
                            <UsersRound :size="16" class="text-success" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'takers'}">Attendance Takers</span>
                        </div>
                    </Tab>

                    <Tab value="unassigned">
                        <div class="d-flex align-items-center gap-2">
                            <UserX :size="16" class="text-danger" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'unassigned'}">Unassigned Members</span>
                            <span
                                v-if="unassignedMonksCount > 0"
                                class="badge rounded-pill ms-1"
                                style="background: #f59e0b; color: #fff; font-size: 0.68rem; padding: 2px 7px; line-height: 1.5;"
                            >{{ unassignedMonksCount }}</span>
                        </div>
                    </Tab>
                </TabList>
            </div>

            <TabPanels class="p-0 bg-transparent">
                <!-- Tab 1: Master Attendance -->
                <TabPanel value="attendance">
                    <!-- Filters Section -->
                    <div class="mb-4">
                        <div class="row g-2 align-items-end">
                            <div class="col-12 col-sm-6 col-md-3">
                                <BaseInput 
                                    type="date" 
                                    v-model="selectedDate" 
                                    label="Date"
                                    @update:modelValue="fetchMonks"
                                />
                            </div>
                            <div class="col-12 col-sm-6 col-md-4">
                                <BaseInput 
                                    type="text" 
                                    v-model="searchQuery" 
                                    label="Search Monk"
                                    placeholder="Name or phone..."
                                    :prefixIcon="Search"
                                />
                            </div>
                            <div class="col-6 col-md-2">
                                <BaseSelect 
                                    v-model="selectedRowFilter" 
                                    label="Row"
                                    :options="[{label: 'All Rows', value: ''}, ...seatingRows.map(r => ({label: 'Row ' + r.row_num, value: r.row_num}))]"
                                />
                            </div>
                            <div class="col-6 col-md-3">
                                <BaseSelect 
                                    v-model="selectedKudiFilter" 
                                    label="Kudi"
                                    :options="[{label: 'All Kudis', value: ''}, ...kudiList.map(k => ({label: k.name || `Kudi ${kudi.id}`, value: k.name || k.id}))]"
                                />
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
                                    <div class="d-flex align-items-center gap-3 cursor-pointer" @click="viewMonkProfile(monk)">
                                        <div v-if="monk.profile?.avatar_url || monk.UserProfile?.avatar_url || monk.avatar_url" 
                                             class="avatar rounded-circle overflow-hidden shadow-sm flex-shrink-0" 
                                             style="width: 40px; height: 40px; border: 2px solid var(--primary-color);">
                                            <img :src="`https://neakavorn.work.gd${monk.profile?.avatar_url || monk.UserProfile?.avatar_url || monk.avatar_url}`" 
                                                 class="w-100 h-100 object-fit-cover" />
                                        </div>
                                        <div v-else class="avatar rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0 bg-white" 
                                             style="width: 40px; height: 40px;">
                                            <img src="/app-logo.png" class="w-100 h-100 object-fit-cover rounded-circle" />
                                        </div>
                                        <span class="fw-bold text-dark text-decoration-underline-hover">{{ monk.fullName }}</span>
                                    </div>
                                </template>

                                <template #kudi="{ data: monk }">
                                    <span class="text-primary fw-medium">{{ monk.kudiNumber || '—' }}</span>
                                </template>
                                <template #row="{ data: monk }">
                                    <span class="text-primary fw-medium">{{ monk.rowNumber || '—' }}</span>
                                </template>
                                <template #seat="{ data: monk }">
                                    <span class="text-primary fw-medium">{{ monk.seatNumber || '—' }}</span>
                                </template>

                                <template #phone="{ data: monk }">
                                    <span class="text-muted">{{ monk.phone || monk.chhaya_number || 'N/A' }}</span>
                                </template>

                                <template #absents="{ data: monk }">
                                    <div class="d-flex justify-content-center w-100">
                                        <span class="fw-bold" :class="(monk.netAbsents || 0) >= 9 ? 'text-danger' : 'text-secondary'" style="font-size: 1rem;">
                                            {{ monk.netAbsents || 0 }}
                                        </span>
                                    </div>
                                </template>

                                <template #role="{ data: monk }">
                                    <BaseBadge 
                                        :variant="(monk.role || '').toLowerCase().includes('bhikkhu') ? 'info' : 'secondary'"
                                        :label="monk.role || 'Member'"
                                        pill
                                        size="sm"
                                    />
                                </template>

                                <template #status="{ data: monk }">
                                    <BaseSelectButton 
                                        :modelValue="monk.attendance?.status || 'present'"
                                        @update:modelValue="setStatus(monk, $event)"
                                        :options="[
                                            { label: 'Present', value: 'present' },
                                            { label: 'Absent', value: 'absent' },
                                            { label: 'Leave', value: 'permission' }
                                        ]"
                                        :allowEmpty="false"
                                    />
                                </template>

                                <template #notes="{ data: monk }">
                                    <input type="text" class="form-control form-control-sm bg-light border-0" placeholder="Add note..." v-model="monk.attendanceNotes" @change="saveAttendance">
                                </template>

                                <template #actions="{ data: monk }">
                                    <div class="d-flex justify-content-center">
                                        <button type="button" class="btn btn-sm btn-link text-primary text-decoration-none fw-medium p-0" @click.stop="viewMonkProfile(monk)">
                                            View
                                        </button>
                                    </div>
                                </template>
                            </BaseTable>
                        </div>
                    </div>
                </TabPanel>



                <!-- Tab 2: Leave Requests Tab -->
                <TabPanel value="leave">
                    <AdminLeaveRequestsView ref="leaveViewRef" v-if="activeTab === 'leave'" :seasonId="selectedSeasonId" />
                </TabPanel>

                <!-- Tab 3: Report Tab -->
                <TabPanel value="report">
                    <AdminFineReportView v-if="activeTab === 'report'" :isComponent="true" :seasonId="selectedSeasonId" />
                </TabPanel>



                <!-- Tab 4: Takers Tab -->
                <TabPanel value="takers">
                    <AdminTakersTableView v-if="activeTab === 'takers'" />
                </TabPanel>

                <!-- Tab 5: Dedicated Unassigned Members Tab -->
                <TabPanel value="unassigned">
                    <div class="mb-4">
                        <div class="row g-2 align-items-end">
                            <div class="col-12 col-md-7 col-lg-8">
                                <BaseInput 
                                    type="text" 
                                    v-model="unassignedSearchQuery" 
                                    label="Search Unassigned Member"
                                    placeholder="Search by name or phone…"
                                    :prefixIcon="Search"
                                />
                            </div>
                            <div class="col-12 col-md-5 col-lg-4">
                                <BaseSelect 
                                    v-model="unassignedKudiFilter" 
                                    label="Kudi"
                                    :options="[{label: 'All Kudis', value: ''}, ...kudiList.map(k => ({label: k.name || `Kudi ${kudi.id}`, value: k.name || k.id}))]"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="card border-0 shadow-sm">
                        <div class="card-body p-0">
                            <BaseTable 
                                :columns="unassignedColDefs" 
                                :rows="paginatedUnassignedMonks" 
                                :loading="isLoadingMonks"
                                :show-index="true"
                                :total-records="filteredUnassignedMonks.length"
                                v-model:page="unassignedPage"
                                v-model:per-page="perPage"
                            >
                                <template #name="{ data: monk }">
                                    <div class="d-flex align-items-center gap-3 cursor-pointer" @click="viewMonkProfile(monk)">
                                        <div v-if="monk.profile?.avatar_url || monk.UserProfile?.avatar_url || monk.avatar_url" 
                                             class="avatar rounded-circle overflow-hidden shadow-sm flex-shrink-0" 
                                             style="width: 40px; height: 40px; border: 2px solid var(--primary-color);">
                                            <img :src="`https://neakavorn.work.gd${monk.profile?.avatar_url || monk.UserProfile?.avatar_url || monk.avatar_url}`" 
                                                 class="w-100 h-100 object-fit-cover" />
                                        </div>
                                        <div v-else class="avatar rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0 bg-white" 
                                             style="width: 40px; height: 40px;">
                                            <img src="/app-logo.png" class="w-100 h-100 object-fit-cover rounded-circle" />
                                        </div>
                                        <div class="d-flex flex-column min-w-0">
                                            <span class="fw-bold text-dark text-decoration-underline-hover text-truncate">{{ monk.fullName }}</span>
                                            <span v-if="monk.email" class="text-muted small text-truncate" style="font-size: 0.75rem;">{{ monk.email }}</span>
                                        </div>
                                    </div>
                                </template>

                                <template #kudi="{ data: monk }">
                                    <span class="text-primary fw-medium">{{ monk.kudiNumber || '—' }}</span>
                                </template>
                                <template #row="{ data: monk }">
                                    <span class="text-primary fw-medium">{{ monk.rowNumber || '—' }}</span>
                                </template>
                                <template #seat="{ data: monk }">
                                    <span class="text-primary fw-medium">{{ monk.seatNumber || '—' }}</span>
                                </template>

                                <template #phone="{ data: monk }">
                                    <span class="text-muted">{{ monk.phone || monk.chhaya_number || 'N/A' }}</span>
                                </template>

                                <template #absents="{ data: monk }">
                                    <div class="d-flex justify-content-center w-100">
                                        <span class="fw-bold text-secondary" style="font-size: 1rem;">
                                            {{ monk.netAbsents || 0 }}
                                        </span>
                                    </div>
                                </template>

                                <template #role="{ data: monk }">
                                    <BaseBadge 
                                        :variant="(monk.role || '').toLowerCase().includes('bhikkhu') ? 'info' : 'secondary'"
                                        :label="monk.role || 'Member'"
                                        pill
                                        size="sm"
                                    />
                                </template>

                                <template #actions="{ data: monk }">
                                    <div class="d-flex justify-content-center">
                                        <button type="button" class="btn btn-sm btn-link text-primary text-decoration-none fw-medium p-0" @click.stop="viewMonkProfile(monk)">
                                            View
                                        </button>
                                    </div>
                                </template>
                            </BaseTable>
                        </div>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>

        <!-- User Detail Drawer -->
        <BaseDrawer v-model="showUserDetail" title="Member Profile Details" width="30rem">
            <UserDetailView v-if="showUserDetail" :user="userDetail" />
        </BaseDrawer>
    </div>
</template>

<script setup>
import { Tab, TabList, TabPanels, TabPanel, Tabs } from 'primevue';
import { ref, computed, watch, onMounted } from 'vue';
import { CalendarCheck, History, MailOpen, UsersRound, Search, Save, Check, X, BedDouble, UserX, Eye } from '@lucide/vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseDrawer from '@/components/base/BaseDrawer.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseSelect from '@/components/base/BaseSelect.vue';
import BaseSelectButton from '@/components/base/BaseSelectButton.vue';
import BaseBadge from '@/components/base/BaseBadge.vue';
import UserDetailView from '@/views/admin/users/UserDetailView.vue';
import AdminFineReportView from '@/views/admin/fines/AdminFineReportView.vue';
import AdminLeaveRequestsView from './AdminLeaveRequestsView.vue';
import AdminTakersTableView from './AdminTakersTableView.vue';
import { useAuthStore } from '@/stores/auth';

const toast = useToastStore();
const authStore = useAuthStore();
const leaveViewRef = ref(null);

const showUserDetail = ref(false);
const userDetail = ref(null);

const viewMonkProfile = (monk) => {
    const profile = monk.profile || monk.UserProfile || {};
    userDetail.value = {
        ...monk,
        id: monk.id,
        first_name: monk.first_name || monk.fullName || '',
        last_name: monk.last_name || '',
        email: monk.email || '',
        avatar_url: profile.avatar_url || monk.avatar_url,
        role: monk.role,
        isActive: true,
        UserProfile: {
            ...profile,
            avatar_url: profile.avatar_url || monk.avatar_url,
            phone_number: profile.phone_number || monk.phone || monk.chhaya_number,
            Kut: profile.Kut || null,
            kut_id: profile.kut_id || null,
            gender: profile.gender || null,
            date_of_birth: profile.date_of_birth || profile.dateOfBirth || null,
            chhaya_number: profile.chhaya_number || monk.chhaya_number || null,
            first_name_kh: profile.first_name_kh || null,
            last_name_kh: profile.last_name_kh || null,
            first_name_en: profile.first_name_en || null,
            last_name_en: profile.last_name_en || null,
        },
        profile: {
            ...profile,
            avatar_url: profile.avatar_url || monk.avatar_url,
        }
    };
    showUserDetail.value = true;
};

const getLocalDateString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

const activeTab = ref('attendance');
const page = ref(1);
const unassignedPage = ref(1);
const perPage = ref(10);
const selectedDate = ref(getLocalDateString());
const searchQuery = ref('');
const selectedRowFilter = ref('');
const selectedKudiFilter = ref('');
const selectedStatusFilter = ref('');

const unassignedSearchQuery = ref('');
const unassignedKudiFilter = ref('');

const resetPage = () => {
    page.value = 1;
};

watch(searchQuery, resetPage);
watch(selectedRowFilter, resetPage);
watch(selectedKudiFilter, resetPage);
watch(selectedStatusFilter, resetPage);
watch(selectedDate, resetPage);

const resetUnassignedPage = () => {
    unassignedPage.value = 1;
};
watch(unassignedSearchQuery, resetUnassignedPage);
watch(unassignedKudiFilter, resetUnassignedPage);

const monks = ref([]);
const seatingRows = ref([]);
const kudiList = ref([]);
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
    return [
        { field: 'name', header: 'Monk Name' },
        { field: 'role', header: 'Role' },
        { field: 'kudi', header: 'Kudi', class: 'text-center' },
        { field: 'row', header: 'Row', class: 'text-center' },
        { field: 'seat', header: 'Seat', class: 'text-center' },
        { field: 'phone', header: 'Phone' },
        { field: 'absents', header: 'Absents', class: 'text-center' },
        { field: 'status', header: 'Status', class: 'text-center', style: 'min-width: 250px;' },
        { field: 'actions', header: 'Actions', class: 'text-center' }
    ];
});

const unassignedColDefs = computed(() => {
    return [
        { field: 'name', header: 'Monk Name' },
        { field: 'role', header: 'Role' },
        { field: 'kudi', header: 'Kudi', class: 'text-center' },
        { field: 'row', header: 'Row', class: 'text-center' },
        { field: 'seat', header: 'Seat', class: 'text-center' },
        { field: 'phone', header: 'Phone' },
        { field: 'absents', header: 'Absents', class: 'text-center' },
        { field: 'actions', header: 'Actions', class: 'text-center' }
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
        const khmerNums = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
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

const filteredMonks = computed(() => {
    return monks.value.filter(monk => {
        // Show ONLY monks with netAbsents >= 9 in Master Attendance
        if ((monk.netAbsents || 0) < 9) {
            return false;
        }

        // Search filter
        const query = searchQuery.value.toLowerCase().trim();
        const matchesSearch = !query || 
            (monk.fullName && monk.fullName.toLowerCase().includes(query)) ||
            (monk.phone && monk.phone.includes(query)) ||
            (monk.chhaya_number && monk.chhaya_number.includes(query));
            
        // Row filter
        let matchesRow = true;
        if (selectedRowFilter.value) {
            matchesRow = monk.rowNumber === selectedRowFilter.value || monk.rowNumber?.toString() === selectedRowFilter.value.toString();
        }

        // Kudi filter
        const monkKudi = monk.kudiNumber || monk.profile?.Kut?.name || monk.profile?.kut_id;
        const matchesKudi = matchKudiExact(monkKudi, selectedKudiFilter.value);
        
        // Status filter
        const status = monk.attendance?.status || 'present';
        const matchesStatus = !selectedStatusFilter.value || status === selectedStatusFilter.value;
        
        return matchesSearch && matchesRow && matchesKudi && matchesStatus;
    });
});

// Dedicated Unassigned Monks computed list (excluding SuperAdmin and Attendance Takers)
const allUnassignedMonks = computed(() => {
    return monks.value.filter(monk => {
        // Exclude SuperAdmin and Attendance Takers
        const roleStr = (monk.role || monk.UserProfile?.role || monk.profile?.role || '').toString().toLowerCase();
        if (
            roleStr.includes('superadmin') || 
            roleStr.includes('super admin') || 
            roleStr.includes('super_admin') ||
            roleStr.includes('taker') ||
            roleStr.includes('attendance_taker') ||
            roleStr.includes('attendance taker')
        ) {
            return false;
        }

        return !monk.rowNumber || monk.rowNumber === '-' || monk.rowNumber === null;
    });
});

const unassignedMonksCount = computed(() => {
    return allUnassignedMonks.value.length;
});

const filteredUnassignedMonks = computed(() => {
    return allUnassignedMonks.value.filter(monk => {
        const query = unassignedSearchQuery.value.toLowerCase().trim();
        const matchesSearch = !query || 
            (monk.fullName && monk.fullName.toLowerCase().includes(query)) ||
            (monk.phone && monk.phone.includes(query)) ||
            (monk.chhaya_number && monk.chhaya_number.includes(query));

        const monkKudi = monk.kudiNumber || monk.profile?.Kut?.name || monk.profile?.kut_id;
        const matchesKudi = matchKudiExact(monkKudi, unassignedKudiFilter.value);

        return matchesSearch && matchesKudi;
    });
});

const paginatedUnassignedMonks = computed(() => {
    const start = (unassignedPage.value - 1) * perPage.value;
    const end = start + perPage.value;
    return filteredUnassignedMonks.value.slice(start, end);
});

const getStatusColor = (status) => {
    if (status === 'absent') return 'bg-danger';
    if (status === 'permission') return 'bg-warning text-dark';
    return 'bg-success';
};

const setStatus = async (monk, status) => {
    if (!monk.attendance) {
        monk.attendance = { status, notes: monk.attendanceNotes || '' };
    } else {
        monk.attendance.status = status;
    }
    await saveAttendance();
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

const sortKudisNumerically = (list) => {
    return list.slice().sort((a, b) => {
        const extractNum = (item) => {
            const val = (item.name || item.id || '').toString();
            const khmerNums = ['០','១','២','៣','៤','៥','<ctrl42>','៧','៨','៩'];
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
        const response = await api.get('/kuts');
        const raw = response.data?.data || response.data || [];
        kudiList.value = sortKudisNumerically(raw);
    } catch (error) {
        console.error('Failed to fetch kuts:', error);
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
    await fetchKudis();
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
.text-decoration-underline-hover:hover {
    text-decoration: underline !important;
}
</style>
