<template>
    <div class="card" style="background-color: var(--surface-ground);">
        <!-- Filters Bar -->
        <div class="mb-2 d-flex flex-wrap justify-content-center align-items-center gap-2 w-100">
            <div class="input-group flex-grow-1" style="min-width: 200px; max-width: 400px;">
                <span class="input-group-text bg-white border-end-0 text-muted">
                    <Search size="18" />
                </span>
                <input type="text" class="form-control border-start-0 ps-0 shadow-none" placeholder="Search by name, kudi, phone..." v-model="searchQuery" style="outline: none; box-shadow: none;">
            </div>
            <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 flex-grow-1 flex-md-grow-0" style="min-width: 120px;" @click="fetchData">
                <RefreshCcw size="16" :class="{ 'fa-spin': isLoading }" />
                Refresh
            </button>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
                <BaseTable 
                    :columns="colDefs" 
                    :rows="paginatedMonks"
                    :totalRecords="filteredMonks.length"
                    v-model:page="currentPage"
                    v-model:perPage="perPage"
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
                        <div class="d-flex flex-column align-items-center gap-1">
                            <span v-if="row.permission > 0" class="badge bg-warning bg-opacity-10 text-dark px-2 py-1">{{ row.permission }}</span>
                            <span v-else class="text-muted">-</span>
                            <span v-if="row.pendingLeaves > 0" class="badge bg-info bg-opacity-10 text-info px-2 py-1" style="font-size: 0.7rem;">
                                {{ row.pendingLeaves }} Pending
                            </span>
                        </div>
                    </template>
                    
                    <template #fine="{ data: row }">
                        <span class="fw-bold" :class="row.fine > 0 ? 'text-danger' : 'text-success'">
                            ${{ row.fine }}
                        </span>
                        <div v-if="row.totalPaid > 0" class="small text-muted">
                            (Paid: ${{ row.totalPaid }})
                        </div>
                    </template>

                    <template #image="{ data: row }">
                        <div class="d-flex justify-content-center align-items-center">
                            <a v-if="row.leaveImages && row.leaveImages.length > 0" href="#" @click.prevent="openImageModal(`http://localhost:3006${row.leaveImages[0]}`)" class="d-block" title="Click to view full image">
                                <img :src="`http://localhost:3006${row.leaveImages[0]}`" alt="Leave Attachment" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; cursor: pointer; transition: transform 0.2s ease;" class="shadow-sm border border-secondary border-opacity-25 attachment-thumbnail" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
                            </a>
                            <span v-else class="text-muted">-</span>
                        </div>
                    </template>
                    
                    <template #actions="{ data: row }">
                        <BaseActionMenu :items="getActionItems(row)" />
                    </template>
                </BaseTable>
            </div>
        </div>
        
        <!-- Detail Modal -->
        <Teleport to="body">
        <div class="modal fade" id="detailModal" tabindex="-1" aria-hidden="true" ref="detailModalRef">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header border-bottom-0 pb-0">
                        <h5 class="modal-title fw-bold">Attendance Details - {{ selectedMonk?.name }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" @click="closeModal"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="isFetchingDetails" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        <div v-else-if="monkDetails.length === 0" class="text-center py-4 text-muted">
                            <i class="fas fa-info-circle mb-2 fs-3 text-secondary"></i>
                            <p class="mb-0">No absent or permission records found.</p>
                        </div>
                        <div v-else class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light text-muted" style="font-size: 0.85rem;">
                                    <tr>
                                        <th class="fw-medium">Date</th>
                                        <th class="fw-medium text-center">Status</th>
                                        <th class="fw-medium">Notes</th>
                                        <th class="fw-medium text-center">Attachment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(record, index) in monkDetails" :key="index">
                                        <td class="text-nowrap">{{ new Date(record.date).toLocaleDateString() }}</td>
                                        <td class="text-center">
                                            <span v-if="record.status === 'absent'" class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1">Absent</span>
                                            <span v-else-if="record.status === 'permission'" class="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25 px-2 py-1">Permission</span>
                                            <span v-else class="badge bg-secondary bg-opacity-10 text-secondary border px-2 py-1">{{ record.status }}</span>
                                        </td>
                                        <td class="small text-muted" style="max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="record.notes">
                                            {{ record.notes || '-' }}
                                        </td>
                                        <td class="text-center">
                                            <div class="d-flex justify-content-center align-items-center">
                                                <a v-if="record.image_url" href="#" @click.prevent="openImageModal(`http://localhost:3006${record.image_url}`)" class="d-block" title="Click to view full image">
                                                    <img :src="`http://localhost:3006${record.image_url}`" alt="Leave Attachment" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; cursor: pointer; transition: transform 0.2s ease;" class="shadow-sm border border-secondary border-opacity-25 attachment-thumbnail" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
                                                </a>
                                                <span v-else class="text-muted fst-italic">-</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer border-top-0 pt-0">
                        <button type="button" class="btn btn-light" data-bs-dismiss="modal" @click="closeModal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        </Teleport>

        <!-- Image Viewer Modal -->
        <Teleport to="body">
        <div class="modal fade" id="imageViewerModal" tabindex="-1" aria-hidden="true" ref="imageModalRef">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content border-0 shadow bg-transparent">
                    <div class="modal-header border-0 pb-0 justify-content-end">
                        <button type="button" class="btn-close btn-close-white shadow-none bg-white rounded-circle p-2 m-2" data-bs-dismiss="modal" @click="closeImageModal"></button>
                    </div>
                    <div class="modal-body text-center p-0">
                        <img v-if="currentImageModalUrl" :src="currentImageModalUrl" class="img-fluid rounded shadow" style="max-height: 80vh;" alt="Attachment View" />
                    </div>
                </div>
            </div>
        </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/api/api';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import BaseTable from '@/components/base/BaseTable.vue';
import { Eye, Banknote, Image, Search, RefreshCcw } from '@lucide/vue';
import * as bootstrap from 'bootstrap';

const authStore = useAuthStore();
const toast = useToastStore();
const allMonks = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');

// Details Modal State
const detailModalRef = ref(null);
let detailModalInstance = null;
const selectedMonk = ref(null);
const monkDetails = ref([]);
const isFetchingDetails = ref(false);

// Image Viewer State
const imageModalRef = ref(null);
let imageModalInstance = null;
const currentImageModalUrl = ref('');

const colDefs = computed(() => {
    const cols = [
        { field: 'name', header: 'Monk Name', sortable: true },
        { field: 'role', header: 'Role', sortable: true },
        { field: 'kudiNumber', header: 'Kudi', sortable: true, class: 'text-center' },
        { field: 'rowNumber', header: 'Row', sortable: true, class: 'text-center' },
        { field: 'seatNumber', header: 'Seat', sortable: true, class: 'text-center' },
        { field: 'phone', header: 'Phone', sortable: false },
        { field: 'absent', header: 'Absent', sortable: true, class: 'text-center' },
        { field: 'permission', header: 'Permission', sortable: true, class: 'text-center' },
        { field: 'image', header: 'Attachment', sortable: false, class: 'text-center' },
        { field: 'fine', header: 'Net Fine', sortable: true, class: 'text-center' }
    ];
    if ( authStore.isAttendanceTaker || authStore.isAdmin || authStore.isSuperAdmin) {
        cols.push({ field: 'actions', header: 'Actions', sortable: false, class: 'text-end' });
    }
    return cols;
});

const getActionItems = (row) => {
    const items = [
        {
            label: 'View Details',
            icon: Eye,
            iconClass: 'text-primary',
            command: () => viewDetails(row)
        }
    ];
    
    if (row.fine > 0 && authStore.isSuperAdmin) {
        items.push({
            label: 'Pay Fine',
            icon: Banknote,
            iconClass: 'text-danger',
            textClass: 'text-danger',
            command: () => payFine(row)
        });
    }
    
    return items;
};

const filteredMonks = computed(() => {
    let filtered = allMonks.value.filter(m => m.absent > 0 || m.permission > 0 || m.pendingLeaves > 0);
    
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(m => 
            (m.name && m.name.toLowerCase().includes(query)) ||
            (m.kudiNumber && String(m.kudiNumber).toLowerCase().includes(query)) ||
            (m.phone && m.phone.toLowerCase().includes(query))
        );
    }
    
    return filtered;
});

