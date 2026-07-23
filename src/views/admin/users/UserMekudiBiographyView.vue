<template>
    <div style="background-color: var(--surface-ground);">
        <div class="mb-2 d-flex flex-column flex-xl-row align-items-xl-center gap-2 w-100">
            <div class="flex-grow-1 d-flex align-items-center gap-2 flex-wrap" style="min-width: 0;">
                <h5 class="fw-semibold mb-0" style="color: var(--text-heading-color);">Mekudi Biography / ប្រវត្តិរូបមេកុដិ</h5>
            </div>
            
            <div class="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 flex-shrink-0">
                <BaseButton variant="outline-success" class="d-flex align-items-center gap-2" @click="exportToCSV" :isLoading="isExporting">
                    <FileDown :size="16" />
                    <span>Export Excel (CSV)</span>
                </BaseButton>

                <div v-if="false" class="kudi-select" style="min-width: 180px;">
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

            <template #email="{ data }">
                <span>{{ data?.email }}</span>
            </template>

            <template #phone="{ data }">
                <span>{{ data?.UserProfile?.phone_number || data?.profile?.phone || '-' }}</span>
            </template>

            <template #school="{ data }">
                <span>{{ data?.UserProfile?.university_name || data?.profile?.university_name || '-' }}</span>
            </template>

            <template #year="{ data }">
                <span>{{ getYearLabel(data?.UserProfile?.university_year || data?.profile?.university_year) }}</span>
            </template>

            <template #action="{ data }">
                <BaseButton variant="outline-primary" size="sm" class="d-inline-flex align-items-center gap-2" @click="openSurvey(data)">
                    <BookOpen :size="14" />
                    <span>View Detail</span>
                </BaseButton>
            </template>
        </BaseTable>

        <MonkBiographySurveyModal 
            v-if="selectedUserId" 
            v-model="showSurveyModal" 
            :userId="selectedUserId" 
        />
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Search, User, BookOpen, FileDown } from '@lucide/vue';
import api from '@/api/api';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseBadge from '@/components/base/BaseBadge.vue';
import BaseSelect from '@/components/base/BaseSelect.vue';
import MonkBiographySurveyModal from './components/MonkBiographySurveyModal.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const monks = ref([]);
const isLoading = ref(false);
const isExporting = ref(false);
const totalRecords = ref(0);
const page = ref(1);
const perPage = ref(10);
const searchQuery = ref('');
const selectedKut = ref(null);
const kuts = ref([]);

const selectedUserId = ref(null);
const showSurveyModal = ref(false);

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

const yearOptions = [
    { label: 'Year 1', value: '1' },
    { label: 'Year 2', value: '2' },
    { label: 'Year 3', value: '3' },
    { label: 'Year 4', value: '4' },
    { label: 'Other', value: 'other' }
];

const getYearLabel = (value) => {
    if (!value) return '-';
    const opt = yearOptions.find(o => o.value === String(value));
    return opt ? opt.label : value;
};

const colDefs = ref([
    { field: 'username', label: 'Full Name', sortable: false },
    { field: 'email', label: 'Email Address', sortable: false },
    { field: 'phone', label: 'Phone Number', sortable: false },
    { field: 'school', label: 'School / University', sortable: false },
    { field: 'year', label: 'Year', sortable: false },
    { field: 'action', label: 'Actions', sortable: false, class: 'text-end' }
]);

