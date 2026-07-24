<template>
    <div class="student-profile-form d-flex flex-column align-items-center" style="max-height: var(--profile-form-max-height, auto);">
        <div class="w-100" style="max-width: var(--profile-form-max-width, 1000px);">
            <!-- Summary View (Read Only) -->
            <div v-if="!isEditing" class="card p-4 mx-auto w-100" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                    <h5 class="fw-bold mb-0" style="color: var(--text-heading-color);">Student Profile Summary / ព័ត៌មានផ្ទាល់ខ្លួន</h5>
                    <BaseButton variant="outline-primary" @click="isEditing = true">
                        Edit Profile / កែសម្រួលព័ត៌មាន
                    </BaseButton>
                </div>

                <div class="row g-4">
                    <!-- Personal Info -->
                    <div class="col-12 col-md-6">
                        <div class="p-3 rounded h-100" style="background-color: var(--surface-ground);">
                            <h6 class="fw-bold text-primary mb-3">Personal Information / ព័ត៌មានផ្ទាល់ខ្លួន</h6>
                            <ul class="list-unstyled d-flex flex-column gap-2 mb-0" style="font-size: 0.95rem;">
                                <li><strong class="text-secondary">Name:</strong> {{ formData.UserProfile.last_name_kh }} {{ formData.UserProfile.first_name_kh }}</li>
                                <li><strong class="text-secondary">Date of Birth:</strong> {{ formatDate(formData.UserProfile.date_of_birth) }}</li>
                                <li><strong class="text-secondary">Phone Number:</strong> {{ formData.UserProfile.phone_number }}</li>
                                <li><strong class="text-secondary">Email:</strong> {{ formData.email }}</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Place of Birth -->
                    <div class="col-12 col-md-6">
                        <div class="p-3 rounded h-100" style="background-color: var(--surface-ground);">
                            <h6 class="fw-bold text-primary mb-3">Place of Birth / ទីកន្លែងកំណើត</h6>
                            <ul class="list-unstyled d-flex flex-column gap-2 mb-0" style="font-size: 0.95rem;">
                                <li><strong class="text-secondary">Province:</strong> {{ formData.Address.province || 'N/A' }}</li>
                                <li><strong class="text-secondary">District:</strong> {{ formData.Address.district || 'N/A' }}</li>
                                <li><strong class="text-secondary">Commune:</strong> {{ formData.Address.commune || 'N/A' }}</li>
                                <li><strong class="text-secondary">Village:</strong> {{ formData.Address.village || 'N/A' }}</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Education -->
                    <div class="col-12">
                        <div class="p-3 rounded" style="background-color: var(--surface-ground);">
                            <h6 class="fw-bold text-primary mb-3">Education / ការសិក្សា</h6>
                            <ul class="list-unstyled d-flex flex-column gap-2 mb-0" style="font-size: 0.95rem;">
                                <li><strong class="text-secondary">University / School:</strong> {{ formData.UserProfile.university_name || 'N/A' }}</li>
                                <li><strong class="text-secondary">Year:</strong> {{ getYearLabel(formData.UserProfile.university_year) }}</li>
                                <li v-if="formData.UserProfile.kut_id"><strong class="text-secondary">Kudi Number:</strong> {{ formData.UserProfile.kut_id }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Edit View (Form) -->
            <div v-else>
            <!-- Step Indicator -->
            <div class="d-flex align-items-center mb-4 overflow-auto pb-2 justify-content-center" style="gap: 0.5rem;">
                <div v-for="(step, index) in steps" :key="index" 
                     class="d-flex align-items-center" 
                     :style="{ opacity: currentStep >= index + 1 ? '1' : '0.5' }">
                    <div class="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold" 
                         :class="currentStep >= index + 1 ? 'bg-primary' : 'bg-secondary'" 
                         style="width: 28px; height: 28px; font-size: 0.85rem;">
                        {{ index + 1 }}
                    </div>
                    <span class="ms-2 fw-medium text-nowrap" :class="currentStep === index + 1 ? 'text-primary' : 'text-muted'" style="font-size: 0.9rem;">
                        {{ step.name }}
                    </span>
                    <div v-if="index < steps.length - 1" class="mx-3 bg-secondary" style="height: 2px; width: 30px; opacity: 0.3;"></div>
                </div>
            </div>

            <form @submit.prevent="handleNextOrSave" class="d-flex flex-column">
                
                <!-- Step 1: Personal Info -->
                <div v-show="currentStep === 1" class="card p-4 mx-auto w-100" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
                    <h5 class="fw-bold mb-4" style="color: var(--text-heading-color);">Personal Information / ព័ត៌មានផ្ទាល់ខ្លួន</h5>
                    
                    <div class="row g-3">
                        <div class="col-12 col-md-6">
                            <label class="form-label">First Name (នាម) <span class="text-danger">*</span></label>
                            <BaseInput v-model="formData.UserProfile.first_name_kh" placeholder="Enter first name" :required="currentStep === 1" />
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label">Last Name (គោត្តនាម) <span class="text-danger">*</span></label>
                            <BaseInput v-model="formData.UserProfile.last_name_kh" placeholder="Enter last name" :required="currentStep === 1" />
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label">Date of Birth (ថ្ងៃខែឆ្នាំកំណើត) <span class="text-danger">*</span></label>
                            <BaseDatePicker v-model="formData.UserProfile.date_of_birth" placeholder="Select date of birth" :required="currentStep === 1" />
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label">Phone Number (លេខទូរស័ព្ទ) <span class="text-danger">*</span></label>
                            <BaseInput v-model="formData.UserProfile.phone_number" placeholder="Enter phone number" :required="currentStep === 1" :error="errors.phone_number" @input="validatePhone" />
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label">Gender</label>
                            <BaseSelect v-model="formData.UserProfile.gender" :options="genderOptions" placeholder="Select gender" />
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label">Email (អ៊ីមែល)</label>
                            <BaseInput v-model="formData.email" placeholder="Enter email" required />
                        </div>
                    </div>
                </div>

                <!-- Step 2: Place of Birth -->
                <div v-show="currentStep === 2" class="card p-4 mx-auto w-100" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
                    <h5 class="fw-bold mb-4" style="color: var(--text-heading-color);">Place of Birth / ទីកន្លែងកំណើត</h5>
                    
                    <div class="row g-3">
                        <div class="col-12 col-md-6">
                            <label class="form-label">Province (ខេត្ត/ក្រុង)</label>
                            <BaseSelect 
                                v-model="formData.Address.province_id" 
                                :options="provinceOptions" 
                                placeholder="Select province" 
                                :loading="isLoadingProvinces"
                                :required="currentStep === 2"
                                @update:modelValue="onProvinceChange"
                            />
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label">District (ស្រុក/ខណ្ឌ)</label>
                            <BaseSelect 
                                v-model="formData.Address.district_id" 
                                :options="districtOptions" 
                                placeholder="Select district" 
                                :loading="isLoadingDistricts"
                                :disabled="!formData.Address.province_id"
                                @update:modelValue="onDistrictChange"
                            />
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label">Commune (ឃុំ/សង្កាត់)</label>
                            <BaseSelect 
                                v-model="formData.Address.commune_id" 
                                :options="communeOptions" 
                                placeholder="Select commune" 
                                :loading="isLoadingCommunes"
                                :disabled="!formData.Address.district_id"
                                @update:modelValue="onCommuneChange"
                            />
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label">Village (ភូមិ)</label>
                            <BaseSelect 
                                v-model="formData.Address.village_id" 
                                :options="villageOptions" 
                                placeholder="Select village" 
                                :loading="isLoadingVillages"
                                :disabled="!formData.Address.commune_id"
                            />
                        </div>
                    </div>
                </div>

                <!-- Step 3: Education -->
                <div v-show="currentStep === 3" class="card p-4 mx-auto w-100" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
                    <h5 class="fw-bold mb-4" style="color: var(--text-heading-color);">Education / ការសិក្សា</h5>
                    
                    <div class="row g-3">
                        <div class="col-12 col-md-6">
                            <label class="form-label">University / School (រៀននៅ)</label>
                            <BaseInput v-model="formData.UserProfile.university_name" placeholder="Enter university or school name" :error="errors.university_name" @input="validateUniversity" />
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label">Year (ឆ្នាំទី)</label>
                            <BaseSelect v-model="formData.UserProfile.university_year" :options="yearOptions" placeholder="Select year" />
                        </div>
                    </div>
                </div>

                <!-- Navigation Buttons -->
                <div class="d-flex justify-content-between align-items-center mt-4 w-100">
                    <BaseButton type="button" variant="outline-secondary" @click="cancelEdit" class="px-4">
                        Cancel
                    </BaseButton>
                    
                    <div class="d-flex gap-2">
                        <BaseButton type="button" variant="outline-secondary" @click="currentStep--" v-if="currentStep > 1" class="px-4">
                            Back
                        </BaseButton>
                        
                        <BaseButton type="submit" variant="primary" :isLoading="isSaving" v-if="currentStep === steps.length" class="px-5">
                            Save Information
                        </BaseButton>
                        <BaseButton type="submit" variant="primary" v-else class="px-5">
                            Next Step
                        </BaseButton>
                    </div>
                </div>

            </form>
        </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { formatDate } from '@/utils/dateFormat';
import api from '@/api/api';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseDatePicker from '@/components/base/BaseDatePicker.vue';
import BaseSelect from '@/components/base/BaseSelect.vue';
import BaseButton from '@/components/base/BaseButton.vue';

const authStore = useAuthStore();
const toastStore = useToastStore();
const isSaving = ref(false);
const isEditing = ref(false);
const hasExistingProfile = ref(false);
const currentStep = ref(1);

const steps = [
    { name: 'Personal Information' },
    { name: 'Place of Birth' },
    { name: 'Education' }
];

const yearOptions = [
    { label: 'Year 1 (ឆ្នាំទី១)', value: '1' },
    { label: 'Year 2 (ឆ្នាំទី២)', value: '2' },
    { label: 'Year 3 (ឆ្នាំទី៣)', value: '3' },
    { label: 'Year 4 (ឆ្នាំទី៤)', value: '4' },
    { label: 'Other', value: 'other' }
];

const genderOptions = [
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' }
];

const getYearLabel = (value) => {
    const opt = yearOptions.find(o => o.value === value);
    return opt ? opt.label : (value || 'N/A');
};

// Location data
const provinces = ref([]);
const districts = ref([]);
const communes = ref([]);
const villages = ref([]);

const isLoadingProvinces = ref(false);
const isLoadingDistricts = ref(false);
const isLoadingCommunes = ref(false);
const isLoadingVillages = ref(false);

const provinceOptions = computed(() => 
    provinces.value.map(p => ({ label: p.name, value: p.id }))
);

const districtOptions = computed(() => 
    districts.value.map(d => ({ label: d.name, value: d.id }))
);

const communeOptions = computed(() => 
    communes.value.map(c => ({ label: c.name, value: c.id }))
);

const villageOptions = computed(() => 
    villages.value.map(v => ({ label: v.name, value: v.id }))
);

const fetchProvinces = async () => {
    isLoadingProvinces.value = true;
    try {
        const response = await api.get('/provinces');
        provinces.value = response.data?.data || response.data || [];
    } catch (error) {
        console.error('Failed to fetch provinces:', error);
    } finally {
        isLoadingProvinces.value = false;
    }
};

const fetchDistricts = async (provinceId) => {
    if (!provinceId) {
        districts.value = [];
        return;
    }
    isLoadingDistricts.value = true;
    try {
        const response = await api.get('/districts', { params: { province_id: provinceId } });
        districts.value = response.data?.data || response.data || [];
    } catch (error) {
        console.error('Failed to fetch districts:', error);
    } finally {
        isLoadingDistricts.value = false;
    }
};

const fetchCommunes = async (districtId) => {
    if (!districtId) {
        communes.value = [];
        return;
    }
    isLoadingCommunes.value = true;
    try {
        const response = await api.get('/communes', { params: { district_id: districtId } });
        communes.value = response.data?.data || response.data || [];
    } catch (error) {
        console.error('Failed to fetch communes:', error);
    } finally {
        isLoadingCommunes.value = false;
    }
};

const fetchVillages = async (communeId) => {
    if (!communeId) {
        villages.value = [];
        return;
    }
    isLoadingVillages.value = true;
    try {
        const response = await api.get('/villages', { params: { commune_id: communeId } });
        villages.value = response.data?.data || response.data || [];
    } catch (error) {
        console.error('Failed to fetch villages:', error);
    } finally {
        isLoadingVillages.value = false;
    }
};

const onProvinceChange = async (provinceId) => {
    formData.value.Address.district_id = null;
    formData.value.Address.commune_id = null;
    formData.value.Address.village_id = null;
    districts.value = [];
    communes.value = [];
    villages.value = [];
    if (provinceId) {
        await fetchDistricts(provinceId);
    }
};

const onDistrictChange = (districtId) => {
    formData.value.Address.commune_id = null;
    formData.value.Address.village_id = null;
    communes.value = [];
    villages.value = [];
    if (districtId) {
        fetchCommunes(districtId);
    }
};

const onCommuneChange = (communeId) => {
    formData.value.Address.village_id = null;
    villages.value = [];
    if (communeId) {
        fetchVillages(communeId);
    }
};

const formData = ref({
    email: '',
    UserProfile: {
        first_name_kh: '',
        last_name_kh: '',
        date_of_birth: null,
        phone_number: '',
        gender: '',
        university_name: '',
        university_year: '',
        place_of_birth: '',
        kut_id: null
    },
    Address: {
        address_type: 'birth_place',
        province: '',
        district: '',
        commune: '',
        village: '',
        province_id: null,
        district_id: null,
        commune_id: null,
        village_id: null,
    }
});

const cancelEdit = () => {
    if (hasExistingProfile.value) {
        isEditing.value = false;
    } else {
        currentStep.value = 1;
    }
};

const handleNextOrSave = () => {
    if (currentStep.value === 1) {
        if (!validatePhone()) {
            return;
        }
    }

    if (currentStep.value < steps.length) {
        currentStep.value++;
    } else {
        saveProfile();
    }
};

const errors = ref({
    phone_number: '',
    university_name: ''
});

const validatePhone = () => {
    const val = formData.value.UserProfile.phone_number;
    if (val && /[^0-9 ]/.test(val)) {
        errors.value.phone_number = 'Phone number can only contain numbers and spaces';
        return false;
    } else {
        errors.value.phone_number = '';
        return true;
    }
};

const validateUniversity = () => {
    const val = formData.value.UserProfile.university_name;
    if (val && /[0-9]/.test(val)) {
        errors.value.university_name = 'University / School name cannot contain numbers';
        return false;
    } else {
        errors.value.university_name = '';
        return true;
    }
};

const loadProfile = async () => {
    try {
        const response = await api.get('/auth/profile');
        if (response.data?.success) {
            const user = response.data.user || response.data.data;
            formData.value.email = user.email || '';
            
            if (user.UserProfile) {
                formData.value.UserProfile = {
                    first_name_kh: user.UserProfile.first_name_kh || user.UserProfile.first_name_en || '',
                    last_name_kh: user.UserProfile.last_name_kh || user.UserProfile.last_name_en || '',
                    date_of_birth: user.UserProfile.date_of_birth || null,
                    phone_number: user.UserProfile.phone_number || '',
                    gender: user.UserProfile.gender || '',
                    university_name: user.UserProfile.university_name || '',
                    university_year: user.UserProfile.university_year || '',
                    place_of_birth: user.UserProfile.place_of_birth || '',
                    kut_id: user.UserProfile.kut_id || null
                };
                
                hasExistingProfile.value = !!user.UserProfile.phone_number;
                isEditing.value = false;
            } else {
                hasExistingProfile.value = false;
                isEditing.value = false;
            }

            if (user.Addresses && user.Addresses.length > 0) {
                const birthPlace = user.Addresses.find(a => a.address_type === 'birth_place') || user.Addresses[0];
                formData.value.Address = {
                    address_type: 'birth_place',
                    province: birthPlace.province || '',
                    district: birthPlace.district || '',
                    commune: birthPlace.commune || '',
                    village: birthPlace.village || '',
                    province_id: birthPlace.province_id || null,
                    district_id: birthPlace.district_id || null,
                    commune_id: birthPlace.commune_id || null,
                    village_id: birthPlace.village_id || null,
                };
                
                // Load cascading data if IDs exist
                if (birthPlace.province_id) {
                    await fetchDistricts(birthPlace.province_id);
                }
                if (birthPlace.district_id) {
                    await fetchCommunes(birthPlace.district_id);
                }
                if (birthPlace.commune_id) {
                    await fetchVillages(birthPlace.commune_id);
                }
            }
        }
    } catch (error) {
        console.error('Failed to load profile:', error);
        hasExistingProfile.value = false;
        isEditing.value = true;
    }
};

const saveProfile = async () => {
    isSaving.value = true;
    try {
        const userProfileData = { ...formData.value.UserProfile };
        
        const payload = {
            email: formData.value.email,
            UserProfile: userProfileData,
            Address: { ...formData.value.Address }
        };
        
        if (payload.UserProfile.date_of_birth instanceof Date) {
            payload.UserProfile.date_of_birth = payload.UserProfile.date_of_birth.toISOString().split('T')[0];
        }

        console.log('Saving profile with payload:', payload);
        const response = await api.put('/auth/profile', payload);
        console.log('Save response:', response.data);
        
        if (response.data?.success) {
            toastStore.showToast('Profile information saved successfully', 'success');
            await authStore.getProfile();
            await loadProfile();
            hasExistingProfile.value = true;
            isEditing.value = false;
        } else {
            toastStore.showToast(response.data?.message || 'Failed to save profile', 'error');
        }
    } catch (error) {
        console.error('Save profile error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to save profile';
        toastStore.showToast(errorMessage, 'error');
    } finally {
        isSaving.value = false;
    }
};

onMounted(async () => {
    await fetchProvinces();
    await loadProfile();
});
</script>

<style scoped>
/* StudentProfileForm component style */
</style>