const currentPage = ref(1);
const perPage = ref(10);

const paginatedMonks = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    const end = start + perPage.value;
    return filteredMonks.value.slice(start, end);
});

const payFine = async (row) => {
    const amount = prompt(`How much is ${row.name} paying? (Enter 5, 10, or 15)\\nCurrent Owed: $${row.fine}`, "5");
    if (!amount) return;
    
    const parsedAmount = parseInt(amount);
    if (![5, 10, 15].includes(parsedAmount)) {
        toast.showToast('Invalid amount. Must be 5, 10, or 15.', 'error');
        return;
    }
    
    if (parsedAmount > row.fine) {
        const confirmOverpay = confirm(`They only owe $${row.fine}. Are you sure you want to record a $${parsedAmount} payment?`);
        if (!confirmOverpay) return;
    }
    
    try {
        await api.post('/ledger/pay', {
            user_id: row.id,
            amount_paid: parsedAmount
        });
        toast.showToast(`Recorded $${parsedAmount} payment for ${row.name}`, 'success');
        fetchData();
    } catch (error) {
        console.error('Payment error:', error);
        toast.showToast(error.response?.data?.message || 'Failed to record payment', 'error');
    }
};

// View Details Modal Functions
const viewDetails = async (monk) => {
    selectedMonk.value = monk;
    if (!detailModalInstance && detailModalRef.value) {
        detailModalInstance = new bootstrap.Modal(detailModalRef.value);
    }
    detailModalInstance?.show();
    
    isFetchingDetails.value = true;
    monkDetails.value = [];
    
    try {
        const response = await api.get('/attendances', {
            params: { user_id: monk.id }
        });
        
        let records = response.data?.data || response.data || [];
        // Only show absent and permission in this details modal (exclude 'present' if there is any)
        records = records.filter(r => r.status === 'absent' || r.status === 'permission');
        
        // Sort by date descending
        records.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        monkDetails.value = records;
    } catch (error) {
        console.error('Failed to fetch details:', error);
        toast.showToast('Failed to load attendance details', 'error');
    } finally {
        isFetchingDetails.value = false;
    }
};

