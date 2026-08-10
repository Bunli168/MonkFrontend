<template>
    <div :class="isComponent ? '' : 'admin-fines-report bg-light min-vh-100'">
        <!-- Header -->
        <div v-if="!isComponent" class="bg-white border-bottom sticky-top shadow-sm mb-4" style="z-index: 1020;">
            <div class="d-flex align-items-center p-3 gap-3">
                <button class="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;" @click="$router.push('/dashboard/fines')">
                    <i class="fas fa-arrow-left text-secondary"></i>
                </button>
                <div>
                    <h5 class="mb-0 fw-bold text-dark">Payment History Report</h5>
                    <p class="text-muted small mb-0">Record of all fines collected.</p>
                </div>
            </div>
        </div>

        <div :class="isComponent ? '' : 'container-fluid px-3 px-md-4'">

            <!-- Search & Filter Bar -->
            <div class="card border-0 shadow-sm rounded-4 mb-4" style="background-color: var(--surface-card);">
                <div class="card-body p-3">
                    <div class="row g-3 align-items-center">
                        <div class="col-md-5 col-lg-6">
                            <label class="form-label text-muted small fw-bold text-uppercase mb-1">Search</label>
                            <div class="position-relative">
                                <i class="fas fa-search position-absolute text-muted" style="left: 15px; top: 50%; transform: translateY(-50%);"></i>
                                <input
                                    type="text"
                                    class="form-control ps-5"
                                    placeholder="Search by payer or collector…"
                                    v-model="searchQuery"
                                />
                            </div>
                        </div>
                        <div class="col-6 col-md-3 col-lg-3">
                            <label class="form-label text-muted small fw-bold text-uppercase mb-1">Row</label>
                            <select v-model="selectedRowFilter" class="form-select">
                                <option value="">All Rows</option>
                                <option value="unassigned">⚠️ Unassigned Row</option>
                                <option v-for="row in seatingRows" :key="row.id" :value="row.row_num">
                                    Row {{ row.row_num }}
                                </option>
                            </select>
                        </div>
                        <div class="col-6 col-md-4 col-lg-3">
                            <label class="form-label text-muted small fw-bold text-uppercase mb-1">Kudi</label>
                            <select v-model="selectedKudiFilter" class="form-select">
                                <option value="">All Kudis</option>
                                <option value="unassigned">⚠️ Unassigned Kudi</option>
                                <option v-for="kudi in kudiList" :key="kudi.id || kudi.name" :value="kudi.name">
                                    {{ kudi.name || `Kudi ${kudi.id}` }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="card-body p-0">
                    <div v-if="isLoading" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="mt-2 text-muted">Loading report...</p>
                    </div>

                    <div v-else>
                        <BaseTable 
                            :columns="colDefs" 
                            :rows="filteredPayments" 
                            :loading="isLoading"
                            :show-index="true"
                            :hideIndexOnMobile="true"
                        >
                            <template #payment_date="{ data: payment }">
                                <div class="fw-bold" style="color: var(--text-heading-color);">{{ formatDate(payment.payment_date) }}</div>
                                <div class="small text-muted">{{ formatTime(payment.payment_date) }}</div>
                            </template>

                            <template #payer_name="{ data: payment }">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="avatar rounded-circle d-flex align-items-center justify-content-center fw-bold" 
                                        style="width: 34px; height: 34px; background: color-mix(in srgb, var(--primary-color) 12%, transparent); color: var(--primary-color); font-size: 0.85rem;">
                                        {{ payment.payer_name ? payment.payer_name.charAt(0) : 'U' }}
                                    </div>
                                    <span class="fw-medium" style="color: var(--text-heading-color);">{{ payment.payer_name }}</span>
                                </div>
                            </template>

                            <template #collector_name="{ data: payment }">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="fas fa-user-shield text-muted" style="font-size: 0.8rem;"></i>
                                    <span class="text-secondary">{{ payment.collector_name }}</span>
                                </div>
                            </template>

                            <template #cleared_absents="{ data: payment }">
                                <span class="badge rounded-pill px-3 py-2 fw-medium"
                                    style="background: color-mix(in srgb, var(--success-color, #198754) 12%, transparent); color: var(--success-color, #198754);">
                                    {{ payment.cleared_absents }} Absents
                                </span>
                            </template>

                            <template #amount="{ data: payment }">
                                <span class="fw-bold fs-6" style="color: var(--success-color, #198754);">
                                    ${{ (payment.amount || 0).toFixed(2) }}
                                </span>
                            </template>
                        </BaseTable>

                        <!-- Total Footer — auto-calculated -->
                        <div v-if="filteredPayments.length > 0" class="total-footer">
                            <div class="total-footer__item">
                                <span class="total-footer__label">Total Records</span>
                                <span class="total-footer__value">{{ filteredPayments.length }}</span>
                            </div>
                            <div class="total-footer__divider"></div>
                            <div class="total-footer__item">
                                <span class="total-footer__label">Total Cleared Absents</span>
                                <span class="total-footer__value">{{ totalClearedAbsents }} days</span>
                            </div>
                            <div class="total-footer__divider"></div>
                            <div class="total-footer__item total-footer__item--highlight">
                                <span class="total-footer__label">💰 Total Amount Paid</span>
                                <span class="total-footer__value total-footer__value--big">${{ totalPaidAmount.toFixed(2) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import BaseTable from '@/components/base/BaseTable.vue';

const colDefs = [
    { field: 'payment_date', header: 'Date (កាលបរិច្ឆេទ)', class: 'mobile-stack' },
    { field: 'payer_name', header: 'Monk (អ្នកបង់)', class: 'mobile-stack' },
    { field: 'collector_name', header: 'Collected By (អ្នកប្រមូល)', class: 'mobile-stack' },
    { field: 'cleared_absents', header: 'Cleared Absents (អវត្តមានដែលបានលុប)', align: 'center', class: 'mobile-stack' },
    { field: 'amount', header: 'Amount Paid (ប្រាក់ដែលបានបង់)', align: 'end', class: 'mobile-stack' }
];

const props = defineProps({
    isComponent: {
        type: Boolean,
        default: false
    },
    seasonId: {
        type: [String, Number],
        default: null
    }
});

const toast = useToastStore();
const payments = ref([]);
const seatingRows = ref([]);
const kudiList = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');
const selectedRowFilter = ref('');
const selectedKudiFilter = ref('');

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

const filteredPayments = computed(() => {
    return payments.value.filter(p => {
        // Search filter
        const query = searchQuery.value.toLowerCase().trim();
        const matchesSearch = !query || 
            (p.payer_name && p.payer_name.toLowerCase().includes(query)) || 
            (p.collector_name && p.collector_name.toLowerCase().includes(query));

        // Row filter
        let matchesRow = true;
        const monkRow = p.seating_row_num || p.User?.UserProfile?.SeatingRow?.row_num || p.row_num;
        if (selectedRowFilter.value === 'unassigned') {
            matchesRow = !monkRow;
        } else if (selectedRowFilter.value) {
            matchesRow = monkRow === selectedRowFilter.value || monkRow?.toString() === selectedRowFilter.value.toString();
        }

        // Kudi filter
        const monkKudi = p.kudi_name || p.kudi_number || p.User?.UserProfile?.Kut?.name || p.User?.UserProfile?.kut_id;
        const matchesKudi = matchKudiExact(monkKudi, selectedKudiFilter.value);

        return matchesSearch && matchesRow && matchesKudi;
    });
});

const totalPaidAmount = computed(() => {
    return filteredPayments.value.reduce((sum, p) => sum + (p.amount || 0), 0);
});

const totalClearedAbsents = computed(() => {
    return filteredPayments.value.reduce((sum, p) => sum + (p.cleared_absents || 0), 0);
});

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

const fetchData = async () => {
    isLoading.value = true;
    try {
        const params = {};
        if (props.seasonId) {
            params.retreat_event_id = props.seasonId;
        }
        const res = await api.get('/fines/report', { params });
        payments.value = res.data.data || res.data || [];
    } catch (error) {
        console.error('Failed to fetch payment report:', error);
        toast.showToast('Failed to load report', 'error');
    } finally {
        isLoading.value = false;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB');
};

const formatTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

watch(() => props.seasonId, () => {
    fetchData();
});

onMounted(async () => {
    await fetchSeatingRows();
    await fetchKudis();
    fetchData();
});
</script>

<style scoped>
.total-footer {
    display: flex;
    align-items: center;
    justify-content: space-around;
    background: var(--surface-card, #fff);
    border-top: 1px solid var(--border-color, #e5e7eb);
    padding: 16px;
}
.total-footer__item {
    display: flex;
    flex-column: column;
    align-items: center;
}
.total-footer__label {
    font-size: 0.8rem;
    color: var(--text-muted-color, #64748b);
}
.total-footer__value {
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--text-heading-color, #0f172a);
}
.total-footer__value--big {
    font-size: 1.25rem;
    color: var(--success-color, #198754);
}
.total-footer__divider {
    width: 1px;
    height: 30px;
    background: var(--border-color, #e5e7eb);
}
</style>
