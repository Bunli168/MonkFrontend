import { ref, computed, reactive } from 'vue';
import api from '@/api/api';

// Global cache
let cache = null;
let isFetching = false;
let fetchPromise = null;

const fetchBackendLocations = async () => {
    if (cache) return cache;
    if (isFetching && fetchPromise) return fetchPromise;

    isFetching = true;
    fetchPromise = (async () => {
        try {
            const res = await api.get('/locations/all');
            const data = res.data;
            if (data.success && data.data) {
                cache = data.data;
            } else {
                cache = { provinces: [], districts: [], communes: [], villages: [] };
            }
        } catch (error) {
            console.error('Failed to fetch local locations:', error);
            cache = { provinces: [], districts: [], communes: [], villages: [] };
        }
        isFetching = false;
        return cache;
    })();

    return fetchPromise;
};

export function useLocation() {
    const provinces = ref([]);
    const districts = ref([]);
    const communes = ref([]);
    const villages = ref([]);

    const isLoadingProvinces = ref(false);
    const isLoadingDistricts = ref(false);
    const isLoadingCommunes = ref(false);
    const isLoadingVillages = ref(false);

    const provinceOptions = computed(() => provinces.value.map(p => ({ label: p.province_kh, value: p.province_code })));
    const districtOptions = computed(() => districts.value.map(d => ({ label: d.district_kh, value: d.district_code })));
    const communeOptions = computed(() => communes.value.map(c => ({ label: c.commune_kh, value: c.commune_code })));
    const villageOptions = computed(() => villages.value.map(v => ({ label: v.village_kh, value: v.village_code })));

    const fetchProvinces = async () => {
        isLoadingProvinces.value = true;
        try {
            const data = await fetchBackendLocations();
            provinces.value = data.provinces.map(p => ({
                province_code: p.id,
                province_kh: p.name,
                province_en: p.name_en
            })).sort((a, b) => a.province_kh.localeCompare(b.province_kh));
        } finally {
            isLoadingProvinces.value = false;
        }
    };

    const fetchDistricts = async (provinceCode) => {
        if (!provinceCode) {
            districts.value = [];
            return;
        }
        isLoadingDistricts.value = true;
        try {
            const data = await fetchBackendLocations();
            districts.value = data.districts
                .filter(d => d.province_id === provinceCode)
                .map(d => ({
                    district_code: d.id,
                    district_kh: d.name,
                    district_en: d.name_en
                })).sort((a, b) => a.district_kh.localeCompare(b.district_kh));
        } finally {
            isLoadingDistricts.value = false;
        }
    };

    const fetchCommunes = async (districtCode) => {
        if (!districtCode) {
            communes.value = [];
            return;
        }
        isLoadingCommunes.value = true;
        try {
            const data = await fetchBackendLocations();
            communes.value = data.communes
                .filter(c => c.district_id === districtCode)
                .map(c => ({
                    commune_code: c.id,
                    commune_kh: c.name,
                    commune_en: c.name_en
                })).sort((a, b) => a.commune_kh.localeCompare(b.commune_kh));
        } finally {
            isLoadingCommunes.value = false;
        }
    };

    const fetchVillages = async (communeCode) => {
        if (!communeCode) {
            villages.value = [];
            return;
        }
        isLoadingVillages.value = true;
        try {
            const data = await fetchBackendLocations();
            villages.value = data.villages
                .filter(v => v.commune_id === communeCode)
                .map(v => ({
                    village_code: v.id,
                    village_kh: v.name,
                    village_en: v.name_en
                })).sort((a, b) => a.village_kh.localeCompare(b.village_kh));
        } finally {
            isLoadingVillages.value = false;
        }
    };

    return reactive({
        provinces,
        districts,
        communes,
        villages,
        isLoadingProvinces,
        isLoadingDistricts,
        isLoadingCommunes,
        isLoadingVillages,
        provinceOptions,
        districtOptions,
        communeOptions,
        villageOptions,
        fetchProvinces,
        fetchDistricts,
        fetchCommunes,
        fetchVillages
    });
}
