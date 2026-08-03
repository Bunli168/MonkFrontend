<template>
    <div style="background-color: var(--surface-ground);">
        <div class="mb-2 d-flex flex-column flex-xl-row align-items-xl-center gap-2 w-100">
            <div class="flex-grow-1 d-flex align-items-center gap-2 flex-wrap" style="min-width: 0;">
                <h5 class="fw-semibold mb-0" style="color: var(--text-heading-color);">Bhikkhu Biography <span class="d-none d-md-inline">/ ប្រវត្តិរូបភិក្ខុ</span></h5>
            </div>

            <div class="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 flex-shrink-0">
                <BaseButton variant="outline-success" class="d-flex align-items-center gap-2" @click="exportToCSV" :isLoading="isExporting">
                    <FileUp :size="16" />
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
                        placeholder="Search monks..."
                        :prefixIcon="Search"
                        clearable
                        @clear="onSearchClear"
                    />
                </div>
            </div>
        </div>

        <BaseTable
            :columns="colDefs"
            :rows="monks"
            :loading="isLoading"
            :total-records="totalRecords"
            v-model:page="page"
            v-model:per-page="perPage"
            @refresh-data="fetchMonks"
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
                <span class="badge rounded-pill border"
                      :class="data?.role?.name?.toLowerCase()?.includes('bhikkhu') ? 'bg-info bg-opacity-10 text-info border-info' : 'bg-secondary bg-opacity-10 text-secondary border-secondary'">
                    {{ getRoleDisplayName(data?.role?.name) }}
                </span>
            </template>

            <template #kut="{ data }">
                <span class="fw-medium text-dark">{{ data?.profile?.kut?.name || data?.UserProfile?.Kut?.name || data?.UserProfile?.kut?.name || '-' }}</span>
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
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Search, User, FileUp } from '@lucide/vue';
import BaseButton from '@/components/base/BaseButton.vue';
import api from '@/api/api';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseSelect from '@/components/base/BaseSelect.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import { useAuthStore } from '@/stores/auth';
import PagodaMonkBiographyView from '@/views/pagoda/PagodaMonkBiographyView.vue';

const authStore = useAuthStore();

const getRoleDisplayName = (roleName) => {
    if (!roleName) return '-';
    const name = roleName.toUpperCase();
    if (name === 'MONK') return 'សាមណេរ';
    if (name === 'BHIKKHU') return 'ភិក្ខុ';
    return roleName;
};

const monks = ref([]);
const isLoading = ref(false);
const isExporting = ref(false);
const totalRecords = ref(0);
const page = ref(1);
const perPage = ref(10);
const searchQuery = ref('');
const selectedKut = ref(null);
const kuts = ref([]);

const colDefs = ref([
    { field: 'username', label: 'Full Name', sortable: false },
    { field: 'role', label: 'Role / ឋានៈ', sortable: false },
    { field: 'kut', label: 'Kudi / កុដិ', sortable: false },
    { field: 'email', label: 'Email Address', sortable: false },
    { field: 'phone', label: 'Phone Number', sortable: false },
    { field: 'wat', label: 'Wat Origin / វត្តកំណើត', sortable: false },
    { field: 'actions', label: 'Actions', sortable: false, width: '120px' }
]);

const showBiographyModal = ref(false);
const selectedUser = ref(null);

const viewBiography = (user) => {
    selectedUser.value = user;
    showBiographyModal.value = true;
};

const closeBiography = () => {
    showBiographyModal.value = false;
    selectedUser.value = null;
};

const fetchMonks = async () => {
    isLoading.value = true;
    try {
        const params = {
            page: page.value,
            perPage: perPage.value,
            roleIds: '7', // Bhikkhus only
            search: searchQuery.value || undefined,
            kutId: selectedKut.value || undefined
        };
        const response = await api.get('/users', { params });
        monks.value = response.data?.data || response.data || [];
        if (response.data?.meta) {
            totalRecords.value = response.data.meta.totalItems;
        } else {
            totalRecords.value = monks.value.length;
        }
    } catch (error) {
        console.error('Failed to fetch monks:', error);
    } finally {
        isLoading.value = false;
    }
};

const exportToCSV = async () => {
    try {
        isExporting.value = true;

        // Fetch all monk surveys with user profile data
        const response = await api.get('/monk-surveys');
        const records = response.data?.data || [];

        const headers = [
            'ល.រ (No.)',
            'ឈ្មោះ (Surname-Name)',
            'ឈ្មោះបំពាក់ (Ordained Name)',
            'ថ្ងៃខែឆ្នាំកំណើត (Date of Birth)',
            'ជាតិសាសន៍ (Nationality)',
            'លេខទូរស័ព្ទ (Phone)',
            'លេខអត្តសញ្ញាណ (Chhaya No.)',
            'អ៊ីមែល (Email)',
            // Ordination
            'ព្រះឧបជ្ឈាយ៍ (Preceptor)',
            'អ្នកជួយ១ (1st Assistant)',
            'អ្នកជួយ២ (2nd Assistant)',
            'ថ្ងៃបួស (Ordained Date)',
            'វត្តបួស (Ordination Wat)',
            // Current Address
            'វត្តបច្ចុប្បន្ន (Current Wat)',
        ];

        const rows = records.map((survey, index) => {
            const profile = survey.User?.UserProfile || {};
            const phone = survey.phone_number || profile.phone_number || '-';
            const dob = survey.date_of_birth
                ? new Date(survey.date_of_birth).toLocaleDateString('en-GB')
                : (profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-GB') : '-');
            const ordDate = survey.ordained_date
                ? new Date(survey.ordained_date).toLocaleDateString('en-GB')
                : '-';

            return [
                index + 1,
                survey.surname_name || '-',
                survey.ordained_name || '-',
                dob,
                survey.nationality || '-',
                phone,
                profile.chhaya_number || '-',
                survey.User?.email || '-',
                survey.preceptor_name || '-',
                survey.first_assistant_name || '-',
                survey.second_assistant_name || '-',
                ordDate,
                survey.ordination_wat || '-',
                survey.current_wat || '-',
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(e => e.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', `bhikkhu_biographies_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Failed to export Monks:', error);
    } finally {
        isExporting.value = false;
    }
};

const onSearchClear = () => {
    searchQuery.value = '';
    page.value = 1;
    fetchMonks();
};

watch([page, perPage], () => { fetchMonks(); });
watch(searchQuery, () => { page.value = 1; fetchMonks(); });
watch(selectedKut, () => { page.value = 1; fetchMonks(); });

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
    fetchMonks();
    fetchKuts();
});
</script>
