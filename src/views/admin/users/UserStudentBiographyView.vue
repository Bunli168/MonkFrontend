<template>
    <div style="background-color: var(--surface-ground);">
        <div class="mb-2 d-flex flex-column flex-xl-row align-items-xl-center gap-2 w-100">
            <div class="flex-grow-1 d-flex align-items-center gap-2 flex-wrap" style="min-width: 0;">
                <h5 class="fw-semibold mb-0" style="color: var(--text-heading-color);">Student Biography Surveys <span class="d-none d-md-inline">/ ប្រវត្តិរូបសង្ខេបសិស្សនិស្សិត</span></h5>
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
                        placeholder="Search students..."
                        :prefixIcon="Search"
                        clearable
                        @clear="onSearchClear"
                    />
                </div>
            </div>
        </div>

        <BaseTable
            :columns="colDefs"
            :rows="students"
            :loading="isLoading"
            :total-records="totalRecords"
            v-model:page="page"
            v-model:per-page="perPage"
            @refresh-data="fetchStudents"
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

            <template #kut="{ data }">
                <span class="fw-medium text-dark">{{ data?.profile?.kut?.name || data?.UserProfile?.Kut?.name || data?.UserProfile?.kut?.name || '-' }}</span>
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
                <BaseButton variant="outline-primary" size="sm" @click="viewBiography(data)">
                    View Biography
                </BaseButton>
            </template>
        </BaseTable>

        <BaseModal v-model="showSurveyModal" size="lg" title="Biography Survey / ប្រវត្តិរូបសង្ខេប" @close="closeBiography">
            <PagodaStudentBiographyView :user-id="selectedUserId" @close="closeBiography" hide-header :is-read-only="true" />
        </BaseModal>


    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Search, User, BookOpen, FileUp } from '@lucide/vue';
import api from '@/api/api';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseSelect from '@/components/base/BaseSelect.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import PagodaStudentBiographyView from '@/views/pagoda/PagodaStudentBiographyView.vue';

import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const students = ref([]);
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

const viewBiography = (user) => {
    selectedUserId.value = user.id;
    showSurveyModal.value = true;
};

const closeBiography = () => {
    showSurveyModal.value = false;
    selectedUserId.value = null;
};

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
    { field: 'kut', label: 'Kudi / កុដិ', sortable: false },
    { field: 'email', label: 'Email Address', sortable: false },
    { field: 'phone', label: 'Phone Number', sortable: false },
    { field: 'school', label: 'School / University', sortable: false },
    { field: 'year', label: 'Year', sortable: false },
    { field: 'action', label: 'Actions', sortable: false, class: 'text-end' }
]);

const fetchStudents = async () => {
    isLoading.value = true;
    try {
        const params = {
            page: page.value,
            perPage: perPage.value,
            roleId: 4, // Students only
            search: searchQuery.value || undefined,
            kutId: selectedKut.value || undefined
        };
        const response = await api.get('/users', { params });
        students.value = response.data?.data || response.data || [];
        if (response.data?.meta) {
            totalRecords.value = response.data.meta.totalItems;
        } else {
            totalRecords.value = students.value.length;
        }
    } catch (error) {
        console.error('Failed to fetch students:', error);
    } finally {
        isLoading.value = false;
    }
};

const onSearchClear = () => {
    searchQuery.value = '';
    page.value = 1;
    fetchStudents();
};

const openSurvey = (user) => {
    selectedUserId.value = user.id;
    showSurveyModal.value = true;
};

const exportToCSV = async () => {
    try {
        isExporting.value = true;
        const params = {
            page: 1,
            perPage: 10000,
            roleId: 4, // Students
            search: searchQuery.value || undefined,
            kutId: selectedKut.value || undefined,
            isActive: true
        };
        const response = await api.get('/users', { params });
        const records = response.data?.data || response.data || [];

        const headers = ['ល.រ (No.)', 'ឈ្មោះ (Name)', 'អ៊ីមែល (Email)', 'លេខទូរស័ព្ទ (Phone)', 'សាលា/សាកលវិទ្យាល័យ (School/University)', 'ឆ្នាំទី (Year)'];
        const rows = records.map((user, index) => {
            const profile = user.UserProfile || user.profile || {};
            const fullName = `${user.lastName || ''} ${user.firstName || ''}`.trim();
            const phone = profile.phone_number || profile.phone || '-';
            const school = profile.university_name || '-';
            const year = getYearLabel(profile.university_year);
            return [
                index + 1,
                fullName,
                user.email,
                phone,
                school,
                year
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(e => e.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', `student_biographies_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Failed to export student biographies:', error);
    } finally {
        isExporting.value = false;
    }
};

watch([page, perPage], () => { fetchStudents(); });
watch(searchQuery, () => { page.value = 1; fetchStudents(); });
watch(selectedKut, () => { page.value = 1; fetchStudents(); });

onMounted(() => {
    fetchStudents();
    fetchKuts();
});
</script>
