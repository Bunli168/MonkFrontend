<template>
    <div class="row g-3">
        <div class="col-12 mt-3 pt-3 border-top">
            <h6 class="fw-bold mb-2 text-danger d-flex align-items-center gap-2">
                <KeyRound :size="18" /> ប្តូរពាក្យសម្ងាត់ (Change Password)
            </h6>
            <p class="text-muted small mb-3">ដើម្បីសុវត្ថិភាពគណនី សូមប្រើពាក្យសម្ងាត់ដែលមានភាពស្មុគស្មាញ និងមិនចែករំលែកទៅអ្នកដទៃ។</p>
        </div>
        <div class="col-md-4">
            <BaseInput
                type="password"
                v-model="cpForm.currentPassword"
                label="ពាក្យសម្ងាត់បច្ចុប្បន្ន (Current)"
                placeholder="Enter current password"
                :error="cpErrors.currentPassword"
            />
        </div>
        <div class="col-md-4">
            <BaseInput
                type="password"
                v-model="cpForm.newPassword"
                label="ពាក្យសម្ងាត់ថ្មី (New)"
                placeholder="Min 8 chars"
                :error="cpErrors.newPassword"
            />
        </div>
        <div class="col-md-4">
            <BaseInput
                type="password"
                v-model="cpForm.confirmPassword"
                label="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី (Confirm)"
                placeholder="Re-enter new password"
                :error="cpErrors.confirmPassword"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { KeyRound } from '@lucide/vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// ═══ Change Password Logic ═══
const cpLoading = ref(false);
const cpForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' });
const cpErrors = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' });

const handleChangePassword = async () => {
    // Reset errors
    cpErrors.currentPassword = '';
    cpErrors.newPassword = '';
    cpErrors.confirmPassword = '';

    let valid = true;
    if (!cpForm.currentPassword) {
        cpErrors.currentPassword = 'សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន';
        valid = false;
    }
    if (!cpForm.newPassword || cpForm.newPassword.length < 8) {
        cpErrors.newPassword = 'ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ តួ';
        valid = false;
    } else if (!/[A-Z]/.test(cpForm.newPassword) || !/[0-9]/.test(cpForm.newPassword) || !/[^a-zA-Z0-9]/.test(cpForm.newPassword)) {
        cpErrors.newPassword = 'ត្រូវមានអក្សរធំ លេខ និងសញ្ញាពិសេស';
        valid = false;
    } else if (cpForm.newPassword === cpForm.currentPassword) {
        cpErrors.newPassword = 'ពាក្យសម្ងាត់ថ្មីត្រូវតែខុសពីបច្ចុប្បន្ន';
        valid = false;
    }
    if (cpForm.newPassword !== cpForm.confirmPassword) {
        cpErrors.confirmPassword = 'ពាក្យសម្ងាត់ថ្មីទាំងពីរមិនដូចគ្នា';
        valid = false;
    }
    if (!valid) return;

    cpLoading.value = true;
    try {
        await authStore.updateMyPassword({
            currentPassword: cpForm.currentPassword,
            newPassword: cpForm.newPassword
        });
        // Clear form on success (user will be redirected to login)
        cpForm.currentPassword = '';
        cpForm.newPassword = '';
        cpForm.confirmPassword = '';
    } finally {
        cpLoading.value = false;
    }
};
</script>

<style scoped>
</style>
