<template>
    <div class="pdc-management-container d-flex flex-column gap-3">


        <div class="card p-3 border-0 shadow-sm w-100" style="background-color: var(--surface-card);">
            <!-- Breadcrumbs -->
            <div class="d-flex align-items-center gap-2 mb-4 p-2 bg-light rounded" style="font-size: 14px;">
                <span class="cursor-pointer fw-bold hover-text-primary" 
                      :class="currentLevel === 'provinces' ? 'text-primary' : 'text-muted'"
                      @click="goToLevel('provinces')">Provinces</span>
                
                <template v-if="selectedProvince">
                    <ChevronRight :size="14" class="text-muted" />
                    <span class="cursor-pointer fw-bold hover-text-primary" 
                          :class="currentLevel === 'districts' ? 'text-primary' : 'text-muted'"
                          @click="goToLevel('districts')">{{ selectedProvince.name }} (Districts)</span>
                </template>

                <template v-if="selectedDistrict">
                    <ChevronRight :size="14" class="text-muted" />
                    <span class="cursor-pointer fw-bold hover-text-primary" 
                          :class="currentLevel === 'communes' ? 'text-primary' : 'text-muted'"
                          @click="goToLevel('communes')">{{ selectedDistrict.name }} (Communes)</span>
                </template>

                <template v-if="selectedCommune">
                    <ChevronRight :size="14" class="text-muted" />
                    <span class="cursor-pointer fw-bold hover-text-primary" 
                          :class="currentLevel === 'villages' ? 'text-primary' : 'text-muted'">
                          {{ selectedCommune.name }} (Villages)
                    </span>
                </template>
            </div>

            <!-- Action Banner -->
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold m-0 text-heading">
                    <span v-if="currentLevel === 'provinces'">All Provinces</span>
                    <span v-else-if="currentLevel === 'districts'">Districts in {{ selectedProvince?.name }}</span>
                    <span v-else-if="currentLevel === 'communes'">Communes in {{ selectedDistrict?.name }}</span>
                    <span v-else-if="currentLevel === 'villages'">Villages in {{ selectedCommune?.name }}</span>
                </h6>
                <div class="d-flex gap-2 align-items-center">
                    <BaseButton @click="openCurrentModal()" variant="primary" size="sm" class="d-flex align-items-center gap-2">
                        <i class="fas fa-plus"></i> Add New
                    </BaseButton>
                </div>
            </div>

            <!-- Dynamic Table -->
            <div class="border-top pt-3">
                <BaseTable 
                    :columns="colDefs" 
                    :rows="paginatedData" 
                    :loading="isLoadingCurrentData" 
                    :page="currentPage"
                    :per-page="rowsPerPage"
                    :total-records="totalRecords"
                    @update:page="currentPage = $event"
                    @update:per-page="rowsPerPage = $event"
                    @row-click="handleRowClick" 
                    :rowClass="() => 'cursor-pointer'"
                >
                    <template #name="{ data }">
                        <span class="fw-bold" style="color: var(--text-color);">{{ data.name }}</span>
                    </template>
                    <template #name_en="{ data }">
                        <span class="text-muted" style="font-size: 13px;">{{ data.name_en || '-' }}</span>
                    </template>
                    <template #action="{ data }">
                        <div class="d-flex gap-1 justify-content-end">
                            <button v-if="currentLevel !== 'villages'" class="btn-action-square bg-light border d-flex align-items-center justify-content-center" @click.stop="handleRowClick(data)" v-tooltip.top="'View Children'">
                                <ChevronRight :size="16" class="text-secondary" />
                            </button>
                            <button class="btn-action-square btn-action-primary d-flex align-items-center justify-content-center" @click.stop="openCurrentModal(data)">
                                <Edit2 :size="14" class="text-white" />
                            </button>
                            <button class="btn-action-square btn-action-danger d-flex align-items-center justify-content-center" @click.stop="confirmDeleteCurrent(data)">
                                <Trash2 :size="14" class="text-white" />
                            </button>
                        </div>
                    </template>
                </BaseTable>
            </div>
        </div>

        <!-- Province Modal -->
        <BaseModal v-model="showProvinceModal" :title="editingProvince ? 'Edit Province' : 'Add Province'" size="md">
            <form @submit.prevent="saveProvince" class="d-flex flex-column gap-3 p-2">
                <div>
                    <label class="form-label">Province Name (Khmer) <span class="text-danger">*</span></label>
                    <BaseInput v-model="provinceForm.name" placeholder="Enter province name" required />
                </div>
                <div>
                    <label class="form-label">Province Name (English)</label>
                    <BaseInput v-model="provinceForm.name_en" placeholder="Enter province name in English" />
                </div>
                <div v-if="errorMessage" class="alert alert-danger mb-0 py-2">
                    {{ errorMessage }}
                </div>
                <div class="d-flex justify-content-end gap-2 mt-3">
                    <BaseButton type="button" variant="outline-secondary" @click="showProvinceModal = false">Cancel</BaseButton>
                    <BaseButton type="submit" :isLoading="isSaving">Save</BaseButton>
                </div>
            </form>
        </BaseModal>

        <!-- District Modal -->
        <BaseModal v-model="showDistrictModal" :title="editingDistrict ? 'Edit District' : 'Add District'" size="md">
            <form @submit.prevent="saveDistrict" class="d-flex flex-column gap-3 p-2">
                <div>
                    <label class="form-label">District Name (Khmer) <span class="text-danger">*</span></label>
                    <BaseInput v-model="districtForm.name" placeholder="Enter district name" required />
                </div>
                <div>
                    <label class="form-label">District Name (English)</label>
                    <BaseInput v-model="districtForm.name_en" placeholder="Enter district name in English" />
                </div>
                <div v-if="errorMessage" class="alert alert-danger mb-0 py-2">
                    {{ errorMessage }}
                </div>
                <div class="d-flex justify-content-end gap-2 mt-3">
                    <BaseButton type="button" variant="outline-secondary" @click="showDistrictModal = false">Cancel</BaseButton>
                    <BaseButton type="submit" :isLoading="isSaving">Save</BaseButton>
                </div>
            </form>
        </BaseModal>

        <!-- Commune Modal -->
        <BaseModal v-model="showCommuneModal" :title="editingCommune ? 'Edit Commune' : 'Add Commune'" size="md">
            <form @submit.prevent="saveCommune" class="d-flex flex-column gap-3 p-2">
                <div>
                    <label class="form-label">Commune Name (Khmer) <span class="text-danger">*</span></label>
                    <BaseInput v-model="communeForm.name" placeholder="Enter commune name" required />
                </div>
                <div>
                    <label class="form-label">Commune Name (English)</label>
                    <BaseInput v-model="communeForm.name_en" placeholder="Enter commune name in English" />
                </div>
                <div v-if="errorMessage" class="alert alert-danger mb-0 py-2">
                    {{ errorMessage }}
                </div>
                <div class="d-flex justify-content-end gap-2 mt-3">
                    <BaseButton type="button" variant="outline-secondary" @click="showCommuneModal = false">Cancel</BaseButton>
                    <BaseButton type="submit" :isLoading="isSaving">Save</BaseButton>
                </div>
            </form>
        </BaseModal>

        <!-- Village Modal -->
        <BaseModal v-model="showVillageModal" :title="editingVillage ? 'Edit Village' : 'Add Village'" size="md">
            <form @submit.prevent="saveVillage" class="d-flex flex-column gap-3 p-2">
                <div>
                    <label class="form-label">Village Name (Khmer) <span class="text-danger">*</span></label>
                    <BaseInput v-model="villageForm.name" placeholder="Enter village name" required />
                </div>
                <div>
                    <label class="form-label">Village Name (English)</label>
                    <BaseInput v-model="villageForm.name_en" placeholder="Enter village name in English" />
                </div>
                <div v-if="errorMessage" class="alert alert-danger mb-0 py-2">
                    {{ errorMessage }}
                </div>
                <div class="d-flex justify-content-end gap-2 mt-3">
                    <BaseButton type="button" variant="outline-secondary" @click="showVillageModal = false">Cancel</BaseButton>
                    <BaseButton type="submit" :isLoading="isSaving">Save</BaseButton>
                </div>
            </form>
        </BaseModal>

        <!-- Delete Confirmation Modal -->
        <BaseModal v-model="showDeleteModal" size="sm" title="Confirm Delete">
            <p class="mb-0">Are you sure you want to delete <strong>{{ itemToDelete?.name }}</strong>? This action cannot be undone.</p>
            <template #footer>
                <BaseButton type="button" variant="outline-secondary" class="flex-grow-1" @click="showDeleteModal = false" :disabled="isDeleting">
                    Cancel
                </BaseButton>
                <BaseButton type="button" variant="danger" class="flex-grow-1" @click="executeDelete" :isLoading="isDeleting">
                    {{ isDeleting ? 'Deleting...' : 'Delete' }}
                </BaseButton>
            </template>
        </BaseModal>
    </div>
