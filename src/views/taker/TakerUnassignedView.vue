<template>
    <div class="unassigned-view">
        <!-- Hero Header -->
        <div class="hero-header mb-4">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div>
                    <div class="d-flex align-items-center gap-3 mb-2">
                        <div class="hero-icon">
                            <UserX :size="24" />
                        </div>
                        <div>
                            <h4 class="fw-bold mb-0 text-dark">Unassigned Members</h4>
                            <p class="text-muted mb-0 small">Members without a designated seat or row assignment</p>
                        </div>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                    <div class="search-box">
                        <Search :size="16" class="search-icon" />
                        <input type="text" placeholder="Search members..." v-model="searchQuery">
                    </div>
                    <div class="kudi-filter">
                        <select v-model="selectedKudi" class="kudi-select">
                            <option value="">All Kudis</option>
                            <option v-for="kudi in kudiList" :key="kudi.id || kudi.name" :value="kudi.name">
                                {{ kudi.name || `Kudi ${kudi.id}` }}
                            </option>
                        </select>
                    </div>
                    <button class="refresh-btn" @click="fetchData" :disabled="isLoading">
                        <RefreshCw :size="16" :class="{ 'spin-animation': isLoading }" />
                    </button>
                </div>
            </div>
        </div>

        <!-- Stats Row -->
        <div class="row g-3 mb-4">
            <div class="col-6 col-md-3">
                <div class="stat-card stat-warning">
                    <div class="stat-icon">
                        <UserX :size="20" />
                    </div>
                    <div class="stat-content">
                        <span class="stat-value">{{ filteredMonks.length }}</span>
                        <span class="stat-label">Unassigned</span>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card stat-primary">
                    <div class="stat-icon">
                        <UsersRound :size="20" />
                    </div>
                    <div class="stat-content">
                        <span class="stat-value">{{ allMonks.length }}</span>
                        <span class="stat-label">Total</span>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card stat-success">
                    <div class="stat-icon">
                        <UserCheck :size="20" />
                    </div>
                    <div class="stat-content">
                        <span class="stat-value">{{ assignedCount }}</span>
                        <span class="stat-label">Assigned</span>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card stat-info">
                    <div class="stat-icon">
                        <Percent :size="20" />
                    </div>
                    <div class="stat-content">
                        <span class="stat-value">{{ assignedPercentage }}%</span>
                        <span class="stat-label">Covered</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-section mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="small fw-semibold text-muted">Assignment Coverage</span>
                <span class="small fw-bold" :class="assignedPercentage >= 80 ? 'text-success' : assignedPercentage >= 50 ? 'text-warning' : 'text-danger'">
                    {{ assignedCount }} / {{ allMonks.length }} assigned
                </span>
            </div>
            <div class="progress-bar-track">
                <div class="progress-bar-fill" :style="{ width: assignedPercentage + '%' }" :class="assignedPercentage >= 80 ? 'bg-success' : assignedPercentage >= 50 ? 'bg-warning' : 'bg-danger'"></div>
            </div>
        </div>

        <!-- Table -->
        <div class="table-card">
            <div class="table-header">
                <div class="d-flex align-items-center gap-2">
                    <div class="header-dot"></div>
                    <span class="fw-semibold">Members List</span>
                    <span class="badge bg-warning bg-opacity-10 text-warning rounded-pill px-2 py-1 small">{{ filteredMonks.length }}</span>
                </div>
            </div>
            <div class="table-body">
                <BaseTable 
                    :columns="colDefs" 
                    :rows="paginatedMonks"
                    :totalRecords="filteredMonks.length"
                    :loading="isLoading"
                    :show-index="true"
                    v-model:page="currentPage"
                    v-model:per-page="perPage"
                >
                    <template #name="{ data: monk }">
                        <div class="d-flex align-items-center gap-3 py-1">
                            <div class="member-avatar">
                                <img v-if="monk.profile?.avatar_url || monk.profile?.avatarUrl" :src="$authImg(monk.profile?.avatar_url || monk.profile?.avatarUrl)" class="w-100 h-100 object-fit-cover" />
                                <img v-else src="/app-logo.png" class="w-100 h-100 object-fit-cover bg-white" />
                            </div>
                            <div class="flex-grow-1" style="min-width: 0;">
                                <div class="fw-semibold text-dark" style="font-size: 0.92rem;">{{ monk.fullName }}</div>
                                <div class="small text-muted" style="font-size: 0.78rem;">{{ monk.email || monk.chhaya_number || 'No Contact' }}</div>
                            </div>
                        </div>
                    </template>

                    <template #role="{ data: monk }">
                        <span class="role-badge">{{ monk.role || 'Member' }}</span>
                    </template>

                    <template #kudi="{ data: monk }">
                        <span v-if="monk.kudiNumber" class="fw-medium">{{ monk.kudiNumber }}</span>
                        <span v-else class="status-badge status-warning">—</span>
                    </template>

                    <template #phone="{ data: monk }">
                        <span class="text-muted" style="font-size: 0.88rem;">{{ monk.phone || monk.chhaya_number || 'N/A' }}</span>
                    </template>

                    <template #row_number>
                        <span class="status-badge status-warning">
                            <span class="status-dot"></span>
                            No Row
                        </span>
                    </template>

                    <template #seat_number>
                        <span class="status-badge status-warning">
                            <span class="status-dot"></span>
                            No Seat
                        </span>
                    </template>
                </BaseTable>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { UserX, UsersRound, Search, RefreshCw, UserCheck, Percent } from '@lucide/vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import BaseTable from '@/components/base/BaseTable.vue';

