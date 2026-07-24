<template>
    <div style="background-color: var(--surface-ground);">
        <template v-if="authStore.isSuperAdmin">
        <div class="mb-2 d-flex flex-column flex-xl-row align-items-xl-center gap-2 w-100">
            <div class="flex-grow-1 d-flex align-items-center gap-2 flex-wrap" style="min-width: 0;">
                <h5 class="fw-semibold mb-0" style="color: var(--text-heading-color);">Mekudi Biography / ប្រវត្តិរូបមេកុដិ</h5>
            </div>

            <div class="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 flex-shrink-0">
                <BaseButton variant="outline-success" class="d-flex align-items-center gap-2" @click="exportToCSV" :isLoading="isExporting">
                    <FileDown :size="16" />
                    <span>Export Excel (CSV)</span>
                </BaseButton>
                <div class="kudi-select" style="min-width: 180px;">
                    <BaseSelect
                        v-model="selectedKut"
                        :options="kuts"
                        placeholder="Filter by Kudi"
                        option-label="name"
                        option-value="id"
                        clearable
                        appendTo="body"
                    />
                </div>
                <div class="search-input">
                    <BaseInput
                        v-model="searchQuery"
                        placeholder="Search mekudi..."
                        :prefixIcon="Search"
                        clearable
                        @clear="onSearchClear"
                    />
                </div>
            </div>
        </div>

        <BaseTable
            :columns="colDefs"
            :rows="mekudis"
            :loading="isLoading"
            :total-records="totalRecords"
            v-model:page="page"
            v-model:per-page="perPage"
            @refresh-data="fetchMekudis"
        >
            <template #username="{ data }">
                <div class="d-flex align-items-center gap-3">
                    <div>
                        <div class="user-profile-avatar d-flex align-items-center justify-content-center text-muted"
                            style="border-radius: 50%; width: 32px; height: 32px; background-color: rgba(0,0,0,0.05);">
                            <img v-if="data?.profile?.avatarUrl" :src="$authImg(data.profile.avatarUrl)" class="img-fluid"
                                style="border-radius: 50%; width: 100%; height: 100%; object-fit: cover;">
                            <User v-else :size="16" />
                        </div>
                    </div>
                    <div class="d-flex flex-column align-items-start" style="min-width: 0;">
                        <span class="fw-medium truncate-1-line">{{ data?.firstName + " " + data?.lastName }}</span>
                    </div>
                </div>
            </template>

            <template #role="{ data }">
                <span class="badge rounded-pill border bg-primary bg-opacity-10 text-primary border-primary">
                    មេកុដិ
                </span>
            </template>

            <template #email="{ data }">
                <span>{{ data?.email }}</span>
            </template>

            <template #phone="{ data }">
                <span>{{ data?.UserProfile?.phone_number || data?.profile?.phone || '-' }}</span>
            </template>

            <template #wat="{ data }">
                <span>{{ data?.UserProfile?.from_wat || data?.profile?.from_wat || '-' }}</span>
            </template>

            <template #actions="{ data }">
                <BaseButton variant="outline-primary" size="sm" @click="viewBiography(data)">
                    View Biography
                </BaseButton>
            </template>
        </BaseTable>

        <!-- Biography Modal -->
        <BaseModal v-model="showBiographyModal" size="lg" title="Biography Survey / ប្រវត្តិរូបសង្ខេប" @close="closeBiography">
            <PagodaMonkBiographyView :user-id="selectedUser?.id" @close="closeBiography" hide-header :is-read-only="true" />
        </BaseModal>
        </template>

        <template v-else>
            <PagodaMonkBiographyView />
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Search, User, FileDown } from '@lucide/vue';
import BaseButton from '@/components/base/BaseButton.vue';
import api from '@/api/api';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseSelect from '@/components/base/BaseSelect.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import { useAuthStore } from '@/stores/auth';
import PagodaMonkBiographyView from '@/views/pagoda/PagodaMonkBiographyView.vue';

const authStore = useAuthStore();

const mekudis = ref([]);
const isLoading = ref(false);
const isExporting = ref(false);
const totalRecords = ref(0);
const page = ref(1);
const perPage = ref(10);
const searchQuery = ref('');
const selectedKut = ref(null);
const kuts = ref([]);

const showBiographyModal = ref(false);
const selectedUser = ref(null);

const colDefs = ref([
    { field: 'username', label: 'Full Name', sortable: false },
    { field: 'role', label: 'Role / ឋានៈ', sortable: false },
    { field: 'email', label: 'Email Address', sortable: false },
    { field: 'phone', label: 'Phone Number', sortable: false },
    { field: 'wat', label: 'Wat Origin / វត្តកំណើត', sortable: false },
    { field: 'actions', label: 'Actions', sortable: false, width: '120px' }
]);

const fetchMekudis = async () => {
    isLoading.value = true;
    try {
        const params = {
            page: page.value,
            perPage: perPage.value,
            roleIds: '2', // Admin (Mekudi)
            search: searchQuery.value || undefined,
            kutId: selectedKut.value || undefined
        };
        const response = await api.get('/users', { params });
        mekudis.value = response.data?.data || response.data || [];
        if (response.data?.meta) {
            totalRecords.value = response.data.meta.totalItems;
        } else {
            totalRecords.value = mekudis.value.length;
        }
    } catch (error) {
        console.error('Failed to fetch mekudis:', error);
    } finally {
        isLoading.value = false;
    }
};

const viewBiography = (user) => {
    selectedUser.value = user;
    showBiographyModal.value = true;
};

const closeBiography = () => {
    showBiographyModal.value = false;
    selectedUser.value = null;
};

const exportToCSV = async () => {
    try {
        isExporting.value = true;
        const params = {
            page: 1,
            perPage: 10000,
            roleIds: '2',
            search: searchQuery.value || undefined,
            kutId: selectedKut.value || undefined
        };
        const response = await api.get('/users', { params });
        const records = response.data?.data || response.data || [];

        const headers = ['ល.រ (No.)', 'ឈ្មោះ (Name)', 'អ៊ីមែល (Email)', 'លេខទូរស័ព្ទ (Phone)', 'វត្តកំណើត (Wat Origin)'];
        const rows = records.map((mekudi, index) => {
            const profile = mekudi.UserProfile || mekudi.profile || {};
            const fullName = `${mekudi.lastName || ''} ${mekudi.firstName || ''}`.trim();
            const phone = profile.phone_number || profile.phone || '-';
            const wat = profile.from_wat || '-';
            return [
                index + 1,
                fullName,
                mekudi.email,
                phone,
                wat
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(e => e.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', `mekudi_biographies_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Failed to export Mekudis:', error);
    } finally {
        isExporting.value = false;
    }
};

const onSearchClear = () => {
    searchQuery.value = '';
    page.value = 1;
    fetchMekudis();
};

watch([page, perPage], () => { fetchMekudis(); });
watch(searchQuery, () => { page.value = 1; fetchMekudis(); });
watch(selectedKut, () => { page.value = 1; fetchMekudis(); });

const fetchKuts = async () => {
    try {
        const response = await api.get('/kuts');
        const data = response.data?.data || response.data || [];
        const sorted = data.slice().sort((a, b) => {
            const aNum = parseFloat(a.name);
            const bNum = parseFloat(b.name);
            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
            return (a.name || '').localeCompare(b.name || '');
        });
        kuts.value = [{ id: '', name: 'All Kudi / គ្រប់កុដិ' }, ...sorted];
    } catch (error) {
        console.error('Failed to fetch kuts:', error);
    }
};

onMounted(() => {
    fetchMekudis();
    fetchKuts();
});
</script>