</template>

<script setup>
import { Edit2, Trash2, ChevronRight } from '@lucide/vue';
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();



const currentLevel = ref('provinces'); // 'provinces' | 'districts' | 'communes' | 'villages'

const currentPage = ref(1);
const rowsPerPage = ref(10);

watch(currentLevel, () => {
    currentPage.value = 1;
});

const currentData = computed(() => {
    if (currentLevel.value === 'provinces') return provinces.value;
    if (currentLevel.value === 'districts') return districts.value;
    if (currentLevel.value === 'communes') return communes.value;
    if (currentLevel.value === 'villages') return villages.value;
    return [];
});

const totalRecords = computed(() => currentData.value.length);

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * rowsPerPage.value;
    const end = start + rowsPerPage.value;
    return currentData.value.slice(start, end);
});

const isLoadingCurrentData = computed(() => {
    if (currentLevel.value === 'provinces') return isLoadingProvinces.value;
    if (currentLevel.value === 'districts') return isLoadingDistricts.value;
    if (currentLevel.value === 'communes') return isLoadingCommunes.value;
    if (currentLevel.value === 'villages') return isLoadingVillages.value;
    return false;
});

const handleRowClick = (data) => {
    if (currentLevel.value === 'provinces') selectProvince(data);
    else if (currentLevel.value === 'districts') selectDistrict(data);
    else if (currentLevel.value === 'communes') selectCommune(data);
};