const closeModal = () => {
    detailModalInstance?.hide();
};

// Image Viewer Modal Functions
const openImageModal = (url) => {
    currentImageModalUrl.value = url;
    if (!imageModalInstance && imageModalRef.value) {
        imageModalInstance = new bootstrap.Modal(imageModalRef.value);
    }
    imageModalInstance?.show();
};

const closeImageModal = () => {
    imageModalInstance?.hide();
};

const fetchData = async () => {
    isLoading.value = true;
    try {
        const [summaryRes, rowsRes] = await Promise.all([
            api.get('/attendances/admin/summary'),
            api.get('/seating-rows')
        ]);
        
        let monks = summaryRes.data?.data || summaryRes.data || [];
        const rawRows = rowsRes.data?.data || rowsRes.data || [];
        
        if (!false) {
            const role = authStore.userRole ? authStore.userRole.toUpperCase() : '';
            if (role === 'MEKUDI' || role === 'ADMIN') {
                const myKutName = authStore.user?.UserProfile?.Kut?.name || authStore.user?.UserProfile?.kut_id;
                if (myKutName) {
                    monks = monks.filter(m => m.kudiNumber == myKutName || m.profile?.kut_id == myKutName);
                } else {
                    if (role !== 'ADMIN') monks = [];
                }
            } else if (role === 'ATTENDANCETAKER') {
                const myRows = rawRows.filter(r => r.assigned_taker_id == authStore.user.id);
                const myRowNumbers = myRows.map(r => r.row_num);
                monks = monks.filter(m => myRowNumbers.some(num => num == m.rowNumber));
            } else {
                monks = [];
            }
        }
        
        allMonks.value = monks;
    } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.showToast('Failed to load absence data', 'error');
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
