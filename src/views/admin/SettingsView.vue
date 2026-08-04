<template>
    <div class="settings-view">
        <Tabs v-model:value="activeTab" scrollable class="card gap-2 p-2"
            style="background-color: var(--surface-ground);">
            <div>
                <TabList>
                    <Tab value="profile">
                        <div class="d-flex align-items-center gap-2">
                            <UserRoundPen :size="16" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'profile'}">Profile</span>
                        </div>
                    </Tab>
                    <Tab value="password">
                        <div class="d-flex align-items-center gap-2">
                            <KeyRound style="color: var(--danger-color);" :size="16" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'password'}">Change Password</span>
                        </div>
                    </Tab>
                    <Tab value="appearance">
                        <div class="d-flex align-items-center gap-2">
                            <SunMoon style="color: var(--success-color);" :size="16" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'appearance'}">Appearance</span>
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
                        
                        <div class="col-lg-6 col-md-12 d-flex flex-column gap-3">
                            <div class="card p-3 gap-3"
                                style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius)">
                                <AccountSettingForm />
                            </div>
                        </div>
                    </div>
                </TabPanel>
                
                <TabPanel value="security">
                    <div class="row g-3">
                        <div class="col-lg-6 col-md-12 d-flex flex-column gap-3">
                            <div class="card p-4 gap-3"
                                style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius)">
                                <ChangePasswordForm />
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
                    <div class="row g-3">
                        <div class="col-lg-6 col-md-12">
                            <div class="card p-3 gap-3" style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius)">
                                <AppearanceForm />
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
import { Save, UserRoundPen, UserRoundCog, SunMoon, ShieldCheck, KeyRound, Smartphone, Download, Info } from '@lucide/vue';

const authStore = useAuthStore();
const userStore = useUserStore();
const currentUser = ref(null);
const isSaving = ref(false);
const isEditMode = ref(false);
const profileFormRef = ref(null);


const route = useRoute();
const router = useRouter();

const activeTab = ref('profile');
const VALID_TABS = ['profile', 'password', 'appearance', 'pwa', 'account', 'security'];

onMounted(() => {
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