const openCurrentModal = (data = null) => {
    if (currentLevel.value === 'provinces') openProvinceModal(data);
    else if (currentLevel.value === 'districts') openDistrictModal(data);
    else if (currentLevel.value === 'communes') openCommuneModal(data);
    else if (currentLevel.value === 'villages') openVillageModal(data);
};

const confirmDeleteCurrent = (data) => {
    if (currentLevel.value === 'provinces') confirmDeleteProvince(data);
    else if (currentLevel.value === 'districts') confirmDeleteDistrict(data);
    else if (currentLevel.value === 'communes') confirmDeleteCommune(data);
    else if (currentLevel.value === 'villages') confirmDeleteVillage(data);
};

const goToLevel = (level) => {
    if (level === 'provinces') {
        currentLevel.value = 'provinces';
    } else if (level === 'districts') {
        if (!selectedProvince.value) return;
        currentLevel.value = 'districts';
    } else if (level === 'communes') {
        if (!selectedDistrict.value) return;
        currentLevel.value = 'communes';
    }
};

const colDefs = [
    { field: 'name', header: 'Khmer Name' },
    { field: 'name_en', header: 'English Name' },
    { field: 'action', header: 'Action', sortable: false, headerClass: 'text-end', bodyClass: 'text-end' }
];


// Data
const provinces = ref([]);
const districts = ref([]);
const communes = ref([]);
const villages = ref([]);

// Selection
const selectedProvince = ref(null);
const selectedDistrict = ref(null);
const selectedCommune = ref(null);

// Loading states
const isLoadingProvinces = ref(false);
const isLoadingDistricts = ref(false);
const isLoadingCommunes = ref(false);
const isLoadingVillages = ref(false);

// Modals
const showProvinceModal = ref(false);
const showDistrictModal = ref(false);
const showCommuneModal = ref(false);
const showVillageModal = ref(false);
const showDeleteModal = ref(false);

// Forms
const provinceForm = ref({ id: null, name: '', name_en: '' });
const districtForm = ref({ id: null, name: '', name_en: '' });
const communeForm = ref({ id: null, name: '', name_en: '' });
const villageForm = ref({ id: null, name: '', name_en: '' });

// Editing states
const editingProvince = ref(false);
const editingDistrict = ref(false);
const editingCommune = ref(false);
const editingVillage = ref(false);

