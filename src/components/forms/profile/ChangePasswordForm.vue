<template>
    <div class="d-flex flex-column gap-3">
        <div>
            <h5 class="d-flex align-items-center gap-2 mb-0">
                <KeyRound :size="20" class="text-danger" /> ប្តូរពាក្យសម្ងាត់ (Change Password)
            </h5>
            <p class="text-muted small mb-0 mt-1">ដើម្បីសុវត្ថិភាពគណនី សូមប្រើពាក្យសម្ងាត់ដែលមានភាពស្មុគស្មាញ និងមិនចែករំលែកទៅអ្នកដទៃ។</p>
        </div>
        <div class="main-divider"></div>

        <!-- ═══ Change Password Card ═══ -->
        <div class="change-pwd-card mb-2">
            <div class="change-pwd-header d-flex align-items-center gap-3 mb-3">
                <div class="change-pwd-icon-wrap">
                    <ShieldAlert :size="20" />
                </div>
                <div>
                    <h6 class="mb-1 fw-semibold">លក្ខខណ្ឌពាក្យសម្ងាត់ (Password Requirements)</h6>
                    <p class="mb-0 text-muted small">ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ តួ អក្សរធំ លេខ និងសញ្ញាពិសេស។</p>
                </div>
            </div>
            <div class="change-pwd-body">
                <div class="mb-3">
                    <label class="form-label small fw-medium mb-1">ពាក្យសម្ងាត់បច្ចុប្បន្ន (Current Password)</label>
                    <BaseInput
                        type="password"
                        v-model="cpForm.currentPassword"
                        placeholder="Enter your current password"
                        :error="cpErrors.currentPassword"
                    />
                </div>
                <div class="mb-3">
                    <label class="form-label small fw-medium mb-1">ពាក្យសម្ងាត់ថ្មី (New Password)</label>
                    <BaseInput
                        type="password"
                        v-model="cpForm.newPassword"
                        placeholder="Min 8 chars, uppercase, number, special char"
                        :error="cpErrors.newPassword"
                    />
                </div>
                <div class="mb-4">
                    <label class="form-label small fw-medium mb-1">បញ្ជាក់ពាក្យសម្ងាត់ថ្មី (Confirm New Password)</label>
                    <BaseInput
                        type="password"
                        v-model="cpForm.confirmPassword"
                        placeholder="Re-enter new password"
                        :error="cpErrors.confirmPassword"
                    />
                </div>
                <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 pt-2 border-top">
                    <span class="text-muted small d-flex align-items-center gap-1">
                        ⚠️ <span class="text-danger fw-medium">ចំណាំ៖</span> Session លើឧបករណ៍ផ្សេងទៀតនឹងត្រូវបញ្ចប់ (Logout) ដោយស្វ័យប្រវត្តិ។
                    </span>
                    <BaseButton
                        @click="handleChangePassword"
                        :loading="cpLoading"
                        :disabled="cpLoading || !cpForm.currentPassword || !cpForm.newPassword || !cpForm.confirmPassword"
                        variant="danger"
                        class="d-flex align-items-center gap-2 px-4 py-2"
                    >
                        <KeyRound :size="16" />
                        {{ cpLoading ? 'កំពុងប្ដូរ...' : 'ប្ដូរពាក្យសម្ងាត់' }}
                    </BaseButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { KeyRound, ShieldAlert } from '@lucide/vue';
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
/* ═══ Change Password Card ═══ */
.change-pwd-card {
    border-radius: 14px;
    border: 1px solid rgba(239, 68, 68, 0.18);
    background: var(--body-bg-color, #fff);
    box-shadow: 0 8px 24px -8px rgba(239, 68, 68, 0.1), 0 2px 8px rgba(0,0,0,0.03);
    overflow: hidden;
    transition: box-shadow 0.3s ease, border-color 0.3s ease;
}
.change-pwd-card:hover {
    box-shadow: 0 12px 32px -8px rgba(239, 68, 68, 0.18), 0 4px 12px rgba(0,0,0,0.05);
    border-color: rgba(239, 68, 68, 0.32);
}
.change-pwd-header {
    padding: 16px 20px 0 20px;
}
.change-pwd-body {
    padding: 12px 20px 20px 20px;
}
.change-pwd-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.06));
    border: 1px solid rgba(239, 68, 68, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ef4444;
    flex-shrink: 0;
}
</style>
