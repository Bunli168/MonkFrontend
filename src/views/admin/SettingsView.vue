<template>
    <div class="settings-view">
        <Tabs v-model:value="activeTab" scrollable class="card gap-2 p-2"
            style="background-color: var(--surface-ground);">
            <div>
                <TabList>
                    <Tab value="profile">
                        <div class="d-flex align-items-center gap-2">
                            <UserRoundPen :size="16" />
                            Profile
                        </div>
                    </Tab>
                    <Tab value="password">
                        <div class="d-flex align-items-center gap-2">
                            <KeyRound style="color: var(--danger-color);" :size="16" />
                            Change Password
                        </div>
                    </Tab>
                    <Tab value="appearance">
                        <div class="d-flex align-items-center gap-2">
                            <SunMoon style="color: var(--success-color);" :size="16" />
                            Appearance
                        </div>
                    </Tab>
                    <Tab value="pwa">
                        <div class="d-flex align-items-center gap-2">
                            <Smartphone style="color: var(--warning-color);" :size="16" />
                            Install App (PWA)
                        </div>
                    </Tab>
                </TabList>
            </div>
            <TabPanels class="p-0 bg-transparent">
                <TabPanel value="profile">
                    <div class="row g-3">
                        <div class="col-lg-6 col-md-12 d-flex flex-column gap-3">
                            <div class="card p-3 gap-3"
                                style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius)">
                                <ProfileForm ref="profileFormRef" :initialData="currentUser" :disabled="!isEditMode" />
                                <div class="d-flex justify-content-end gap-2">
                                    <BaseButton v-if="!isEditMode" @click="isEditMode = true" variant="primary">
                                        <UserRoundPen :size="18" class="me-1" /> Update Profile
                                    </BaseButton>
                                    <template v-else>
                                        <BaseButton @click="cancelEdit" variant="outline-primary">
                                            Cancel
                                        </BaseButton>
                                        <BaseButton @click="saveProfile" variant="primary" :disabled="isSaving">
                                            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"
                                                role="status" aria-hidden="true"></span>
                                            <span v-else>
                                                <Save :size="18" class="d-flex" />
                                            </span>
                                            {{ isSaving ? 'Saving...' : 'Save Profile' }}
                                        </BaseButton>
                                    </template>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-lg-6 col-md-12">
                            <div class="card p-3 gap-3"
                                style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius)">
                                <AccountSettingForm />
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel value="password">
                    <div class="row">
                        <div class="col-lg-7 col-md-12">
                            <div class="card p-3 gap-3"
                                style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius)">
                                <ChangePasswordForm />
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel value="appearance">
                    <div class="row">
                        <div class="col-lg-6 col-md-12">
                            <div class="card p-3 gap-3" style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius)">
                                <AppearanceForm />
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel value="pwa">
                    <div class="row">
                        <div class="col-lg-8 col-md-12">
                            <div class="card p-4 gap-3" style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius)">
                                <div class="d-flex align-items-center gap-3 border-bottom pb-3">
                                    <div class="p-3 bg-warning bg-opacity-10 rounded-circle text-warning d-flex align-items-center justify-content-center">
                                        <Smartphone :size="32" />
                                    </div>
                                    <div>
                                        <h5 class="fw-bold mb-1">ប្រព័ន្ធគ្រប់គ្រងវត្តអារាម (Pagoda Management App)</h5>
                                        <p class="text-muted small mb-0">ដំឡើងកម្មវិធីចូលក្នុងទូរស័ព្ទ ឬកុំព្យូទ័រ ដើម្បីងាយស្រួលប្រើប្រាស់ និងលឿនជាងមុន</p>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-end pt-2">
                                    <button @click="triggerInstall" class="btn btn-warning d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm fw-bold">
                                        <Smartphone :size="18" />
                                        <span>📲 ដំឡើងកម្មវិធីឥឡូវនេះ (Install Now)</span>
                                    </button>
                                </div>

                                <div class="mt-2">
                                    <h6 class="fw-bold mb-3">📲 របៀបដំឡើងកម្មវិធី៖</h6>
                                    
                                    <div class="mb-3 p-3 bg-light rounded border">
                                        <h6 class="fw-bold mb-2 text-primary d-flex align-items-center gap-2">
                                            <span>🍏 សម្រាប់ទូរស័ព្ទ iPhone / iPad (Safari)</span>
                                        </h6>
                                        <ol class="mb-0 ps-3 small text-muted">
                                            <li class="mb-1">ចុចលើប៊ូតុង <b>Share (ចែករំលែក) 📤</b> នៅបាតកណ្តាលខាងក្រោមនៃអេក្រង់។</li>
                                            <li class="mb-1">អូសចុះក្រោម រួចជ្រើសរើសយកពាក្យ <b>"Add to Home Screen" ➕</b>។</li>
                                            <li>ចុចពាក្យ <b>Add</b> នៅជ្រុងលើខាងស្តាំ ជាការស្រេច!</li>
                                        </ol>
                                    </div>

                                    <div class="mb-3 p-3 bg-light rounded border">
                                        <h6 class="fw-bold mb-2 text-success d-flex align-items-center gap-2">
                                            <span>🤖 សម្រាប់ទូរស័ព្ទ Android / Chrome (PC)</span>
                                        </h6>
                                        <ol class="mb-0 ps-3 small text-muted">
                                            <li class="mb-1">ចុចសញ្ញាចុច ៣ <b>(⋮)</b> នៅជ្រុងលើខាងស្តាំក្នុង Browser។</li>
                                            <li>ជ្រើសរើសយកពាក្យ <b>"Install app" / "Add to Home screen"</b>។</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Tab, TabList, TabPanels, TabPanel, Tabs } from 'primevue';
