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
            <!-- Modern Premium 3-Column Analytics Grid -->
            <div class="row g-3 mb-4">
                <!-- Total Collected -->
                <div class="col-12 col-md-4">
                    <div class="card stat-card h-100 p-3 p-xl-4 rounded-4 shadow-sm border-0 position-relative overflow-hidden" style="background-color: var(--surface-card);">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <span class="text-muted fw-bold text-uppercase small" style="letter-spacing: 0.5px;">Total Collected</span>
                            <div class="icon-box bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center" style="width: 45px; height: 45px;">
                                <i class="fas fa-hand-holding-usd fs-5"></i>
                            </div>
                        </div>
                        <h2 class="fw-bold mb-1 d-flex align-items-baseline gap-1" style="color: var(--text-heading-color);">
                            <span class="text-success fs-4">$</span>{{ totalPaidAmount.toFixed(2) }}
                        </h2>
                        <div class="d-flex align-items-center gap-2 mt-2">
                            <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1 small fw-medium">
                                <i class="fas fa-check-circle me-1"></i>Revenue
                            </span>
                            <span class="text-muted small">All recorded fines</span>
                        </div>
                    </div>
                </div>

                <!-- Total Transactions -->
                <div class="col-12 col-md-4">
                    <div class="card stat-card h-100 p-3 p-xl-4 rounded-4 shadow-sm border-0 position-relative overflow-hidden" style="background-color: var(--surface-card);">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <span class="text-muted fw-bold text-uppercase small" style="letter-spacing: 0.5px;">Transactions</span>
                            <div class="icon-box bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 45px; height: 45px;">
                                <i class="fas fa-file-invoice-dollar fs-5"></i>
                            </div>
                        </div>
                        <h2 class="fw-bold mb-1" style="color: var(--text-heading-color);">
                            {{ filteredPayments.length }}
                        </h2>
                        <div class="d-flex align-items-center gap-2 mt-2">
                            <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-1 small fw-medium">
                                <i class="fas fa-receipt me-1"></i>Records
                            </span>
                            <span class="text-muted small">Completed payments</span>
                        </div>
                    </div>
                </div>

                <!-- Cleared Absents -->
                <div class="col-12 col-md-4">
                    <div class="card stat-card h-100 p-3 p-xl-4 rounded-4 shadow-sm border-0 position-relative overflow-hidden" style="background-color: var(--surface-card);">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <span class="text-muted fw-bold text-uppercase small" style="letter-spacing: 0.5px;">Cleared Absents</span>
                            <div class="icon-box bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center" style="width: 45px; height: 45px;">
                                <i class="fas fa-user-shield fs-5"></i>
                            </div>
                        </div>
                        <h2 class="fw-bold mb-1" style="color: var(--text-heading-color);">
                            {{ totalClearedAbsents }}
                        </h2>
                        <div class="d-flex align-items-center gap-2 mt-2">
                            <span class="badge bg-info bg-opacity-10 text-info rounded-pill px-2 py-1 small fw-medium">
                                <i class="fas fa-user-check me-1"></i>Restored
                            </span>
                            <span class="text-muted small">Absent days cleared</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-3 mb-4">
                <div class="position-relative flex-grow-1" style="max-width: 400px;">
                    <i class="fas fa-search position-absolute text-muted" style="left: 16px; top: 50%; transform: translateY(-50%);"></i>
                    <input type="text" class="form-control rounded-pill ps-5 py-2 border shadow-sm" placeholder="Search payer or collector..." v-model="searchQuery">
                    <button v-if="searchQuery" @click="searchQuery = ''" class="btn btn-sm position-absolute border-0 text-muted" style="right: 12px; top: 50%; transform: translateY(-50%);">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>


            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="card-body p-0">
                    <div v-if="isLoading" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="mt-2 text-muted">Loading report...</p>
                    </div>

                    <div v-else-if="filteredPayments.length === 0" class="text-center py-5 my-3">
                        <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-secondary bg-opacity-10 text-secondary mb-3" style="width: 70px; height: 70px;">
                            <i class="fas fa-file-invoice-dollar fs-2"></i>
                        </div>
                        <h5 class="fw-bold mb-1" style="color: var(--text-heading-color);">No Payments Found</h5>
                        <p class="text-muted small mb-3">There are no recorded fine payments matching your current filter.</p>
                        <button v-if="searchQuery" @click="searchQuery = ''" class="btn btn-sm btn-outline-primary rounded-pill px-4">
                            <i class="fas fa-times me-1"></i>Clear Search
                        </button>
                    </div>

                    <div v-else>
                        <BaseTable 
                            :columns="colDefs" 
                            :rows="filteredPayments" 
                            :loading="isLoading"
                            :show-index="true"
                        >
                            <template #payment_date="{ data: payment }">
                                <div class="fw-bold text-dark">{{ formatDate(payment.payment_date) }}</div>
                                <div class="small text-muted">{{ formatTime(payment.payment_date) }}</div>
                            </template>

                            <template #payer_name="{ data: payment }">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="avatar rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style="width: 35px; height: 35px;">
                                        {{ payment.payer_name.charAt(0) }}
                                    </div>
                                    <span class="fw-bold text-dark">{{ payment.payer_name }}</span>
                                </div>
                            </template>

                            <template #collector_name="{ data: payment }">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="fas fa-user-shield text-muted"></i>
                                    <span class="text-secondary">{{ payment.collector_name }}</span>
                                </div>
                            </template>

                            <template #cleared_absents="{ data: payment }">
                                <span class="badge bg-success text-white rounded-pill px-3 py-2 fw-medium">
                                    {{ payment.cleared_absents }} Absents
                                </span>
                            </template>

                            <template #amount="{ data: payment }">
                                <span class="fw-bold text-success fs-5">
                                    ${{ payment.amount.toFixed(2) }}
                                </span>
                            </template>
                        </BaseTable>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import BaseTable from '@/components/base/BaseTable.vue';

