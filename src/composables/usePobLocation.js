import { ref, computed, reactive } from 'vue';
import pobData from '@/assets/data/pob_locations.json';

export function usePobLocation() {
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
            provinces.value = pobData.provinces.map(p => ({
                province_code: p.code,
                province_kh: p.name_kh,
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
            const prov = pobData.provinces.find(p => String(p.code) === String(provinceCode));
            if (prov && prov.districts) {
                districts.value = prov.districts.map(d => ({
                    district_code: d.code,
                    district_kh: d.name_kh,
                    district_en: d.name_en
                })).sort((a, b) => a.district_kh.localeCompare(b.district_kh));
            } else {
                districts.value = [];
            }
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
            let foundDist = null;
            for (const prov of pobData.provinces) {
                if (prov.districts) {
                    const dist = prov.districts.find(d => String(d.code) === String(districtCode));
                    if (dist) {
                        foundDist = dist;
                        break;
                    }
                }
            }
            if (foundDist && foundDist.communes) {
                communes.value = foundDist.communes.map(c => ({
                    commune_code: c.code,
                    commune_kh: c.name_kh,
                    commune_en: c.name_en
                })).sort((a, b) => a.commune_kh.localeCompare(b.commune_kh));
            } else {
                communes.value = [];
            }
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
            let foundComm = null;
            for (const prov of pobData.provinces) {
                if (prov.districts) {
                    for (const dist of prov.districts) {
                        if (dist.communes) {
                            const comm = dist.communes.find(c => String(c.code) === String(communeCode));
                            if (comm) {
                                foundComm = comm;
                                break;
                            }
                        }
                    }
                }
            }
            if (foundComm && foundComm.villages) {
                villages.value = foundComm.villages.map(v => ({
                    village_code: v.code,
                    village_kh: v.name_kh,
                    village_en: v.name_en
                })).sort((a, b) => a.village_kh.localeCompare(b.village_kh));
            } else {
                villages.value = [];
            }
        } finally {
            isLoadingVillages.value = false;
        }
    };

    return reactive({
        provinces,
        districts,
        communes,
        villages,
        provinceOptions,
        districtOptions,
        communeOptions,
        villageOptions,
        isLoadingProvinces,
        isLoadingDistricts,
        isLoadingCommunes,
        isLoadingVillages,
        fetchProvinces,
        fetchDistricts,
        fetchCommunes,
        fetchVillages
    });
}