const toast = useToastStore();
const allMonks = ref([]);
const kudiList = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const selectedKudi = ref('');
const currentPage = ref(1);
const perPage = ref(20);

const colDefs = computed(() => {
    return [
        { field: 'name', header: 'Monk Name' },
        { field: 'role', header: 'Role' },
        { field: 'kudi', header: 'Kudi', class: 'text-center' },
        { field: 'phone', header: 'Phone' },
        { field: 'row_number', header: 'Row', class: 'text-center' },
        { field: 'seat_number', header: 'Seat', class: 'text-center' },
    ];
});

const unassignedMonks = computed(() => {
    return allMonks.value.filter(m => !m.rowNumber && !m.seating_row_id);
});

const assignedCount = computed(() => {
    return allMonks.value.length - unassignedMonks.value.length;
});

const assignedPercentage = computed(() => {
    if (allMonks.value.length === 0) return 0;
    return Math.round((assignedCount.value / allMonks.value.length) * 100);
});

const filteredMonks = computed(() => {
    let filtered = unassignedMonks.value;
    
    // Kudi filter
    if (selectedKudi.value) {
        filtered = filtered.filter(m => m.kudiNumber === selectedKudi.value);
    }
    
    // Search filter
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(m => 
            (m.fullName && m.fullName.toLowerCase().includes(query)) ||
            (m.kudiNumber && m.kudiNumber.toLowerCase().includes(query)) ||
            (m.phone && m.phone.toLowerCase().includes(query)) ||
            (m.chhaya_number && m.chhaya_number.toLowerCase().includes(query)) ||
            (m.email && m.email.toLowerCase().includes(query))
        );
    }
    return filtered;
});

const paginatedMonks = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    return filteredMonks.value.slice(start, start + perPage.value);
});

const getLocalDateString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

const sortKudisNumerically = (list) => {
    return list.slice().sort((a, b) => {
        const extractNum = (item) => {
            const val = (item.name || item.id || '').toString();
            const khmerNums = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
            let res = val;
            khmerNums.forEach((kh, i) => {
                res = res.replaceAll(kh, i.toString());
            });
            const match = res.match(/\d+/);
            return match ? parseInt(match[0], 10) : 999999;
        };
        return extractNum(a) - extractNum(b) || (a.name || '').localeCompare(b.name || '');
    });
};

