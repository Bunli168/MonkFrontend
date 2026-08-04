<template>
    <div style="background-color: var(--surface-ground);">
        <div class="mb-2 d-flex flex-column flex-xl-row align-items-xl-center gap-2 w-100">
            <div class="flex-grow-1 d-flex align-items-center gap-2 flex-wrap" style="min-width: 0;">
                <h5 class="fw-semibold mb-0" style="color: var(--text-heading-color);">Monk Biographies <span class="d-none d-md-inline">/ ប្រវត្តិព្រះសង្ឃ</span></h5>
            </div>

            <div class="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 flex-shrink-0">
                <BaseButton variant="outline-success" class="d-flex align-items-center gap-2" @click="exportToCSV" :isLoading="isExporting">
                    <FileUp :size="16" />
                    <span>Export Excel (CSV)</span>
                </BaseButton>
                <div class="kudi-select" style="min-width: 180px;" v-if="authStore.isSuperAdmin">
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
            roleIds: '3,7', // Monks/Samaneras and Bhikkhus
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

        // Fetch all monk surveys with user profile data (both Samaneras and Bhikkhus)
        const response = await api.get('/monk-surveys', { params: { role_id: '3,7' } });
        const records = response.data?.data || [];

        // Fetch locations to map IDs to names
        let locData = { provinces: [], districts: [], communes: [], villages: [] };
        try {
            const locRes = await api.get('/locations/all');
            if (locRes.data?.success && locRes.data?.data) {
                locData = locRes.data.data;
            }
        } catch (e) {
            console.error('Failed to fetch locations for export', e);
        }

        const getProvName = (id) => id ? locData.provinces?.find(p => String(p.id) === String(id))?.name || id : '';
        const getDistName = (id) => id ? locData.districts?.find(d => String(d.id) === String(id))?.name || id : '';
        const getCommName = (id) => id ? locData.communes?.find(c => String(c.id) === String(id))?.name || id : '';
        const getVillName = (id) => id ? locData.villages?.find(v => String(v.id) === String(id))?.name || id : '';

        const header1 = [
            'ល.រ', 'អត្តលេខ',
            'គោត្តនាមនិងនាម', '',
            'ភេទ', '',
            'ថ្ងៃខែឆ្នាំកំណើត',
            'ទីកន្លែងកំណើត', '', '', '',
            'អាសយដ្ឋានបច្ចុប្បន្ន', '', '', '',
            'លេខទូរស័ព្ទ', 'ផ្សេងៗ'
        ];

        const header2 = [
            '', '',
            'អក្សរខ្មែរ', 'អក្សរឡាតាំង',
            'ភិក្ខុ', 'សាមណេរ',
            '',
            'ភូមិ', 'ឃុំ', 'ស្រុក', 'ខេត្ត',
            'ភូមិ(វត្ត)', 'ឃុំ', 'ស្រុក', 'ខេត្ត',
            '', ''
        ];

        const sortedRecords = [...records].sort((a, b) => {
            const roleA = a.User?.role_id === 7 ? 0 : (a.User?.role_id === 3 ? 1 : 2);
            const roleB = b.User?.role_id === 7 ? 0 : (b.User?.role_id === 3 ? 1 : 2);
            return roleA - roleB;
        });

        const rows = sortedRecords.map((survey, index) => {
            const profile = survey.User?.UserProfile || {};
            const phone = survey.phone_number || profile.phone_number || '';
            let dob = '';
            if (survey.date_of_birth && !isNaN(new Date(survey.date_of_birth))) {
                dob = new Date(survey.date_of_birth).toLocaleDateString('en-GB');
            } else if (profile.date_of_birth && !isNaN(new Date(profile.date_of_birth))) {
                dob = new Date(profile.date_of_birth).toLocaleDateString('en-GB');
            }

            // Role 7 = Bhikkhu, Role 3 = Samanera
            const isBhikkhu = survey.User?.role_id === 7 ? 'ភិក្ខុ' : '';
            const isSamanera = survey.User?.role_id === 3 ? 'សាមណេរ' : '';

            const hasKhmer = (str) => /[\u1780-\u17FF\u19E0-\u19FF]/.test(str || '');
            let khmerName = '';
            let latinName = '';

            if (hasKhmer(survey.surname_name)) {
                khmerName = survey.surname_name;
                latinName = survey.latin_name || `${profile.first_name_en || ''} ${profile.last_name_en || ''}`.trim() || '';
            } else {
                // If surname_name is Latin/English (e.g., 'khmer kon', 'Sa Rak', 'Phi Bunli'), put it in Latin column
                latinName = survey.latin_name || survey.surname_name || `${profile.first_name_en || ''} ${profile.last_name_en || ''}`.trim() || '';
                const profKhName = `${profile.last_name_kh || ''} ${profile.first_name_kh || ''}`.trim();
                if (hasKhmer(profKhName)) {
                    khmerName = profKhName;
                } else {
                    khmerName = ''; // Leave blank so Latin text is NEVER displayed under អក្សរខ្មែរ
                }
            }

            return [
                index + 1, // ល.រ
                profile.chhaya_number || '', // អត្តលេខ
                khmerName, // គោត្តនាមនិងនាម - អក្សរខ្មែរ
                latinName, // គោត្តនាមនិងនាម - អក្សរឡាតាំង
                isBhikkhu, // ភេទ - ភិក្ខុ
                isSamanera, // ភេទ - សាមណេរ
                dob, // ថ្ងៃខែឆ្នាំកំណើត
                getVillName(survey.pob_village_id), // ទីកន្លែងកំណើត - ភូមិ
                getCommName(survey.pob_commune_id), // ទីកន្លែងកំណើត - ឃុំ
                getDistName(survey.pob_district_id), // ទីកន្លែងកំណើត - ស្រុក
                getProvName(survey.pob_province_id), // ទីកន្លែងកំណើត - ខេត្ត
                survey.current_wat || '', // អាសយដ្ឋានបច្ចុប្បន្ន - ភូមិ(វត្ត)
                getCommName(survey.current_commune_id), // អាសយដ្ឋានបច្ចុប្បន្ន - ឃុំ
                getDistName(survey.current_district_id), // អាសយដ្ឋានបច្ចុប្បន្ន - ស្រុក
                getProvName(survey.current_province_id), // អាសយដ្ឋានបច្ចុប្បន្ន - ខេត្ត
                phone, // លេខទូរស័ព្ទ
                survey.current_job || '' // ផ្សេងៗ
            ];
        });

        const csvContent = [
            header1.join(','),
            header2.join(','),
            ...rows.map(e => e.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', `monk_biographies_${new Date().toISOString().slice(0, 10)}.csv`);
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
