<template>
    <div class="university-settings">
        <!-- Action Banner -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="fw-bold m-0 text-heading">Public Universities of Cambodia</h6>
            <BaseButton @click="openModal()" variant="primary" size="sm" class="d-flex align-items-center gap-2">
                <i class="fas fa-plus"></i> Add University
            </BaseButton>
        </div>

        <!-- Table -->
        <BaseTable
            :columns="colDefs"
            :rows="paginatedData"
            :loading="isLoading"
            :page="currentPage"
            :per-page="rowsPerPage"
            :total-records="universities.length"
            @update:page="currentPage = $event"
            @update:per-page="rowsPerPage = $event"
        >
            <template #name="{ data }">
                <div>
                    <div class="fw-bold" style="font-size: 14px; white-space: normal;">{{ data.name }}</div>
                    <div class="text-muted" style="font-size: 12px;" v-if="data.province">
                        📍 {{ [data.province, data.district].filter(Boolean).join(', ') }}
                    </div>
                </div>
            </template>
            <template #rector="{ data }">
                <span style="font-size: 13px;">{{ data.rector || '—' }}</span>
            </template>
            <template #establish_date="{ data }">
                <span class="badge bg-light text-dark border" style="font-size: 12px;">{{ data.establish_date || '—' }}</span>
            </template>
            <template #website="{ data }">
                <a v-if="data.website" :href="data.website" target="_blank" class="text-primary" style="font-size: 12px;" @click.stop>
                    <i class="fas fa-external-link-alt me-1"></i>Visit
                </a>
                <span v-else class="text-muted" style="font-size: 12px;">—</span>
            </template>
            <template #action="{ data }">
                <div class="d-flex gap-1 justify-content-end">
                    <button
                        class="btn-action-square btn-action-primary d-flex align-items-center justify-content-center"
                        @click.stop="openModal(data)"
                        v-tooltip.top="'Edit'"
                    >
                        <Edit2 :size="14" class="text-white" />
                    </button>
                    <button
                        class="btn-action-square btn-action-danger d-flex align-items-center justify-content-center"
                        @click.stop="confirmDelete(data)"
                        v-tooltip.top="'Delete'"
                    >
                        <Trash2 :size="14" class="text-white" />
                    </button>
                </div>
            </template>
        </BaseTable>

        <!-- Modal -->
        <BaseModal :is-open="isModalOpen" :title="editingItem ? 'Edit University' : 'Add University'" @close="closeModal">
            <template #body>
                <form @submit.prevent="submitForm">
                    <div class="row g-3">
                        <div class="col-12">
                            <label class="form-label">University Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" v-model="formData.name" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Province</label>
                            <input type="text" class="form-control" v-model="formData.province">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">District</label>
                            <input type="text" class="form-control" v-model="formData.district">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Website</label>
                            <input type="url" class="form-control" v-model="formData.website" placeholder="https://...">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" v-model="formData.email">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Phone</label>
                            <input type="text" class="form-control" v-model="formData.tel">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Established Year</label>
                            <input type="text" class="form-control" v-model="formData.establish_date" placeholder="e.g. 1964">
                        </div>
                        <div class="col-12">
                            <label class="form-label">Rector / Director</label>
                            <input type="text" class="form-control" v-model="formData.rector">
                        </div>
                        <div class="col-12">
                            <label class="form-label">Faculties / Departments</label>
                            <textarea class="form-control" rows="3" v-model="formData.faculties" placeholder="Separate by semicolons"></textarea>
                        </div>
                    </div>
                    <div class="d-flex justify-content-end gap-2 mt-4">
                        <BaseButton type="button" variant="secondary" @click="closeModal">Cancel</BaseButton>
                        <BaseButton type="submit" variant="primary" :isLoading="isSubmitting">Save</BaseButton>
                    </div>
                </form>
            </template>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Edit2, Trash2 } from '@lucide/vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();

const colDefs = [
    { field: 'name', header: 'University Name' },
    { field: 'rector', header: 'Rector' },
    { field: 'establish_date', header: 'Est.' },
    { field: 'website', header: 'Website' },
    { field: 'action', header: 'Actions', style: 'width: 90px; text-align: right;', sortable: false }
];

const universities = ref([]);
const isLoading = ref(false);

// Pagination state
const currentPage = ref(1);
const rowsPerPage = ref(10);

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * rowsPerPage.value;
    return universities.value.slice(start, start + rowsPerPage.value);
});

// Reset page when per-page changes
watch(rowsPerPage, () => { currentPage.value = 1; });

const isModalOpen = ref(false);
const isSubmitting = ref(false);
const editingItem = ref(null);

const emptyForm = () => ({ name: '', province: '', district: '', commune: '', village: '', website: '', email: '', tel: '', rector: '', establish_date: '', faculties: '' });
const formData = ref(emptyForm());

const fetchUniversities = async () => {
    isLoading.value = true;
    try {
        const res = await api.get('/universities');
        if (res.data.success) universities.value = res.data.data;
    } catch {
        toast.error('Failed to load universities');
    } finally {
        isLoading.value = false;
    }
};

const openModal = (item = null) => {
    editingItem.value = item;
    formData.value = item ? { ...item } : emptyForm();
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
    editingItem.value = null;
    formData.value = emptyForm();
};

const submitForm = async () => {
    isSubmitting.value = true;
    try {
        const res = editingItem.value
            ? await api.put(`/universities/${editingItem.value.id}`, formData.value)
            : await api.post('/universities', formData.value);
        if (res.data.success) {
            toast.success(res.data.message);
            closeModal();
            fetchUniversities();
        } else {
            toast.error(res.data.message || 'Operation failed');
        }
    } catch (err) {
        toast.error(err?.response?.data?.message || 'Operation failed');
    } finally {
        isSubmitting.value = false;
    }
};

const confirmDelete = async (item) => {
    if (confirm(`Delete "${item.name}"?`)) {
        try {
            const res = await api.delete(`/universities/${item.id}`);
            if (res.data.success) {
                toast.success('University deleted');
                fetchUniversities();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to delete');
        }
    }
};

onMounted(fetchUniversities);
</script>

<style scoped>
.btn-action-square {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: none;
    transition: transform 0.15s, opacity 0.15s;
    cursor: pointer;
}
.btn-action-square:hover {
    opacity: 0.85;
    transform: scale(1.08);
}
.btn-action-primary {
    background-color: #7952b3;
}
.btn-action-danger {
    background-color: #dc3545;
}
</style>
