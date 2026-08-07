<template>
    <div class="pagoda-leave-requests-view py-4">
        <!-- Inner Tabs for Leave Requests and Register Seat -->
        <div class="mb-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 w-100">
            <div class="d-flex align-items-center flex-wrap flex-md-nowrap gap-2">
                <BaseFilter v-model="innerTab" :options="innerTabOptions" :wrap="true" class="w-100 w-md-auto" />
            </div>
            
            <div class="d-flex align-items-center flex-wrap flex-md-nowrap gap-2 mt-2 mt-md-0">
                <BaseButton v-if="!authStore.isAttendanceTaker" variant="badge" type="button" @click="showScanModal = true" class="flex-grow-1 flex-md-grow-0 text-nowrap justify-content-center">
                    <i class="fas fa-qrcode text-primary"></i> Scan Attendance
                </BaseButton>
                <BaseButton v-if="innerTab === 'leave-requests'" variant="badge primary active" type="button" @click="showForm = true" class="flex-grow-1 flex-md-grow-0 text-nowrap justify-content-center">
                    <i class="fas fa-plus text-primary"></i> New Request
                </BaseButton>
            </div>
        </div>

        <div v-if="innerTab === 'leave-requests'">
            <BaseModal v-model="showForm" :title="isEditing ? 'Edit Leave Request' : 'New Leave Request'" size="lg">
                <div class="px-2">
                    <form @submit.prevent="submitRequest">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <BaseDatePicker 
                                    label="Start Date" 
                                    v-model="formData.start_date" 
                                    required 
                                    :minDate="today"
                                    :disabledDates="requestedDates"
                                />
                            </div>
                            <div class="col-md-6">
                                <BaseDatePicker 
                                    label="End Date" 
                                    v-model="formData.end_date" 
                                    required 
                                    :minDate="formData.start_date || today"
                                    :disabledDates="requestedDates"
                                />
                            </div>
                            <div class="col-12">
                                <label class="form-label fw-medium">Reason for Leave</label>
                                <textarea class="form-control" v-model="formData.reason" rows="3" required placeholder="Please explain why you need to take leave..."></textarea>
                            </div>
                            <div class="col-12">
                                <label class="form-label fw-medium mt-2">Attachment (Optional)</label>
                                <input type="file" class="form-control" @change="handleFileChange" accept="image/*" />
                            </div>
                            <div class="col-12 d-flex justify-content-end gap-2 mt-4">
                                <button type="button" class="btn btn-light border" @click="cancelForm">Cancel</button>
                                <button type="submit" class="btn btn-primary d-flex align-items-center gap-2" :disabled="isSubmitting">
                                    <i class="fas fa-paper-plane" v-if="!isSubmitting"></i>
                                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Submit Request
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </BaseModal>

            <div class="card border-0 shadow-sm" style="background-color: var(--surface-card);">
                <div class="card-header bg-transparent border-bottom py-3">
                    <h5 class="mb-0 fw-bold" style="color: var(--text-heading-color);">My Requests History</h5>
                </div>
                <div class="card-body p-0">
                    <BaseTable 
                        :columns="colDefs" 
                        :rows="paginatedRequests" 
                        :totalRecords="myRequests.length"
                        :loading="isLoading"
                        :show-index="true"
                        :page="currentPage"
                        :perPage="perPage"
                        @update:page="currentPage = $event"
                        @update:perPage="perPage = $event"
                    >
                        <template #date_range="{ data: row }">
                            <span>{{ formatDate(row.start_date) }} <i class="fas fa-arrow-right text-muted mx-1"></i> {{ formatDate(row.end_date) }}</span>
                        </template>
                        <template #reason="{ data: row }">
                            <div class="text-truncate" style="max-width: 250px;" :title="row.reason">
                                {{ row.reason || '—' }}
                            </div>
                        </template>
                        <template #status="{ data: row }">
                            <div class="d-flex justify-content-center">
                                <BaseBadge v-if="row.status" :status="row.status" :label="formatStatus(row.status)" />
                                <span v-else>—</span>
                            </div>
                        </template>
                        <template #attachment="{ data: row }">
                            <div class="d-flex justify-content-start align-items-center">
                                <a v-if="row.image_url" href="#" @click.prevent="openImageModal(`https://neakavorn.work.gd${row.image_url}`)" class="d-block" title="Click to view full image">
                                    <img :src="`https://neakavorn.work.gd${row.image_url}`" alt="Leave Attachment" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; cursor: pointer; transition: transform 0.2s ease;" class="shadow-sm border border-secondary border-opacity-25 attachment-thumbnail" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
                                </a>
                                <span v-else class="text-muted fst-italic">-</span>
                            </div>
                        </template>
                        <template #approved_by="{ data: row }">
                            <span v-if="row.Approver && row.status !== 'pending'" class="text-muted">
                                {{ row.Approver.UserProfile?.first_name_kh }} {{ row.Approver.UserProfile?.last_name_kh }}
                            </span>
                            <span v-else class="text-muted fst-italic">N/A</span>
                        </template>
                        <template #actions="{ data: row }">
                            <BaseActionMenu v-if="getActionItems(row).length > 0" :items="getActionItems(row)" />
                        </template>
                    </BaseTable>
                </div>
            </div>
        </div>

        <PagodaRegisterSeatView v-if="innerTab === 'register-seat'" />

        <BaseModal v-model="showScanModal" title="Scan Attendance" size="lg">
            <PagodaSelfScanView @close="showScanModal = false" />
        </BaseModal>

        <BaseModal v-model="showConfirmModal" title="Confirm Action" size="sm">
            <p class="mb-4 text-muted fw-medium">Are you sure you want to delete this leave request?</p>
            <div class="d-flex justify-content-end gap-2">
                <BaseButton type="button" variant="outline" @click="showConfirmModal = false">Cancel</BaseButton>
                <BaseButton type="button" variant="danger" :isLoading="isDeleting" @click="executeDelete">
                    Delete
                </BaseButton>
            </div>
        </BaseModal>

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
import { useToastStore } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseFilter from '@/components/base/BaseFilter.vue';
import PagodaRegisterSeatView from './PagodaRegisterSeatView.vue';
import PagodaSelfScanView from './PagodaSelfScanView.vue';
import BaseBadge from '@/components/base/BaseBadge.vue';
import BaseActionMenu from '@/components/base/BaseActionMenu.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseDatePicker from '@/components/base/BaseDatePicker.vue';
import { FileEdit, Trash2 } from '@lucide/vue';
import * as bootstrap from 'bootstrap';