import ProfileForm from '@/components/forms/profile/ProfileForm.vue';
import AppearanceForm from '@/components/forms/profile/AppearanceForm.vue';
import AccountSettingForm from '@/components/forms/profile/AccountSettingForm.vue';
import ChangePasswordForm from '@/components/forms/profile/ChangePasswordForm.vue';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/users/user';
import { useToastStore } from '@/stores/toast';
import { Save, UserRoundPen, UserRoundCog, SunMoon, ShieldCheck, KeyRound, Smartphone } from '@lucide/vue';

const authStore = useAuthStore();
const userStore = useUserStore();
const currentUser = ref(null);
const isSaving = ref(false);
const isEditMode = ref(false);
const profileFormRef = ref(null);

const deferredPrompt = ref(null);
const handleInstallPrompt = (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
};

const triggerInstall = async () => {
    if (deferredPrompt.value) {
        deferredPrompt.value.prompt();
        const { outcome } = await deferredPrompt.value.userChoice;
        if (outcome === 'accepted') {
            deferredPrompt.value = null;
        }
    } else {
        alert('សូមអនុវត្តតាមការណែនាំខាងក្រោម ដើម្បីដំឡើងកម្មវិធីចូលក្នុងឧបករណ៍របស់អ្នក!');
    }
};

const route = useRoute();
const router = useRouter();

const activeTab = ref('profile');
const VALID_TABS = ['profile', 'password', 'appearance', 'pwa', 'account', 'security'];

onMounted(() => {
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    let targetTab = route.query.tab;
    if (targetTab === 'account' || targetTab === 'security') targetTab = 'profile';
    if (targetTab && VALID_TABS.includes(targetTab)) {
        activeTab.value = targetTab;
    } else if (route.query.tab) {
        // Fix the URL if tab is invalid
        router.replace({ query: { ...route.query, tab: activeTab.value } });
    }
    loadCurrentUser();
});

onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
});

watch(activeTab, (newTab) => {
    router.replace({ query: { ...route.query, tab: newTab } });
});

const loadCurrentUser = async () => {
    if (authStore.user) {
        currentUser.value = authStore.user;
    }
};

const cancelEdit = () => {
    isEditMode.value = false;
    if (profileFormRef.value) {
        profileFormRef.value.initForm();
    }
};

const saveProfile = async () => {
    isSaving.value = true;
    const formRef = profileFormRef.value;
    if (!formRef) {
        isSaving.value = false;
        return;
    }

    const payload = await formRef.validateForm();
    if (!payload) {
        isSaving.value = false;
        return;
    }

    try {
        const { avatar, ...profileData } = payload;

        const success = await authStore.updateProfile(profileData);
        if (!success) {
            return;
        }

        if (avatar instanceof File) {
            const formData = new FormData();
            formData.append('avatar', avatar);
            await userStore.uploadProfileAvatar(formData);
        } else if (avatar === 'DELETE') {
            await userStore.deleteProfileAvatar();
        }

        await authStore.getProfile();
        if (authStore.user) {
            currentUser.value = authStore.user;
        }
        isEditMode.value = false;
    } finally {
        isSaving.value = false;
    }
};
</script>
