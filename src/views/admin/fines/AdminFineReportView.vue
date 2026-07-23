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
            <!-- Beautiful Big Metric Card for Total Amount -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card border-0 rounded-4 shadow-sm overflow-hidden" style="background: linear-gradient(135deg, var(--success-color, #198754) 0%, color-mix(in srgb, var(--success-color, #198754) 70%, black) 100%);">
                        <div class="card-body p-4 d-flex align-items-center justify-content-between position-relative">
                            <!-- Background Icon -->
                            <i class="fas fa-coins position-absolute" style="font-size: 10rem; right: -20px; bottom: -30px; opacity: 0.1; color: white;"></i>
                            
                            <div class="position-relative" style="z-index: 1;">
                                <div class="d-flex align-items-center gap-2 mb-2">
                                    <div class="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; backdrop-filter: blur(4px);">
                                        <i class="fas fa-hand-holding-usd fs-5 text-white"></i>
                                    </div>
                                    <h6 class="text-white text-opacity-75 text-uppercase fw-bold mb-0" style="letter-spacing: 1px;">Total Fines Collected</h6>
                                </div>
                                <h1 class="display-4 fw-bold text-white mb-0" style="text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${{ totalPaidAmount.toFixed(2) }}</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mb-3 d-flex flex-wrap align-items-center gap-3">
                <div class="position-relative flex-grow-1">
                    <i class="fas fa-search position-absolute text-muted" style="left: 15px; top: 50%; transform: translateY(-50%);"></i>
                    <input type="text" class="form-control rounded-pill ps-5 bg-light border-0 py-2 shadow-sm" placeholder="Search payer or collector..." v-model="searchQuery">
                </div>
            </div>


            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="card-body p-0">
                    <div v-if="isLoading" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="mt-2 text-muted">Loading report...</p>
                    </div>

                    <div v-else-if="filteredPayments.length === 0" class="text-center py-5 text-muted">
                        <i class="fas fa-file-invoice mb-3" style="font-size: 3rem;"></i>
                        <h5>No Payments Found</h5>
                        <p>There are no recorded payments matching your search.</p>
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
.table-hover tbody tr:hover {
    background-color: var(--bs-light);
}
</style>
