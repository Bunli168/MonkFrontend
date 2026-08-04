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


            <!-- Search Bar -->
            <div class="search-strip mb-4">
                <div class="search-input-wrap">
                    <i class="fas fa-search search-icon"></i>
                    <input
                        type="text"
                        class="search-input"
                        placeholder="Search by payer or collector…"
                        v-model="searchQuery"
                    />
                    <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">
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
                                        {{ payment.payer_name.charAt(0) }}
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
                                    ${{ payment.amount.toFixed(2) }}
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
import { ref, computed, onMounted } from 'vue';
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
/* ══════════════════════════════════
   SUMMARY STRIP
══════════════════════════════════ */
.summary-strip {
    display: flex;
    align-items: stretch;
    background: var(--surface-card, #fff);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.summary-item {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px 24px;
    position: relative;
    overflow: hidden;
    transition: background 0.2s ease;
}
.summary-item:hover {
    background: var(--surface-ground, #f8f9fa);
}

.summary-item__icon {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
}

.summary-item--green .summary-item__icon {
    background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.06));
    color: #059669;
    border: 1px solid rgba(16,185,129,0.2);
}
.summary-item--green .summary-item__value { color: #059669; }
.summary-item--green .summary-item__glow {
    background: radial-gradient(circle at 100% 0%, rgba(16,185,129,0.12) 0%, transparent 65%);
}

.summary-item--blue .summary-item__icon {
    background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.06));
    color: #6366f1;
    border: 1px solid rgba(99,102,241,0.2);
}
.summary-item--blue .summary-item__value { color: #6366f1; }
.summary-item--blue .summary-item__glow {
    background: radial-gradient(circle at 100% 0%, rgba(99,102,241,0.1) 0%, transparent 65%);
}

.summary-item--teal .summary-item__icon {
    background: linear-gradient(135deg, rgba(14,165,233,0.15), rgba(14,165,233,0.06));
    color: #0284c7;
    border: 1px solid rgba(14,165,233,0.2);
}
.summary-item--teal .summary-item__value { color: #0284c7; }
.summary-item--teal .summary-item__glow {
    background: radial-gradient(circle at 100% 0%, rgba(14,165,233,0.1) 0%, transparent 65%);
}

.summary-item__glow {
    position: absolute;
    top: 0; right: 0;
    width: 120px; height: 100%;
    pointer-events: none;
}

.summary-item__body { flex: 1; }
.summary-item__label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-color-secondary, #6b7280);
    margin-bottom: 2px;
}
.summary-item__value {
    font-size: 1.65rem;
    font-weight: 700;
    line-height: 1.1;
}
.summary-item__sub {
    font-size: 0.75rem;
    color: var(--text-color-secondary, #9ca3af);
    margin-top: 3px;
}

.summary-divider {
    width: 1px;
    background: var(--border-color, #e5e7eb);
    margin: 12px 0;
    flex-shrink: 0;
}

/* ══════════════════════════════════
   SEARCH STRIP
══════════════════════════════════ */
.search-strip {
    display: flex;
    align-items: center;
    gap: 12px;
}
.search-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 380px;
    background: var(--surface-card, #fff);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    transition: border-color 0.2s, box-shadow 0.2s;
}
.search-input-wrap:focus-within {
    border-color: var(--primary-color, #6366f1);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #6366f1) 12%, transparent);
}
.search-icon {
    padding: 0 12px;
    color: var(--text-color-secondary, #9ca3af);
    font-size: 0.85rem;
    pointer-events: none;
    flex-shrink: 0;
}
.search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    padding: 10px 0;
    font-size: 0.875rem;
    color: var(--text-color, #111);
}
.search-clear {
    padding: 0 12px;
    background: none;
    border: none;
    color: var(--text-color-secondary, #9ca3af);
    cursor: pointer;
    font-size: 0.8rem;
    line-height: 1;
}
.search-clear:hover { color: var(--text-color, #374151); }

/* Responsive */
@media (max-width: 640px) {
    .summary-strip { flex-direction: column; }
    .summary-divider { width: 100%; height: 1px; margin: 0 12px; width: calc(100% - 24px); }
    .search-input-wrap { max-width: 100%; }
}

/* ══════════════════════════════════
   TOTAL FOOTER
══════════════════════════════════ */
.total-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0;
    padding: 14px 20px;
    border-top: 1px solid var(--border-color, #e5e7eb);
    background: color-mix(in srgb, var(--surface-ground, #f8f9fa) 60%, transparent);
    flex-wrap: wrap;
    gap: 0;
}

/* BaseTable Action Fixes */
:deep(.cell-value .btn-group) {
    justify-content: flex-end;
}

@media screen and (max-width: 767.98px) {
    :deep(td.mobile-stack .cell-content) {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 0.25rem !important;
    }
    :deep(td.mobile-stack .cell-value) {
        justify-content: flex-start !important;
        align-items: flex-start !important;
        flex-direction: column !important;
        text-align: left !important;
        width: 100% !important;
        gap: 0.15rem;
    }
}

.total-footer__item {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: 4px 20px;
}
.total-footer__item--highlight {
    background: color-mix(in srgb, var(--success-color, #059669) 8%, transparent);
    border-radius: 10px;
    padding: 6px 16px;
    border: 1px solid color-mix(in srgb, var(--success-color, #059669) 20%, transparent);
}
.total-footer__label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-color-secondary, #9ca3af);
}
.total-footer__value {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-heading-color, #111);
    margin-top: 1px;
}
.total-footer__value--big {
    font-size: 1.2rem;
    color: var(--success-color, #059669);
}
.total-footer__divider {
    width: 1px;
    height: 36px;
    background: var(--border-color, #e5e7eb);
    margin: 0 4px;
    flex-shrink: 0;
}
@media (max-width: 640px) {
    .total-footer { justify-content: flex-start; }
    .total-footer__item { align-items: flex-start; padding: 6px 12px; }
}
</style>