const fetchMonks = async () => {
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

const onSearchClear = () => {
    searchQuery.value = '';
    page.value = 1;
    fetchMonks();
};

const openSurvey = (user) => {
    selectedUserId.value = user.id;
    showSurveyModal.value = true;
};

const exportToCSV = async () => {
    try {
        isExporting.value = true;
        const params = { roleIds: '2' };
        if (selectedKut.value) {
            params.kut_id = selectedKut.value;
        }
        const response = await api.get('/monk-surveys', { params });
        if (response.data?.success && response.data.data) {
            const surveys = response.data.data;
            
             const headers = [
                'ល.រ ',
                'តួនាទី ',
                'គោត្តនាម-នាម ',
                'សញ្ជាតិ ',
                'ថ្ងៃខែឆ្នាំកំណើត ',
                'លេខទូរស័ព្ទ ',
                'ខេត្ត ',
                'ស្រុក ',
                'ឃុំ ',
                'ភូមិ ',
                'ព្រះឧបជ្ឈាយ៍ ',
                'នាមឧបសម្បទាចារ្យ ',
                'អនុស្សាវនាចារ្យ ',
                'នាមបព្វជ្ជា ',
                'ថ្ងៃខែឆ្នាំបព្វជ្ជា ',
                'វត្តបព្វជ្ជា ',
                'ខេត្ត ',
                'ស្រុក ',
                'ឃុំ ',
                'អាសយដ្ឋានបច្ចុប្បន្ន - វត្ត ',
                'អាសយដ្ឋានបច្ចុប្បន្ន - ខេត្ត ',
                'អាសយដ្ឋានបច្ចុប្បន្ន - ស្រុក ',
                'អាសយដ្ឋានបច្ចុប្បន្ន - ឃុំ '
            ];

            // Sort surveys: Mekudi (2, 1) > Bhikkhu (7) > Samanera (3) > Others
            const getRolePriority = (roleId) => {
                if (roleId == 1 || roleId == 2) return 1; // SuperAdmin / Mekudi
                if (roleId == 7) return 2; // Bhikkhu
                if (roleId == 3) return 3; // Samanera
                return 4; // Others
            };

            surveys.sort((a, b) => {
                const roleA = (a.User || a.user || {}).Role || (a.User || a.user || {}).role || {};
                const roleIdA = roleA.id || (a.User || a.user || {}).role_id;
                const roleB = (b.User || b.user || {}).Role || (b.User || b.user || {}).role || {};
                const roleIdB = roleB.id || (b.User || b.user || {}).role_id;
                
                const pA = getRolePriority(roleIdA);
                const pB = getRolePriority(roleIdB);
                
                if (pA !== pB) return pA - pB;
                return (a.id || 0) - (b.id || 0);
            });

            const rows = surveys.map((survey, index) => {
                const user = survey.User || survey.user || {};
                const profile = user.UserProfile || user.profile || user.userProfile || {};
                const role = user.Role || user.role || {};
                
                const roleId = role.id || user.role_id;
                let roleLabel = role.name || '';
                if (roleId == 1 || roleId == 2) roleLabel = 'មេកុដិ'; // Treat SuperAdmin/Admin as Mekudi in this context
                else if (roleId == 7) roleLabel = 'ភិក្ខុ';
                else if (roleId == 3) roleLabel = 'សាមណេរ';

                const fullName = profile.first_name_kh || profile.last_name_kh
                    ? `${profile.last_name_kh || ''} ${profile.first_name_kh || ''}`.trim()
                    : (survey.surname_name || '').trim();
                
                const dob = profile.date_of_birth || survey.date_of_birth || '';
                const phone = profile.phone_number || survey.phone_number || '';
                
                return [
                    index + 1,
                    roleLabel,
                    fullName,
                    survey.nationality || '',
                    dob,
                    phone,
                    survey.pob_province || '',
                    survey.pob_district || '',
                    survey.pob_commune || '',
                    survey.pob_village || '',
                    survey.preceptor_name || '',
                    survey.first_assistant_preceptor || '',
                    survey.second_assistant_preceptor || '',
                    survey.ordained_name || '',
                    survey.ordination_date || '',
                    survey.poo_wat || '',
                    survey.poo_province || '',
                    survey.poo_district || '',
                    survey.poo_commune || '',
                    survey.current_wat || '',
                    survey.current_province || '',
                    survey.current_district || '',
                    survey.current_commune || ''
                ];
            });

            const csvContent = [
                headers.join(','),
                ...rows.map(e => e.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(","))
            ].join("\n");

            const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `monk_biography_surveys_${new Date().toISOString().slice(0,10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (error) {
        console.error('Failed to export surveys:', error);
    } finally {
        isExporting.value = false;
    }
};


watch([page, perPage], () => {
    fetchMonks();
});

watch(searchQuery, () => {
    page.value = 1;
    fetchMonks();
});

watch(selectedKut, () => {
    page.value = 1;
    fetchMonks();
});

onMounted(() => {
    fetchMonks();
    if (false) {
        fetchKuts();
    }
});
</script>
