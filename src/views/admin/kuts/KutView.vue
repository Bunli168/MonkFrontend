<template>
    <div class="kudi-management-container">
        <!-- Header -->
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <h6 class="fw-bold m-0 text-heading">Kudi Management / គ្រប់គ្រងកុដិ</h6>
            <BaseButton @click="openCreateModal()" variant="primary" size="sm" class="d-flex align-items-center justify-content-center gap-2 btn-responsive-width">
                <i class="fas fa-plus"></i> Add New Kudi
            </BaseButton>
        </div>
        <div class="row g-3">
            <!-- Left Column: Kudi List -->
            <div class="col-lg-4">
                <div class="card p-3 h-100 border-0 shadow-sm" style="background-color: var(--surface-card);">
                    <div class="d-flex align-items-center gap-2 mb-3">
                        <div class="date-badge text-center p-2 rounded-3 bg-primary-soft text-primary" style="width: 45px; height: 45px; display: flex; justify-content: center; align-items: center;">
                            <i class="fas fa-list fs-5"></i>
                        </div>
                        <h5 class="fw-bold m-0 text-heading">Kudi Numbers</h5>
                    </div>
                    
                    <div class="calendar-wrapper overflow-hidden border-top pt-3">
                        <!-- Pagination Header -->
                        <div v-if="totalRecords > 35" class="d-flex justify-content-between align-items-center mb-3">
                            <button 
                                @click="prevPage" 
                                :disabled="page === 1"
                                class="btn btn-link text-decoration-none p-0"
                                style="color: var(--text-color); font-size: 1.25rem;"
                            >
                                &lt;
                            </button>
                            <span style="color: var(--text-heading-color); font-size: 0.875rem;">
                                Page {{ page }} of {{ totalPages }}
                            </span>
                            <button 
                                @click="nextPage" 
                                :disabled="page === totalPages"
                                class="btn btn-link text-decoration-none p-0"
                                style="color: var(--text-color); font-size: 1.25rem;"
                            >
                                &gt;
                            </button>
                        </div>

                        <div class="kudi-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; justify-items: center; align-items: center;">
                            <div
                                v-for="kudi in paginatedKuts"
                                :key="kudi.id"
                                @click="viewKudiAdmins(kudi)"
                                class="kudi-grid-item d-flex align-items-center justify-content-center transition-all"
                                :class="{ 'active-kudi text-white shadow-sm': selectedKudi?.id === kudi.id }"
                                :style="selectedKudi?.id === kudi.id ? 'background-color: var(--primary-color);' : 'width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1rem; color: var(--text-color); background-color: transparent;'"
                                style="width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1rem; color: var(--text-color);"
                            >
                                {{ kudi.name }}
                            </div>
                        </div>


                    </div>
                </div>
            </div>
            
            <!-- Right Column: Admin List -->
            <div class="col-lg-8">
                <div class="card p-3 h-100 border-0 shadow-sm planner-details" style="background-color: var(--surface-card);">
                    <!-- Top Row -->
                    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
                        <div class="d-flex align-items-center gap-3">
                            <div class="date-badge text-center p-2 rounded-3 bg-primary-soft text-primary" style="width: 55px; height: 55px; flex-shrink: 0; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                <span class="d-block fw-bold fs-5">{{ selectedKudi ? selectedKudi.name : '-' }}</span>
                                <span class="d-block text-uppercase small" style="font-size: 0.6rem; font-weight: 700;">Kudi</span>
                            </div>
                            <div v-if="!selectedKudi">
                                <h4 class="fw-bold mb-1 text-heading">Admins Overview</h4>
                                <span class="text-muted small">Click on a Kudi number to view its admins</span>
                            </div>
                            <div v-else>
                                <h4 class="fw-bold mb-1 text-heading">Kudi {{ selectedKudi.name }}</h4>
                                <span class="text-muted small">{{ kudiAdmins.length }} admin{{ kudiAdmins.length !== 1 ? 's' : '' }} assigned</span>
                            </div>
                        </div>
                        
                        <!-- Actions for Selected Kudi -->
                        <div v-if="selectedKudi" class="d-flex gap-2">
                            <BaseButton variant="outline-primary" size="sm" @click="openEditModal(selectedKudi)">
                                <i class="fas fa-edit me-1"></i> Edit
                            </BaseButton>
                            <BaseButton variant="outline-danger" size="sm" @click="confirmDelete(selectedKudi)">
                                <i class="fas fa-trash me-1"></i> Delete
                            </BaseButton>
                        </div>
                    </div>

                    <!-- Admins List Content -->
                    <div class="card-body p-0">
                        <div v-if="!selectedKudi" class="text-center py-5 text-muted d-flex flex-column align-items-center">
                            <div class="mb-3 p-3 bg-light rounded-circle text-muted" style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-users fs-4"></i>
                            </div>
                            <h6 class="fw-bold text-dark">No Kudi Selected</h6>
                            <p class="mb-0 small">Select a Kudi from the list to view its admins.</p>
                        </div>
                        <div v-else-if="isLoadingAdmins" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        <div v-else-if="kudiAdmins.length === 0" class="text-center py-5 text-muted d-flex flex-column align-items-center">
                            <div class="mb-3 p-3 bg-light rounded-circle text-muted" style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-user-slash fs-4"></i>
                            </div>
                            <h6 class="fw-bold text-dark">No Admins</h6>
                            <p class="mb-0 small">No admins assigned to this Kudi.</p>
                        </div>
                        <div v-else class="list-group list-group-flush">
                            <div v-for="admin in kudiAdmins" :key="admin.id" class="list-group-item d-flex align-items-center gap-3 px-3 py-3 bg-transparent border-bottom hover-bg-light transition-all rounded-2 mb-2">
                                <div class="user-profile-avatar d-flex align-items-center justify-content-center bg-primary-soft text-primary rounded-circle" style="width: 40px; height: 40px; flex-shrink: 0;">
                                    <span class="fw-bold">{{ (admin.firstName?.[0] || 'U').toUpperCase() }}</span>
                                </div>
                                <div class="flex-grow-1">
                                    <div class="fw-bold" style="color: var(--text-color);">
                                        {{ admin.firstName || 'Unknown' }} {{ admin.lastName || '' }}
                                    </div>
                                    <div class="text-muted small">{{ admin.email }}</div>
                                </div>
                                <BaseBadge
                                    v-if="admin.isActive"
                                    status="ACTIVE"
                                    pill
                                    size="sm"
                                    @click="promptToggleStatus(admin)"
                                    style="cursor: pointer;"
                                />
                                <BaseBadge
                                    v-else
                                    status="INACTIVE"
                                    pill
                                    size="sm"
                                    @click="promptToggleStatus(admin)"
                                    style="cursor: pointer;"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <BaseModal v-model="showModal" :title="isEditing ? 'Edit Kudi' : 'Add New Kudi'" size="md">
            <form @submit.prevent="saveKut" class="d-flex flex-column gap-3 p-2">
                <div>
                    <label class="form-label">Kudi Number / លេខកុដិ <span class="text-danger">*</span></label>
                    <BaseInput 
                        v-model="formData.name" 
                        placeholder="Enter kudi number" 
                        required 
                        type="text"
                        @blur="validateKudiNumber"
                        @input="validateKudiNumber"
                    />
                    <div v-if="validationError" class="text-danger small mt-1">
                        {{ validationError }}
                    </div>
                </div>
                
                <div v-if="errorMessage" class="alert alert-danger mb-0 py-2">
                    {{ errorMessage }}
                </div>

                <div class="d-flex justify-content-end gap-2 mt-3">
                    <BaseButton type="button" variant="outline-secondary" @click="showModal = false">Cancel</BaseButton>
                    <BaseButton type="submit" :isLoading="isSaving">Save</BaseButton>
                </div>
            </form>
        </BaseModal>

        <BaseModal v-model="showDeleteModal" size="sm" title="Confirm Delete">
            <p class="mb-0">Are you sure you want to delete Kudi <strong>{{ kutToDelete?.name }}</strong>? This action cannot be undone.</p>
            <template #footer>
                <BaseButton type="button" variant="outline-secondary" class="flex-grow-1" @click="showDeleteModal = false" :disabled="isDeleting">
                    Cancel
                </BaseButton>
                <BaseButton type="button" variant="danger" class="flex-grow-1" @click="executeDelete" :isLoading="isDeleting">
                    {{ isDeleting ? 'Deleting...' : 'Delete' }}
                </BaseButton>
            </template>
        </BaseModal>

        <BaseModal v-model="showStatusModal" size="sm" :title="targetAdmin?.isActive ? 'Deactivate Admin' : 'Activate Admin'">
            <p class="mb-0">Are you sure you want to {{ targetAdmin?.isActive ? 'deactivate' : 'activate' }} admin <strong>{{ targetAdmin?.firstName }} {{ targetAdmin?.lastName }}</strong>?</p>
            <template #footer>
                <BaseButton type="button" variant="outline-secondary" class="flex-grow-1" @click="showStatusModal = false" :disabled="isUpdatingStatus">
                    Cancel
                </BaseButton>
                <BaseButton type="button" :variant="targetAdmin?.isActive ? 'danger' : 'success'" class="flex-grow-1" @click="confirmToggleStatus" :isLoading="isUpdatingStatus">
                    {{ isUpdatingStatus ? 'Updating...' : (targetAdmin?.isActive ? 'Deactivate' : 'Activate') }}
                </BaseButton>
            </template>
        </BaseModal>

    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import { useUserStore } from '@/stores/users/user';

