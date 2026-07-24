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
                <span class="text-muted small">No Detail</span>
            </template>
        </BaseTable>


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
        const params = {
            page: 1,
            perPage: 10000,
            roleIds: '2', // Admin (Mekudi)
            search: searchQuery.value || undefined,
            kutId: selectedKut.value || undefined
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
            ...rows.map(e => e.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `mekudi_biographies_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Failed to export Mekudi:', error);
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
    fetchKuts();
});
</script>
