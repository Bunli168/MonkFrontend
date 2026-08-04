<template>
    <div class="taker-absent-permission-view py-4">
        <!-- Header Section -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div>
                <h4 class="fw-bold mb-1">Unpaid Fines</h4>
                <p class="text-muted mb-0">View and manage monks who have outstanding fines.</p>
            </div>
            
            <div class="d-flex flex-wrap align-items-center gap-2 flex-grow-1 justify-content-md-end w-100 mt-3 mt-md-0">
                <div class="input-group flex-grow-1 flex-md-grow-0" style="max-width: 400px; min-width: 200px;">
                    <span class="input-group-text bg-white border-end-0 text-muted">
                        <i class="fas fa-search"></i>
                    </span>
                    <input type="text" class="form-control border-start-0 ps-0" placeholder="Search by name, kudi, phone..." v-model="searchQuery">
                </div>
                <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 flex-grow-1 flex-md-grow-0" style="min-width: 120px;" @click="fetchData">
                    <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
                    Refresh
                </button>
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
                <BaseTable 
                    :columns="colDefs" 
                    :rows="filteredMonks" 
                    :loading="isLoading"
                    :show-index="true"
                >
                    <template #name="{ data: row }">
                        <div class="d-flex align-items-center gap-3">
                            <div class="avatar bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 35px; height: 35px; font-size: 0.9rem;">
                                {{ row.name ? row.name.charAt(0) : 'U' }}
                            </div>
                            <span class="fw-medium">{{ row.name }}</span>
                        </div>
                    </template>
                    
                    <template #role="{ data: row }">
                        <span class="badge bg-secondary bg-opacity-10 text-secondary">{{ row.role }}</span>
                    </template>
                    
                    <template #absent="{ data: row }">
                        <span class="badge bg-danger bg-opacity-10 text-danger px-2 py-1">{{ row.absent }}</span>
                    </template>
                    
                    <template #permission="{ data: row }">
                        <span class="badge bg-warning bg-opacity-10 text-dark px-2 py-1">{{ row.permission }}</span>
                    </template>
                    
                    <template #fine="{ data: row }">
                        <span class="fw-bold" :class="row.fine > 0 ? 'text-danger' : 'text-success'">
                            ${{ row.fine }}
                        </span>
                        <div v-if="row.totalPaid > 0" class="small text-muted">
                            (Paid: ${{ row.totalPaid }})
                        </div>
                    </template>
                    
                    <template #actions="{ data: row }">
                        <button v-if="row.fine > 0" class="btn btn-sm btn-primary d-flex align-items-center gap-1" @click="openPaymentModal(row)">
                            <i class="fas fa-money-bill-wave"></i> Pay
                        </button>
                    </template>
                </BaseTable>
            </div>
        </div>

        <BaseModal v-model="showPaymentModal" title="Record Payment" size="sm">
            <div v-if="selectedMonk">
                <div class="alert alert-info py-2 small mb-3">
                    <strong>{{ selectedMonk.name }}</strong> currently owes <strong class="text-danger">${{ selectedMonk.fine }}</strong>.
                </div>
                
                <div class="mb-3">
                    <label class="form-label small fw-bold text-muted">Amount to Pay ($)</label>
                    <select class="form-select" v-model="paymentForm.amount">
                        <option value="5">$5</option>
                        <option value="10">$10</option>
                        <option value="15">$15</option>
                    </select>
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4">
                    <button class="btn btn-outline-secondary" @click="showPaymentModal = false">Cancel</button>
                    <button class="btn btn-primary" @click="submitPayment" :disabled="isSubmittingPayment">
                        <span v-if="isSubmittingPayment" class="spinner-border spinner-border-sm me-1"></span>
                        Save Payment
                    </button>
                </div>
            </div>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseModal from '@/components/base/BaseModal.vue';

const toast = useToastStore();
const allMonks = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');

const showPaymentModal = ref(false);
const isSubmittingPayment = ref(false);
const selectedMonk = ref(null);
const paymentForm = ref({
    amount: "5",
    education_year_id: ""
});

const colDefs = computed(() => {
    return [
        { field: 'name', header: 'Monk Name', sortable: true },
        { field: 'role', header: 'Role', sortable: true },
        { field: 'kudiNumber', header: 'Kudi', sortable: true, class: 'text-center' },
        { field: 'phone', header: 'Phone', sortable: false },
        { field: 'absent', header: 'Absent', sortable: true, class: 'text-center' },
        { field: 'permission', header: 'Permission', sortable: true, class: 'text-center' },
        { field: 'fine', header: 'Net Fine', sortable: true, class: 'text-center' },
        { field: 'actions', header: 'Actions', sortable: false, class: 'text-end' }
    ];
});

const filteredMonks = computed(() => {
    let filtered = allMonks.value.filter(m => m.fine > 0);
    
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(m => 
            (m.name && m.name.toLowerCase().includes(query)) ||
            (m.kudiNumber && m.kudiNumber.toLowerCase().includes(query)) ||
            (m.phone && m.phone.toLowerCase().includes(query))
        );
    }
    
    return filtered;
});

const openPaymentModal = (row) => {
    selectedMonk.value = row;
    paymentForm.value = { amount: "5" };
    showPaymentModal.value = true;
};

const submitPayment = async () => {
    if (!selectedMonk.value) return;
    
    const parsedAmount = parseInt(paymentForm.value.amount);
    
    if (parsedAmount > selectedMonk.value.fine) {
        const confirmOverpay = confirm(`They only owe $${selectedMonk.value.fine}. Are you sure you want to record a $${parsedAmount} payment?`);
        if (!confirmOverpay) return;
    }
    
    isSubmittingPayment.value = true;
    try {
        await api.post('/ledger/pay', {
            user_id: selectedMonk.value.id,
            amount_paid: parsedAmount
        });
        toast.showToast(`Recorded $${parsedAmount} payment for ${selectedMonk.value.name}`, 'success');
        showPaymentModal.value = false;
        fetchData();
    } catch (error) {
        console.error('Payment error:', error);
        toast.showToast(error.response?.data?.message || 'Failed to record payment', 'error');
    } finally {
        isSubmittingPayment.value = false;
    }
};

const fetchData = async () => {
    isLoading.value = true;
    try {
        const response = await api.get('/attendances/admin/summary');
        allMonks.value = response.data?.data || response.data || [];
    } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.showToast('Failed to load data', 'error');
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchData();
});
</script>

<style scoped>
</style>
