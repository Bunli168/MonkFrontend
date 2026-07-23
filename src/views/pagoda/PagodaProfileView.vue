<template>
  <div class="settings-view">
    <div class="row g-3">
      <div class="col-lg-6 col-md-12">
        <div class="card p-3 gap-3" style="background-color: var(--body-bg-color); border-radius: var(--border-radius)">
          <ProfileForm ref="profileFormRef" :initialData="currentUser" :disabled="!isEditMode" />
          <div class="d-flex justify-content-end gap-2">
            <BaseButton v-if="!isEditMode" @click="isEditMode = true" variant="primary">
              <UserRoundPen :size="18" class="me-1" /> Update Profile
            </BaseButton>
            <template v-else>
              <BaseButton @click="cancelEdit" variant="outline-primary">
                Cancel
              </BaseButton>
              <BaseButton @click="saveProfile" variant="primary" :isLoading="isSaving">
                <span v-if="!isSaving">
                  <Save :size="18" class="d-flex" />
                </span>
                {{ isSaving ? 'Saving...' : 'Save Profile' }}
              </BaseButton>
            </template>
          </div>
        </div>
      </div>
      <div class="col-lg-6 col-md-12">
        <div class="card p-3 gap-3 mb-3"
          style="background-color: var(--body-bg-color); border-radius: var(--border-radius)">
          <SettingForm />
        </div>
        <div class="card p-3 gap-3 mb-3"
          style="background-color: var(--body-bg-color); border-radius: var(--border-radius)">
          <AppearanceForm />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ProfileForm from '@/components/forms/profile/ProfileForm.vue';
import SettingForm from '@/components/forms/profile/SettingForm.vue';
import AppearanceForm from '@/components/forms/profile/AppearanceForm.vue';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/users/user';
import { Save, UserRoundPen } from '@lucide/vue';

const authStore = useAuthStore();
const userStore = useUserStore();
const currentUser = ref(null);
const profileFormRef = ref(null);
const isSaving = ref(false);
const isEditMode = ref(false);

onMounted(async () => {
  if (authStore.user) {
    currentUser.value = authStore.user;
  }
});

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
      // isSaving is set to false in finally block
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