// Saving/Deleting states
const isSaving = ref(false);
const isDeleting = ref(false);
const errorMessage = ref('');

// Delete item
const itemToDelete = ref(null);
const deleteType = ref('');

// Fetch provinces
const fetchProvinces = async () => {
    isLoadingProvinces.value = true;
    try {
        const response = await api.get('/provinces');
        provinces.value = response.data?.data || response.data || [];
    } catch (error) {
        console.error('Failed to fetch provinces:', error);
        toast.showToast('Failed to fetch provinces', 'error');
    } finally {
        isLoadingProvinces.value = false;
    }
};

// Fetch districts for selected province
const fetchDistricts = async (provinceId) => {
    if (!provinceId) {
        districts.value = [];
        return;
    }
    isLoadingDistricts.value = true;
    try {
        const response = await api.get('/districts', { params: { province_id: provinceId } });
        districts.value = response.data?.data || response.data || [];
    } catch (error) {
        console.error('Failed to fetch districts:', error);
        toast.showToast('Failed to fetch districts', 'error');
    } finally {
        isLoadingDistricts.value = false;
    }
};

// Fetch communes for selected district
const fetchCommunes = async (districtId) => {
    if (!districtId) {
        communes.value = [];
        return;
    }
    isLoadingCommunes.value = true;
    try {
        const response = await api.get('/communes', { params: { district_id: districtId } });
        communes.value = response.data?.data || response.data || [];
    } catch (error) {
        console.error('Failed to fetch communes:', error);
        toast.showToast('Failed to fetch communes', 'error');
    } finally {
        isLoadingCommunes.value = false;
    }
};

// Fetch villages for selected commune
const fetchVillages = async (communeId) => {
    if (!communeId) {
        villages.value = [];
        return;
    }
    isLoadingVillages.value = true;
    try {
        const response = await api.get('/villages', { params: { commune_id: communeId } });
        villages.value = response.data?.data || response.data || [];
    } catch (error) {
        console.error('Failed to fetch villages:', error);
        toast.showToast('Failed to fetch villages', 'error');
    } finally {
        isLoadingVillages.value = false;
    }
};

// Select province
const selectProvince = (province) => {
    selectedProvince.value = province;
    selectedDistrict.value = null;
    selectedCommune.value = null;
    communes.value = [];
    villages.value = [];
    fetchDistricts(province.id);
    currentLevel.value = 'districts';
};

// Select district
const selectDistrict = (district) => {
    selectedDistrict.value = district;
    selectedCommune.value = null;
    villages.value = [];
    fetchCommunes(district.id);
    currentLevel.value = 'communes';
};

// Select commune
const selectCommune = (commune) => {
    selectedCommune.value = commune;
    fetchVillages(commune.id);
    currentLevel.value = 'villages';
};

// Province modal functions
const openProvinceModal = (province = null) => {
    editingProvince.value = !!province;
    provinceForm.value = province ? { ...province } : { id: null, name: '', name_en: '' };
    errorMessage.value = '';
    showProvinceModal.value = true;
};