const toast = useToastStore();
const userStore = useUserStore();
const kuts = ref([]);
const isLoading = ref(false);
const page = ref(1);
const perPage = ref(35);

const totalRecords = computed(() => kuts.value.length);
const totalPages = computed(() => Math.ceil(totalRecords.value / 35));
const paginatedKuts = computed(() => {
    const start = (page.value - 1) * 35;
    return kuts.value.slice(start, start + 35);
});

const prevPage = () => {
    if (page.value > 1) {
        page.value--;
    }
};

const nextPage = () => {
    if (page.value < totalPages.value) {
        page.value++;
    }
};

const colDefs = ref([
    { field: 'name', label: 'Kudi Number', sortable: true }
]);

const fetchKuts = async () => {
    isLoading.value = true;
    try {
        const response = await api.get('/kuts');
        const data = response.data?.data || response.data || [];
        kuts.value = data.slice().sort((a, b) => {
            const aNum = parseFloat(a.name);
            const bNum = parseFloat(b.name);
            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
            return (a.name || '').localeCompare(b.name || '');
        });
    } catch (error) {
        console.error('Failed to fetch kuts:', error);
        toast.showToast('Failed to fetch kuts', 'error');
    } finally {
        isLoading.value = false;
    }
};

const showModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const formData = ref({ id: null, name: '' });
const errorMessage = ref('');
const validationError = ref('');

