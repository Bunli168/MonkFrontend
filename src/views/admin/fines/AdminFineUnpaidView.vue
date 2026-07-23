<template>
    <div :class="isComponent ? '' : 'admin-fines-unpaid bg-light min-vh-100'">
        <!-- Header -->
        <div v-if="!isComponent" class="bg-white border-bottom sticky-top shadow-sm" style="z-index: 1020;">
            <div class="d-flex align-items-center p-3 gap-3">
                <button class="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;" @click="$router.push('/dashboard')">
                    <i class="fas fa-arrow-left text-secondary"></i>
                </button>
                <div>
                    <h5 class="mb-0 fw-bold text-dark">Unpaid Fines</h5>
                    <p class="text-muted small mb-0">Monks who currently owe money for absences.</p>
                </div>
            </div>
            
            <!-- Actions Bar -->
            <div class="px-3 pb-3 d-flex justify-content-end align-items-center gap-3">
                <div class="position-relative ms-auto" style="width: 100%; max-width: 400px;">
                    <i class="fas fa-search position-absolute text-muted" style="left: 15px; top: 50%; transform: translateY(-50%);"></i>
                    <input type="text" class="form-control rounded-pill ps-5 bg-light border-0" placeholder="Search monk name..." v-model="searchQuery">
                </div>
            </div>
        </div>

        <div v-else class="mb-3 d-flex justify-content-end align-items-center gap-3">
            <div class="position-relative ms-auto" style="width: 100%; max-width: 400px;">
                <i class="fas fa-search position-absolute text-muted" style="left: 15px; top: 50%; transform: translateY(-50%);"></i>
                <input type="text" class="form-control rounded-pill ps-5 bg-light border-0" placeholder="Search monk name..." v-model="searchQuery">
            </div>
        </div>

        <div :class="isComponent ? '' : 'container-fluid p-3 p-md-4'">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="card-body p-0">
                    <div v-if="isLoading" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="mt-2 text-muted">Loading records...</p>
                    </div>

                    <div v-else-if="filteredMonks.length === 0" class="text-center py-5 text-muted">
                        <i class="fas fa-check-circle text-success mb-3" style="font-size: 3rem;"></i>
                        <h5>All Clear!</h5>
                        <p>No monks currently have 9 or more absences.</p>
                    </div>

                    <div v-else>
                        <BaseTable 
                            :columns="colDefs" 
                            :rows="filteredMonks" 
                            :loading="isLoading"
                            :show-index="true"
                        >
                            <template #monk_name="{ data: monk }">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="avatar rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style="width: 40px; height: 40px;">
                                        {{ monk.fullName.charAt(0) }}
                                    </div>
                                    <div>
                                        <div class="fw-bold text-dark">{{ monk.fullName }}</div>
                                        <div class="d-flex align-items-center gap-2 small text-muted mt-1">
                                            <span><i class="fas fa-phone-alt"></i> {{ monk.phone || monk.chhaya_number || 'N/A' }}</span>
                                            <span>&bull;</span>
                                            <span>Kudi: <span class="fw-medium">{{ monk.kudiNumber || '-' }}</span></span>
                                            <span>&bull;</span>
                                            <span>Row: <span class="fw-medium">{{ monk.rowNumber || '-' }}</span></span>
                                            <span>&bull;</span>
                                            <span>Seat: <span class="fw-medium">{{ monk.seatNumber || '-' }}</span></span>
                                        </div>
                                    </div>
                                </div>
                            </template>
                            
                            <template #grossAbsents="{ data: monk }">
                                <span class="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-2">
                                    {{ monk.grossAbsents }}
                                </span>
                            </template>
                            
                            <template #clearedAbsents="{ data: monk }">
                                <span class="fw-bold text-success fs-5">
                                    {{ monk.clearedAbsents }}
                                </span>
                            </template>
                            
                            <template #netAbsents="{ data: monk }">
                                <span class="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2 fw-bold">
                                    {{ monk.netAbsents }}
                                </span>
                            </template>
                            
                            <template #fineOwed="{ data: monk }">
                                <span class="fw-bold text-danger fs-5">
                                    ${{ monk.fineOwed }}
                                </span>
                            </template>
                            
                            <template #action="{ data: monk }">
                                <button 
                                    class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                                    @click="payFine(monk)"
                                    :disabled="isPaying === monk.id"
                                >
                                    <span v-if="isPaying === monk.id" class="spinner-border spinner-border-sm"></span>
                                    <span v-else>Pay $5</span>
                                </button>
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
import { useAuthStore } from '@/stores/auth';
import BaseTable from '@/components/base/BaseTable.vue';

const props = defineProps({
    isComponent: {
        type: Boolean,
        default: false
    }
});

const toast = useToastStore();
const authStore = useAuthStore();
const unpaidMonks = ref([]);
const isLoading = ref(true);
const isPaying = ref(null);
const searchQuery = ref('');

const canManageFines = computed(() => {
    // Only attendance takers and admins can manage fines, not SuperAdmin
    return !false;
});

const colDefs = computed(() => {
    const cols = [
        { field: 'monk_name', header: 'Monk Name (ឈ្មោះ)' },
        { field: 'grossAbsents', header: 'Gross Absents (សរុបអវត្តមាន)', align: 'center' },
        { field: 'clearedAbsents', header: 'Cleared (លុបចោល)', align: 'center' },
        { field: 'netAbsents', header: 'Net Absents (អវត្តមានជាក់ស្តែង)', align: 'center' },
        { field: 'fineOwed', header: 'Fine Owed (ប្រាក់ពិន័យជំពាក់)', align: 'end' }
    ];
    if (canManageFines.value) {
        cols.push({ field: 'action', header: 'Action (សកម្មភាព)', align: 'center' });
    }
    return cols;
});

const filteredMonks = computed(() => {
    // Backend already filters m.grossAbsents >= 9, but keeping this for safety
    let monks = unpaidMonks.value.filter(m => m.grossAbsents >= 9);
    
    if (!searchQuery.value) return monks;
    const query = searchQuery.value.toLowerCase();
    return monks.filter(m => m.fullName.toLowerCase().includes(query));
});

const fetchData = async () => {
    isLoading.value = true;
    try {
        const res = await api.get('/fines/unpaid');
        unpaidMonks.value = res.data.data;
    } catch (error) {
        console.error('Failed to fetch unpaid fines:', error);
        toast.showToast('Failed to fetch records', 'error');
    } finally {
        isLoading.value = false;
    }
};

const payFine = async (monk) => {
    if (!confirm(`Are you sure you want to record a $5 payment for ${monk.fullName}? This will clear 3 absents.`)) return;
    
    isPaying.value = monk.id;
    try {
        await api.post(`/fines/${monk.id}/pay`);
        toast.showToast(`$5 payment recorded for ${monk.fullName}`, 'success');
        fetchData(); // Refresh list to see updated amounts
    } catch (error) {
        console.error('Failed to record payment:', error);
        toast.showToast('Failed to record payment', 'error');
    } finally {
        isPaying.value = null;
    }
};

onMounted(() => {
    fetchData();
});
</script>

<style scoped>
.table-hover tbody tr:hover {
    background-color: var(--bs-light);
}
</style>