const saveProvince = async () => {
    if (!provinceForm.value.name) return;
    
    isSaving.value = true;
    errorMessage.value = '';
    
    try {
        if (editingProvince.value && provinceForm.value.id) {
            await api.put(`/provinces/${provinceForm.value.id}`, provinceForm.value);
            toast.showToast('Province updated successfully', 'success');
        } else {
            await api.post('/provinces', provinceForm.value);
            toast.showToast('Province created successfully', 'success');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        showProvinceModal.value = false;
        await fetchProvinces();
    } catch (error) {
        console.error('Save province error:', error);
        const msg = error.response?.data?.message || error.message || 'Failed to save province';
        errorMessage.value = msg;
        toast.showToast(msg, 'error');
    } finally {
        isSaving.value = false;
    }
};

// District modal functions
const openDistrictModal = (district = null) => {
    editingDistrict.value = !!district;
    districtForm.value = district ? { ...district } : { id: null, name: '', name_en: '' };
    errorMessage.value = '';
    showDistrictModal.value = true;
};

const saveDistrict = async () => {
    if (!districtForm.value.name) return;
    
    isSaving.value = true;
    errorMessage.value = '';
    
    try {
        const payload = {
            ...districtForm.value,
            province_id: selectedProvince.value.id
        };
        
        if (editingDistrict.value && districtForm.value.id) {
            await api.put(`/districts/${districtForm.value.id}`, payload);
            toast.showToast('District updated successfully', 'success');
        } else {
            await api.post('/districts', payload);
            toast.showToast('District created successfully', 'success');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        showDistrictModal.value = false;
        await fetchDistricts(selectedProvince.value.id);
    } catch (error) {
        console.error('Save district error:', error);
        const msg = error.response?.data?.message || error.message || 'Failed to save district';
        errorMessage.value = msg;
        toast.showToast(msg, 'error');
    } finally {
        isSaving.value = false;
    }
};

// Commune modal functions
const openCommuneModal = (commune = null) => {
    editingCommune.value = !!commune;
    communeForm.value = commune ? { ...commune } : { id: null, name: '', name_en: '' };
    errorMessage.value = '';
    showCommuneModal.value = true;
};

const saveCommune = async () => {
    if (!communeForm.value.name) return;
    
    isSaving.value = true;
    errorMessage.value = '';
    
    try {
        const payload = {
            ...communeForm.value,
            district_id: selectedDistrict.value.id
        };
        
        if (editingCommune.value && communeForm.value.id) {
            await api.put(`/communes/${communeForm.value.id}`, payload);
            toast.showToast('Commune updated successfully', 'success');
        } else {
            await api.post('/communes', payload);
            toast.showToast('Commune created successfully', 'success');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        showCommuneModal.value = false;
        await fetchCommunes(selectedDistrict.value.id);
    } catch (error) {
        console.error('Save commune error:', error);
        const msg = error.response?.data?.message || error.message || 'Failed to save commune';
        errorMessage.value = msg;
        toast.showToast(msg, 'error');
    } finally {
        isSaving.value = false;
    }
};

// Village modal functions
const openVillageModal = (village = null) => {
    editingVillage.value = !!village;
    villageForm.value = village ? { ...village } : { id: null, name: '', name_en: '' };
    errorMessage.value = '';
    showVillageModal.value = true;
};

const saveVillage = async () => {
    if (!villageForm.value.name) return;
    
    isSaving.value = true;
    errorMessage.value = '';
    
    try {
        const payload = {
            ...villageForm.value,
            commune_id: selectedCommune.value.id
        };
        
        if (editingVillage.value && villageForm.value.id) {
            await api.put(`/villages/${villageForm.value.id}`, payload);
            toast.showToast('Village updated successfully', 'success');
        } else {
            await api.post('/villages', payload);
            toast.showToast('Village created successfully', 'success');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        showVillageModal.value = false;
        await fetchVillages(selectedCommune.value.id);
    } catch (error) {
        console.error('Save village error:', error);
        const msg = error.response?.data?.message || error.message || 'Failed to save village';
        errorMessage.value = msg;
        toast.showToast(msg, 'error');
    } finally {
        isSaving.value = false;
    }
};

// Delete functions
const confirmDeleteProvince = (province) => {
    itemToDelete.value = province;
    deleteType.value = 'province';
    showDeleteModal.value = true;
};

const confirmDeleteDistrict = (district) => {
    itemToDelete.value = district;
    deleteType.value = 'district';
    showDeleteModal.value = true;
};

const confirmDeleteCommune = (commune) => {
    itemToDelete.value = commune;
    deleteType.value = 'commune';
    showDeleteModal.value = true;
};

const confirmDeleteVillage = (village) => {
    itemToDelete.value = village;
    deleteType.value = 'village';
    showDeleteModal.value = true;
};

const executeDelete = async () => {
    if (!itemToDelete.value) return;
    isDeleting.value = true;
    try {
        let endpoint = '';
        if (deleteType.value === 'province') {
            endpoint = `/provinces/${itemToDelete.value.id}`;
        } else if (deleteType.value === 'district') {
            endpoint = `/districts/${itemToDelete.value.id}`;
        } else if (deleteType.value === 'commune') {
            endpoint = `/communes/${itemToDelete.value.id}`;
        } else if (deleteType.value === 'village') {
            endpoint = `/villages/${itemToDelete.value.id}`;
        }
        
        await api.delete(endpoint);
        toast.showToast(`${deleteType.value.charAt(0).toUpperCase() + deleteType.value.slice(1)} deleted successfully`, 'success');
        
        // Clear selection if deleting selected item
        if (deleteType.value === 'province' && selectedProvince.value?.id === itemToDelete.value.id) {
            selectedProvince.value = null;
            selectedDistrict.value = null;
            selectedCommune.value = null;
            districts.value = [];
            communes.value = [];
            villages.value = [];
        } else if (deleteType.value === 'district' && selectedDistrict.value?.id === itemToDelete.value.id) {
            selectedDistrict.value = null;
            selectedCommune.value = null;
            communes.value = [];
            villages.value = [];
        } else if (deleteType.value === 'commune' && selectedCommune.value?.id === itemToDelete.value.id) {
            selectedCommune.value = null;
            villages.value = [];
        }
        
        // Refresh appropriate list
        if (deleteType.value === 'province') {
            await fetchProvinces();
        } else if (deleteType.value === 'district') {
            await fetchDistricts(selectedProvince.value?.id);
        } else if (deleteType.value === 'commune') {
            await fetchCommunes(selectedDistrict.value?.id);
        } else if (deleteType.value === 'village') {
            await fetchVillages(selectedCommune.value?.id);
        }
        
        showDeleteModal.value = false;
    } catch (error) {
        console.error('Delete error:', error);
        toast.showToast(error.response?.data?.message || `Failed to delete ${deleteType.value}`, 'error');
    } finally {
        isDeleting.value = false;
        itemToDelete.value = null;
        deleteType.value = '';
    }
};

onMounted(() => {
    fetchProvinces();
});
</script>

<style scoped>

.pdc-management-container {
    background-color: transparent;
    position: relative;
    z-index: 1;
}

.pdc-management-container::before {
    content: '';
    position: absolute;
    top: -10%; left: -5%;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(235, 230, 255, 0.6) 0%, rgba(245, 243, 255, 0) 70%);
    border-radius: 50%;
    z-index: -1;
    pointer-events: none;
}

.pdc-management-container::after {
    content: '';
    position: absolute;
    bottom: -20%; right: -10%;
    width: 800px; height: 800px;
    background: radial-gradient(circle, rgba(235, 230, 255, 0.6) 0%, rgba(245, 243, 255, 0) 70%);
    border-radius: 50%;
    z-index: -1;
    pointer-events: none;
}

.card {
    border-radius: 16px !important;
}

.btn-add {
    width: 24px;
    height: 38px;
    border-radius: 12px;
    border: none;
    transition: transform 0.2s, opacity 0.2s;
    cursor: pointer;
}
.btn-add:hover { opacity: 0.8; }
.btn-add:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-add-primary { background-color: #7952b3; }
.btn-add-success { background-color: #9fccb6; }
.btn-add-secondary { background-color: #d8d8d8; }
.btn-add-warning { background-color: #f6d198; }

.btn-action-square {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: none;
    transition: transform 0.2s;
    cursor: pointer;
}
.btn-action-square:hover { opacity: 0.8; }

.btn-action-primary { background-color: #7952b3; }
.btn-action-danger { background-color: #dc3545; }

.border-top {
    border-top: 1px solid #f0f0f0 !important;
}

.pdc-management-container {
    scrollbar-color: color-mix(in srgb, var(--primary-color) 40%, transparent) transparent;
}

.hover-bg-light:hover {
    background-color: var(--surface-hover);
}

.cursor-pointer {
    cursor: pointer;
}

.action-btn {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
}

.action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.selected-item {
    background-color: var(--primary-color-soft) !important;
    border-left: 4px solid var(--primary-color) !important;
    box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.15);
}

.selected-item-success {
    background-color: var(--success-color-soft) !important;
    border-left: 4px solid var(--success-color) !important;
    box-shadow: 0 2px 8px rgba(var(--success-rgb), 0.15);
}

.selected-item-info {
    background-color: var(--info-color-soft) !important;
    border-left: 4px solid var(--info-color) !important;
    box-shadow: 0 2px 8px rgba(var(--info-rgb), 0.15);
}

.selected-item-warning {
    background-color: var(--warning-color-soft) !important;
    border-left: 4px solid var(--warning-color) !important;
    box-shadow: 0 2px 8px rgba(var(--warning-rgb), 0.15);
}

.hover-text-primary:hover {
    color: var(--primary-color) !important;
    text-decoration: underline;
}
</style>