const validateKudiNumber = () => {
    if (!formData.value.name) {
        validationError.value = 'Kudi number is required';
        return false;
    }
    if (!/^\d+$/.test(formData.value.name)) {
        validationError.value = 'Kudi number must contain only digits';
        return false;
    }
    validationError.value = '';
    return true;
};

const clearValidationError = () => {
    validationError.value = '';
};

const isLoadingAdmins = ref(false);
const selectedKudi = ref(null);
const kudiAdmins = ref([]);

const viewKudiAdmins = async (kut) => {
    // Support both direct kudi object and row-click event {data: kudi}
    const kudi = kut?.data ?? kut;
    selectedKudi.value = kudi;
    isLoadingAdmins.value = true;
    kudiAdmins.value = [];
    try {
        const res = await api.get('/users', {
            params: {
                roleId: 2, // Admin role
                kutId: kudi.id,
                perPage: 100 // fetch all
            }
        });
        if (Array.isArray(res.data?.data?.users)) {
            kudiAdmins.value = res.data.data.users;
        } else {
            kudiAdmins.value = res.data?.data || [];
        }
    } catch (error) {
        console.error('Failed to fetch admins:', error);
        toast.add({ title: 'Error', text: 'Failed to fetch admins for this Kudi', type: 'error' });
    } finally {
        isLoadingAdmins.value = false;
    }
};