const toast = useToastStore();
const authStore = useAuthStore();
const showForm = ref(false);
const showScanModal = ref(false);

const innerTab = ref('leave-requests');
const innerTabOptions = computed(() => {
    const options = [
        { label: 'Leave Requests', value: 'leave-requests' }
    ];
    if (!authStore.isAttendanceTaker) {
        options.push({ label: 'Register Seat', value: 'register-seat' });
    }
    return options;
});
const isSubmitting = ref(false);
const isLoading = ref(false);
const myRequests = ref([]);

const isEditing = ref(false);
const editId = ref(null);

const showConfirmModal = ref(false);
const isDeleting = ref(false);
const deleteId = ref(null);

const currentPage = ref(1);
const perPage = ref(10);

const paginatedRequests = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    const end = start + perPage.value;
    return myRequests.value.slice(start, end);
});

const requestedDates = computed(() => {
    const dates = [];
    myRequests.value.forEach(req => {
        if (req.status === 'rejected') return;
        if (isEditing.value && req.id === editId.value) return; // Don't disable dates for the current request being edited

        const start = new Date(req.start_date);
        const end = new Date(req.end_date);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            dates.push(`${y}-${m}-${day}`);
        }
    });
    return dates;
});

const today = new Date().toISOString().split('T')[0];

const formData = ref({
    start_date: '',
    end_date: '',
    reason: '',
    image: null
});

// Image Viewer State
const imageModalRef = ref(null);
let imageModalInstance = null;
const currentImageModalUrl = ref('');

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        formData.value.image = file;
    } else {
        formData.value.image = null;
    }
};

