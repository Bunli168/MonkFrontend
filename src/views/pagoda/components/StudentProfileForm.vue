<template>
    <div class="student-profile-form d-flex flex-column align-items-center" style="max-height: var(--profile-form-max-height, auto);">
        <div class="w-100" style="max-width: var(--profile-form-max-width, 1000px);">
            <!-- Summary View (Read Only) -->
            <div v-if="!isEditing" class="card p-4 mx-auto w-100" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                    <h5 class="fw-bold mb-0" style="color: var(--text-heading-color);">Student Profile Summary / ព័ត៌មានផ្ទាល់ខ្លួន</h5>
                    <BaseButton variant="outline-primary" class="w-100 w-md-auto" @click="isEditing = true">
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
                            <BaseInput v-model="formData.UserProfile.phone_number" placeholder="Enter phone number" :required="currentStep === 1" />
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
                            <BaseInput v-model="formData.Address.province" placeholder="Enter province or city" :required="currentStep === 2" />
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label">District (ស្រុក/ខណ្ឌ)</label>
                            <BaseInput v-model="formData.Address.district" placeholder="Enter district or khan" />
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label">Commune (ឃុំ/សង្កាត់)</label>
                            <BaseInput v-model="formData.Address.commune" placeholder="Enter commune or sangkat" />
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label">Village (ភូមិ)</label>
                            <BaseInput v-model="formData.Address.village" placeholder="Enter village" />
                        </div>
                    </div>
                </div>

                <!-- Step 3: Education -->
                <div v-show="currentStep === 3" class="card p-4 mx-auto w-100" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
                    <h5 class="fw-bold mb-4" style="color: var(--text-heading-color);">Education / ការសិក្សា</h5>
                    
                    <div class="row g-3">
                        <div class="col-12 col-md-6">
                            <label class="form-label">University / School (រៀននៅ)</label>
                            <BaseInput v-model="formData.UserProfile.university_name" placeholder="Enter university or school name" />
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
import { ref, onMounted } from 'vue';
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
    if (currentStep.value < steps.length) {
        currentStep.value++;
    } else {
        saveProfile();
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
                };
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

onMounted(() => {
    loadProfile();
});
</script>

<style scoped>
/* StudentProfileForm component style */
</style>
