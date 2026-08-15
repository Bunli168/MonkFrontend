<template>
    <div class="py-4">
        <!-- Search and Filter -->
        <div class="mb-4">
            <div class="row g-2 align-items-end">
                <div class="col-12 col-md-7 col-lg-8">
                    <BaseInput 
                        type="text" 
                        v-model="searchQuery" 
                        label="Search Unassigned Member"
                        placeholder="Search by name or phone..."
                        :prefixIcon="Search"
                    />
                </div>
                <div class="col-12 col-md-5 col-lg-4">
                    <BaseSelect 
                        v-model="selectedKudi" 
                        label="Kudi"
                        :options="[{label: 'All Kudis', value: ''}, ...kudiList.map(k => ({label: k.name || `Kudi ${k.id}`, value: k.name || k.id}))]"
                    />
                </div>
            </div>
        </div>

        <!-- Table -->
        <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
                <BaseTable 
                    :columns="colDefs" 
                    :rows="paginatedMonks" 
                    :loading="isLoading"
                    :show-index="true"
                    :total-records="filteredMonks.length"
                    v-model:page="currentPage"
                    v-model:per-page="perPage"
                >
                    <template #name="{ data: monk }">
                        <div class="d-flex align-items-center gap-3">
                            <div v-if="monk.profile?.avatar_url || monk.UserProfile?.avatar_url || monk.avatar_url" 
                                 class="avatar rounded-circle overflow-hidden shadow-sm flex-shrink-0" 
                                 style="width: 40px; height: 40px; border: 2px solid var(--primary-color);">
                                <img :src="`https://neakavorn.work.gd${monk.profile?.avatar_url || monk.UserProfile?.avatar_url || monk.avatar_url}`" 
                                     class="w-100 h-100 object-fit-cover" />
                            </div>
                            <div v-else class="avatar rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0 bg-white" 
                                 style="width: 40px; height: 40px;">
                                <img src="/app-logo.png" class="w-100 h-100 object-fit-cover rounded-circle" />
                            </div>
                            <div class="d-flex flex-column min-w-0">
                                <span class="fw-bold text-dark text-decoration-underline-hover text-truncate">{{ monk.fullName || monk.name }}</span>
                                <span v-if="monk.email" class="text-muted small text-truncate" style="font-size: 0.75rem;">{{ monk.email }}</span>
                            </div>
                        </div>
                    </template>

                    <template #kudi="{ data: monk }">
                        <span class="text-primary fw-medium">{{ monk.kudiNumber || '—' }}</span>
                    </template>
                    <template #row="{ data: monk }">
                        <span class="text-primary fw-medium">{{ monk.rowNumber || '—' }}</span>
                    </template>
                    <template #seat="{ data: monk }">
                        <span class="text-primary fw-medium">{{ monk.seatNumber || '—' }}</span>
                    </template>

                    <template #phone="{ data: monk }">
                        <span class="text-muted">{{ monk.phone || monk.chhaya_number || 'N/A' }}</span>
                    </template>

                    <template #absents="{ data: monk }">
                        <div class="d-flex justify-content-center w-100">
                            <span class="fw-bold text-secondary" style="font-size: 1rem;">
                                {{ monk.netAbsents || 0 }}
                            </span>
                        </div>
                    </template>

                    <template #role="{ data: monk }">
                        <BaseBadge 
                            :variant="(monk.role || '').toLowerCase().includes('bhikkhu') ? 'info' : 'secondary'"
                            :label="monk.role || 'Member'"
                            pill
                            size="sm"
                        />
                    </template>
                </BaseTable>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search } from '@lucide/vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import { useRouter } from 'vue-router';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseSelect from '@/components/base/BaseSelect.vue';
import BaseBadge from '@/components/base/BaseBadge.vue';

const toast = useToastStore();
const router = useRouter();
const allMonks = ref([]);
const kudiList = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const selectedKudi = ref('');
const currentPage = ref(1);
const perPage = ref(10);

const colDefs = computed(() => {
    return [
        { field: 'name', header: 'Monk Name', sortable: true },
        { field: 'role', header: 'Role', sortable: true },
        { field: 'kudi', header: 'Kudi', sortable: true, class: 'text-center' },
        { field: 'row', header: 'Row', sortable: true, class: 'text-center' },
        { field: 'seat', header: 'Seat', sortable: true, class: 'text-center' },
        { field: 'phone', header: 'Phone', sortable: false },
        { field: 'absents', header: 'Absents', sortable: true, class: 'text-center' }
    ];
});

const unassignedMonks = computed(() => {
    return allMonks.value.filter(m => !m.rowNumber && !m.seating_row_id);
});

const filteredMonks = computed(() => {
    let filtered = unassignedMonks.value;
    
    // Kudi filter
    if (selectedKudi.value) {
        filtered = filtered.filter(m => m.kudiNumber === selectedKudi.value);
    }
    
    // Search filter
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(m => 
            (m.fullName && m.fullName.toLowerCase().includes(query)) ||
            (m.kudiNumber && m.kudiNumber.toLowerCase().includes(query)) ||
            (m.phone && m.phone.toLowerCase().includes(query)) ||
            (m.chhaya_number && m.chhaya_number.toLowerCase().includes(query)) ||
            (m.email && m.email.toLowerCase().includes(query))
        );
    }
    return filtered;
});

const paginatedMonks = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    return filteredMonks.value.slice(start, start + perPage.value);
});

const viewMonk = (monk) => {
    // Basic navigation or modal, could be customized
    if (monk.id) {
        router.push(`/pagoda/monk-biography/${monk.id}`);
    }
};

const getLocalDateString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

const sortKudisNumerically = (list) => {
    return list.slice().sort((a, b) => {
        const extractNum = (item) => {
            const val = (item.name || item.id || '').toString();
            const khmerNums = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
            let res = val;
            khmerNums.forEach((kh, i) => {
                res = res.replaceAll(kh, i.toString());
            });
            const match = res.match(/\d+/);
            return match ? parseInt(match[0], 10) : 999999;
        };
        return extractNum(a) - extractNum(b) || (a.name || '').localeCompare(b.name || '');
    });
};

const fetchKudis = async () => {
    try {
        const response = await api.get('/kuts');
        const raw = response.data?.data || response.data || [];
        kudiList.value = sortKudisNumerically(raw);
    } catch (error) {
        console.error('Failed to fetch kudis:', error);
    }
};

const fetchData = async () => {
    isLoading.value = true;
    try {
        const res = await api.get('/attendances/monks-by-date', { params: { date: getLocalDateString() } });
        const rawMonks = res.data?.data || res.data || [];
        allMonks.value = rawMonks;
    } catch (error) {
        console.error('Failed to fetch monks:', error);
        toast.showToast('Failed to load data', 'error');
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchData();
    fetchKudis();
});
</script>

<style scoped>
/* Standard matching dashboard style */
</style>