const colDefs = [
    { field: 'payment_date', header: 'Date (កាលបរិច្ឆេទ)' },
    { field: 'payer_name', header: 'Monk (អ្នកបង់)' },
    { field: 'collector_name', header: 'Collected By (អ្នកប្រមូល)' },
    { field: 'cleared_absents', header: 'Cleared Absents (អវត្តមានដែលបានលុប)', align: 'center' },
    { field: 'amount', header: 'Amount Paid (ប្រាក់ដែលបានបង់)', align: 'end' }
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
const isLoading = ref(true);
const searchQuery = ref('');

const filteredPayments = computed(() => {
    if (!searchQuery.value) return payments.value;
    const query = searchQuery.value.toLowerCase();
    return payments.value.filter(p => 
        p.payer_name.toLowerCase().includes(query) || 
        p.collector_name.toLowerCase().includes(query)
    );
});

const totalPaidAmount = computed(() => {
    return filteredPayments.value.reduce((sum, p) => sum + p.amount, 0);
});

const totalClearedAbsents = computed(() => {
    return filteredPayments.value.reduce((sum, p) => sum + (p.cleared_absents || 0), 0);
});

const fetchData = async () => {
    isLoading.value = true;
    try {
        const params = {};
        if (props.seasonId) {
            params.retreat_event_id = props.seasonId;
        }
        const res = await api.get('/fines/report', { params });
        payments.value = res.data.data;
    } catch (error) {
        console.error('Failed to fetch payment report:', error);
        toast.showToast('Failed to load report', 'error');
    } finally {
        isLoading.value = false;
    }
};

const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB'); // DD/MM/YYYY
};

const formatTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

import { watch } from 'vue';

watch(() => props.seasonId, () => {
    fetchData();
});

onMounted(() => {
    fetchData();
});
</script>

<style scoped>
.stat-card {
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
    border: 1px solid var(--border-clr);
}
.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08) !important;
}
[data-theme="dark"] .stat-card:hover {
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35) !important;
}
.table-hover tbody tr:hover {
    background-color: var(--bs-light);
}
</style>