const toggleAdminStatus = async (admin) => {
    try {
        const newStatus = !admin.isActive;
        await api.put(`/users/${admin.id}`, { isActive: newStatus });

        // Always wait 1 second before completing
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Refetch admins to ensure data is persisted
        if (selectedKudi.value) {
            await viewKudiAdmins(selectedKudi.value);
        }
        toast.showToast(`Admin ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (error) {
        console.error('Failed to toggle admin status:', error);
        toast.showToast('Failed to update admin status', 'error');
    }
};

const promptToggleStatus = (admin) => {
    targetAdmin.value = admin;
    showStatusModal.value = true;
};

const confirmToggleStatus = async () => {
    if (!targetAdmin.value) return;
    isUpdatingStatus.value = true;
    try {
        const newStatus = !targetAdmin.value.isActive;
        const payload = { is_active: newStatus };
        await api.put(`/users/${targetAdmin.value.id}`, payload);

        // Always wait 2 seconds before completing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Refetch admins to ensure data is persisted
        if (selectedKudi.value) {
            await viewKudiAdmins(selectedKudi.value);
        }
        toast.showToast(`Admin ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
        showStatusModal.value = false;
    } catch (error) {
        console.error('Failed to toggle admin status:', error);
        toast.showToast('Failed to update admin status', 'error');
    } finally {
        isUpdatingStatus.value = false;
        targetAdmin.value = null;
    }
};

const openCreateModal = () => {
    isEditing.value = false;
    formData.value = { id: null, name: '' };
    errorMessage.value = '';
    validationError.value = '';
    showModal.value = true;
};

const openEditModal = (kut) => {
    isEditing.value = true;
    formData.value = { ...kut };
    errorMessage.value = '';
    validationError.value = '';
    showModal.value = true;
};

const saveKut = async () => {
    if (!validateKudiNumber()) return;
    
    isSaving.value = true;
    errorMessage.value = '';
    validationError.value = '';
    
    try {
        const kutId = formData.value.id;
        const payload = { name: formData.value.name }; // only send name

        if (isEditing.value && kutId) {
            await api.put(`/kuts/${kutId}`, payload);
        } else {
            const response = await api.post('/kuts', payload);
            if (!(response.data?.success || response.status === 201 || response.status === 200)) {
                throw new Error(response.data?.message || 'Unknown error');
            }
        }
        
        // Always wait 1 second before completing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        isSaving.value = false;
        showModal.value = false;
        fetchKuts();
        toast.showToast(isEditing.value ? 'Kudi updated successfully' : 'Kudi created successfully', 'success');
    } catch (error) {
        console.error('Save Kuti error:', error);
        const msg = error.response?.data?.message || error.message || 'Failed to save Kudi';
        errorMessage.value = msg;
        toast.showToast(msg, 'error');
        isSaving.value = false;
    }
};

const showDeleteModal = ref(false);
const kutToDelete = ref(null);
const isDeleting = ref(false);

const showStatusModal = ref(false);
const targetAdmin = ref(null);
const isUpdatingStatus = ref(false);

const confirmDelete = (kut) => {
    kutToDelete.value = kut;
    showDeleteModal.value = true;
};

const executeDelete = async () => {
    if (!kutToDelete.value) return;
    isDeleting.value = true;
    try {
        await api.delete(`/kuts/${kutToDelete.value.id}`);
        
        // Always wait 1 second before completing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.showToast('Kudi deleted successfully', 'success');
        
        // Clear selected state if deleting the currently selected kudi
        if (selectedKudi.value?.id === kutToDelete.value.id) {
            selectedKudi.value = null;
            kudiAdmins.value = [];
        }
        
        // Remove the deleted item from the local list immediately
        kuts.value = kuts.value.filter(k => k.id !== kutToDelete.value.id);
        
        // Also refresh from server to ensure consistency
        await fetchKuts();
    } catch (error) {
        console.error('Delete error:', error);
        toast.showToast(error.response?.data?.message || 'Failed to delete Kudi', 'error');
    } finally {
        // Always close modal and clear state
        showDeleteModal.value = false;
        kutToDelete.value = null;
        isDeleting.value = false;
    }
};

onMounted(() => {
    fetchKuts();
});
</script>

<style scoped>
.kudi-management-container {
    scrollbar-color: color-mix(in srgb, var(--primary-color) 40%, transparent) transparent;
}
</style>