const fetchKudis = async () => {
    try {
        const response = await api.get('/kuts');
        const raw = response.data?.data || response.data || [];
        kudiList.value = sortKudisNumerically(raw);
    } catch (error) {
        console.error('Failed to fetch kudis:', error);
    }
};

const fetchData = async () => {
    isLoading.value = true;
    try {
        const res = await api.get('/attendances/monks-by-date', { params: { date: getLocalDateString() } });
        const rawMonks = res.data?.data || res.data || [];
        allMonks.value = rawMonks;
    } catch (error) {
        console.error('Failed to fetch monks:', error);
        toast.showToast('Failed to load data', 'error');
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchData();
    fetchKudis();
});
</script>

<style scoped>
.unassigned-view {
    padding: 1.5rem;
    min-height: 100vh;
    background: linear-gradient(135deg, #fefce8 0%, #fff7ed 30%, #ffffff 60%);
}

/* Hero Header */
.hero-header {
    background: white;
    border-radius: 16px;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.04);
}

.hero-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    flex-shrink: 0;
}

/* Search Box */
.search-box {
    position: relative;
    min-width: 220px;
}

.search-box .search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    pointer-events: none;
}

.search-box input {
    width: 100%;
    padding: 10px 14px 10px 40px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.88rem;
    background: #f8fafc;
    transition: all 0.2s ease;
    outline: none;
}

.search-box input:focus {
    border-color: #f59e0b;
    background: white;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.search-box input::placeholder {
    color: #94a3b8;
}

/* Kudi Filter */
.kudi-filter {
    min-width: 160px;
}

.kudi-select {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.88rem;
    background: #f8fafc;
    transition: all 0.2s ease;
    outline: none;
    color: #475569;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 14px;
    padding-right: 36px;
}

.kudi-select:focus {
    border-color: #f59e0b;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.refresh-btn {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    border: 1.5px solid #e2e8f0;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.refresh-btn:hover {
    background: white;
    border-color: #f59e0b;
    color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.refresh-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Stat Cards */
.stat-card {
    border-radius: 16px;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 1px solid rgba(0, 0, 0, 0.04);
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.stat-warning .stat-icon {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    color: #d97706;
}

.stat-primary .stat-icon {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    color: #2563eb;
}

.stat-success .stat-icon {
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    color: #16a34a;
}

.stat-info .stat-icon {
    background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
    color: #4f46e5;
}

.stat-content {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 1.4rem;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.2;
}

.stat-label {
    font-size: 0.72rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Progress Section */
.progress-section {
    background: white;
    border-radius: 14px;
    padding: 1rem 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.04);
}

.progress-bar-track {
    width: 100%;
    height: 8px;
    background: #f1f5f9;
    border-radius: 99px;
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-bar-fill.bg-success { background: linear-gradient(90deg, #22c55e, #16a34a); }
.progress-bar-fill.bg-warning { background: linear-gradient(90deg, #f59e0b, #d97706); }
.progress-bar-fill.bg-danger { background: linear-gradient(90deg, #ef4444, #dc2626); }

/* Table Card */
.table-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.04);
}

.table-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #f1f5f9;
    background: #fafbfc;
}

.header-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #f59e0b;
}

.table-body {
    padding: 0;
}

/* Member Avatar */
.member-avatar {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    color: #d97706;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
    flex-shrink: 0;
    overflow: hidden;
}

/* Badges */
.role-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 0.78rem;
    font-weight: 600;
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 0.78rem;
    font-weight: 600;
}

.status-badge.status-warning {
    background: #fffbeb;
    color: #d97706;
    border: 1px solid #fde68a;
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
}

/* Animations */
.spin-animation {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
    .unassigned-view {
        padding: 1rem;
    }
    
    .hero-header {
        padding: 1rem;
    }

    .search-box {
        min-width: 160px;
    }

    .stat-value {
        font-size: 1.1rem;
    }
}
</style>