const colDefs = computed(() => {
    return [
        { field: 'date_range', header: 'Date Range', sortable: false },
        { field: 'reason', header: 'Reason', sortable: false },
        { field: 'attachment', header: 'Attachment', sortable: false },
        { field: 'status', header: 'Status', sortable: true, class: 'text-center' },
        { field: 'approved_by', header: 'Reviewed By', sortable: false },
        { field: 'actions', header: 'Actions', sortable: false, class: 'text-end' }
    ];
});

const formatStatus = (status) => {
    if (!status) return '';
    if (status === 'pending_mekudi' || status === 'pending_superadmin' || status === 'pending') return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
};

const fetchRequests = async () => {
    isLoading.value = true;
    try {
        const response = await api.get('/leave-requests/my');
        myRequests.value = response.data || [];
    } catch (error) {
        console.error('Failed to load leave requests:', error);
        toast.showToast('Failed to load requests', 'error');
    } finally {
        isLoading.value = false;
    }
};

const getActionItems = (row) => {
    if (row.status === 'approved' || row.status === 'rejected') return [];
    return [
        {
            label: 'Edit',
            icon: FileEdit,
            iconClass: 'text-primary',
            command: () => openEdit(row)
        },
        {
            label: 'Delete',
            icon: Trash2,
            iconClass: 'text-danger',
            command: () => openDelete(row.id)
        }
    ];
};

const openEdit = (row) => {
    isEditing.value = true;
    editId.value = row.id;
    formData.value = {
        start_date: new Date(row.start_date).toISOString().split('T')[0],
        end_date: new Date(row.end_date).toISOString().split('T')[0],
        reason: row.reason
    };
    showForm.value = true;
};

const openDelete = (id) => {
    deleteId.value = id;
    showConfirmModal.value = true;
};

const executeDelete = async () => {
    isDeleting.value = true;
    try {
        await api.delete(`/leave-requests/${deleteId.value}`);
        toast.showToast('Leave request deleted successfully', 'success');
        showConfirmModal.value = false;
        fetchRequests();
    } catch (error) {
        console.error('Failed to delete request:', error);
        toast.showToast(error.response?.data?.message || 'Failed to delete request', 'error');
    } finally {
        isDeleting.value = false;
    }
};

const openImageModal = (url) => {
    currentImageModalUrl.value = url;
    if (!imageModalInstance && imageModalRef.value) {
        imageModalInstance = new bootstrap.Modal(imageModalRef.value);
    }
    imageModalInstance?.show();
};

const closeImageModal = () => {
    imageModalInstance?.hide();
    setTimeout(() => {
        currentImageModalUrl.value = '';
    }, 300);
};

const cancelForm = () => {
    showForm.value = false;
    isEditing.value = false;
    editId.value = null;
    formData.value = {
        start_date: '',
        end_date: '',
        reason: '',
        image: null
    };
};

const submitRequest = async () => {
    isSubmitting.value = true;
    try {
        const payloadData = new FormData();
        payloadData.append('start_date', new Date(formData.value.start_date).toISOString().split('T')[0]);
        payloadData.append('end_date', new Date(formData.value.end_date).toISOString().split('T')[0]);
        payloadData.append('reason', formData.value.reason);
        if (formData.value.image) {
            payloadData.append('image', formData.value.image);
        }

        if (isEditing.value) {
            await api.put(`/leave-requests/${editId.value}`, payloadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.showToast('Leave request updated successfully', 'success');
        } else {
            await api.post('/leave-requests', payloadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.showToast('Leave request submitted successfully', 'success');
        }
        
        cancelForm();
        fetchRequests();
    } catch (error) {
        console.error('Failed to submit request:', error);
        toast.showToast(error.response?.data?.message || 'Failed to submit request', 'error');
    } finally {
        isSubmitting.value = false;
    }
};

onMounted(() => {
    fetchRequests();
});

defineExpose({
    showForm
});
</script>

<style scoped>
textarea {
    resize: none;
}
</style>
