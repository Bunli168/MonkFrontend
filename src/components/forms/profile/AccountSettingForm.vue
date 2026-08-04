<template>
    <div class="d-flex flex-column gap-3">
        <div >
            <h5 class="d-flex align-items-center gap-2 mb-0">
                <ShieldCheck :size="20" class="text-primary" /> Account Security
            </h5>
            <p class="text-muted small mb-0 mt-1">Manage your account security and two-factor authentication.</p>
        </div>
        <div class="main-divider"></div>

        <div>
            <div class="mb-4">
                <h4 class="mb-3 text-dark fw-normal" style="font-size: 1.3rem;">Telegram OTP (Login Codes)</h4>
            
            <div class="d-flex align-items-center justify-content-between flex-nowrap gap-3">
                <div class="d-flex align-items-center gap-3 min-w-0">
                    <div class="telegram-bot-icon flex-shrink-0" :class="authStore.user?.otp_telegram_chat_id ? 'bg-success' : 'bg-primary'">
                        <Bot :size="24" />
                    </div>
                    <div class="d-flex flex-column min-w-0 text-truncate">
                        <span v-if="authStore.user?.otp_telegram_chat_id" class="text-success text-truncate" style="font-size: 0.95rem;">Connected</span>
                        <span v-else class="text-danger text-truncate" style="font-size: 0.95rem; color: #ef4444 !important;">Not connected</span>
                        <span class="text-dark d-none d-sm-block text-truncate" style="font-size: 0.95rem;">Receive secure login codes via Telegram.</span>
                    </div>
                </div>
                
                <div class="telegram-actions">
                    <button v-if="!authStore.user?.otp_telegram_chat_id" type="button" class="btn-outline-action" @click="handleLinkTelegram" :disabled="isLoadingTelegram" title="ភ្ជាប់គណនី (Link Account)">
                        <span v-if="isLoadingTelegram" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <Link2 v-else :size="18" class="text-primary" />
                    </button>
                    <button v-else type="button" class="btn-outline-action" @click="handleUnlinkTelegram" :disabled="isUnlinking" title="ផ្តាច់គណនី (Unlink Account)">
                        <span v-if="isUnlinking" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <Link2Off v-else :size="18" class="text-danger" />
                    </button>
                </div>
            </div>

            <!-- Connected Security Banner (When Connected) -->
            <div v-if="authStore.user?.otp_telegram_chat_id" class="telegram-security-banner mt-3 pt-3">
                <div class="security-banner-content">
                    <ShieldCheck :size="18" class="text-success" />
                    <span><strong>ការការពារកម្រិតខ្ពស់ ៖</strong> រាល់ពេលចូលប្រើប្រព័ន្ធ ប្រព័ន្ធនឹងទាមទារកូដផ្ញើចូល Telegram នេះជានិច្ច។</span>
                </div>
            </div>

        </div>
            <div class="d-flex align-items-center justify-content-between">
                <div>
                    <label class="form-label mb-0 fw-medium d-block">Two-Factor Auth (TOTP)</label>
                    <span class="text-muted small">Add an extra layer of security.</span>
                </div>
                <BaseToggle v-model="isTotpEnabled" @change="handleTotpToggle" />
            </div>

            <!-- TOTP Password Input -->
            <div v-if="isTotpEnabled && !qrCodeUrl && !authStore.user?.isTotpEnabled" class="mt-4 pt-4 border-top">
                <h6 class="mb-3">Verify your password to setup TOTP</h6>
                <div class="mb-3">
                    <BaseInput 
                        id="totpPassword"
                        type="password"
                        v-model="password" 
                        label="Password" 
                        placeholder="Enter your current password"
                    />
                </div>
                <div class="d-flex justify-content-end">
                    <BaseButton @click="setupTotp" :loading="isLoading" :disabled="isLoading || !password">
                        {{ isLoading ? 'Verifying...' : 'Generate QR Code' }}
                    </BaseButton>
                </div>
            </div>

            <!-- TOTP Password Input for Disabling -->
            <div v-if="!isTotpEnabled && authStore.user?.isTotpEnabled" class="mt-4 pt-4 border-top">
                <h6 class="mb-3">Verify your identity to disable TOTP</h6>
                <div class="row g-3 mb-3">
                    <div class="col-md-6">
                        <BaseInput 
                            id="disableTotpPassword"
                            type="password"
                            v-model="password" 
                            label="Password" 
                            placeholder="Enter your current password"
                        />
                    </div>
                    <div class="col-md-6">
                        <BaseInput 
                            id="disableTotpCode"
                            type="text"
                            v-model="verificationCode" 
                            label="Authenticator Code" 
                            placeholder="Enter 6-digit code"
                            maxlength="6"
                        />
                    </div>
                </div>
                <div class="d-flex justify-content-end">
                    <BaseButton @click="submitDisableTotp" :loading="isDisabling" :disabled="isDisabling || !password || verificationCode.length < 6">
                        {{ isDisabling ? 'Disabling...' : 'Disable TOTP' }}
                    </BaseButton>
                </div>
            </div>

            <!-- TOTP QR Code -->
            <div v-if="qrCodeUrl" class="mt-4 pt-4 border-top text-center">
                <h6 class="mb-3">Scan this QR Code with your Authenticator App</h6>
                <div class="p-3 d-inline-block rounded mb-3" style="background-color: var(--surface-ground); border: var(--border-width) solid var(--border-color); border-radius: var(--border-inner-radius);">
                    <img :src="qrCodeUrl" alt="TOTP QR Code" class="img-fluid" style="max-width: 200px;" />
                </div>
                <div>
                    <p class="text-muted small mb-1">Or enter this code manually:</p>
                    <code class="fs-6 fw-bold user-select-all px-3 py-2 d-inline-block mb-4" style="background-color: var(--surface-ground); border: var(--border-width) solid var(--border-color); border-radius: var(--border-inner-radius);">{{ secretKey }}</code>
                </div>

                <div class="text-start mt-2">
                    <label class="form-label mb-1 fw-medium">Verification Code</label>
                    <div class="d-flex gap-2">
                        <BaseInput 
                            id="totpCode"
                            type="text"
                            v-model="verificationCode" 
                            placeholder="Enter 6-digit code"
                            class="flex-grow-1"
                            maxlength="6"
                        />
                        <BaseButton @click="verifySetup" :loading="isVerifying" :disabled="isVerifying || verificationCode.length < 6">
                            {{ isVerifying ? 'Verifying...' : 'Verify Setup' }}
                        </BaseButton>
                    </div>
                </div>
            </div>

            <div class="d-flex align-items-center justify-content-between mt-4 pt-4 border-top">
                <div class="d-flex align-items-center gap-3">
                    <div class="setting-icon-wrapper" style="width: 40px; height: 40px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background-color: rgba(16, 185, 129, 0.1); border-radius: 10px;">
                        <Download :size="20" style="color: #10B981;" />
                    </div>
                    <div>
                        <label class="form-label mb-0 fw-medium d-block">Install App <span class="d-none d-md-inline">(PWA)</span></label>
                        <span class="text-muted small d-none d-md-block">ដំឡើងកម្មវិធីចូលក្នុងឧបករណ៍របស់អ្នក ដើម្បីងាយស្រួលប្រើប្រាស់។</span>
                    </div>
                </div>
                <div>
                    <BaseButton @click="triggerInstall" variant="primary" class="d-flex align-items-center gap-2">
                        <Download :size="16" /> ដំឡើង <span class="d-none d-md-inline">(Install)</span>
                    </BaseButton>
                </div>
            </div>

        </div>

        <!-- PWA Install Modal -->
        <BaseModal v-model="showInstallModal" title="How to Install App" size="sm">
            <div class="text-center py-3">
                <div class="mb-3">
                    <Download :size="48" class="text-primary mb-2" />
                    <h6>កម្មវិធីនេះត្រូវបានដំឡើងរួចហើយ! <br><span class="text-muted fw-normal">(App is already installed or requires manual install)</span></h6>
                </div>
                
                <p class="text-muted small text-start">
                    <strong>On Computer (Chrome/Brave/Edge):</strong><br>
                    Look at the right side of your URL address bar. If you see an "Open" or "Install" icon, click it to launch or install the app.
                </p>
                
                <p class="text-muted small text-start mb-0">
                    <strong>On iPhone/iPad (Safari):</strong><br>
                    Tap the Share button <span class="border rounded px-1"><i class="pi pi-share-apple"></i></span> at the bottom of the screen, then select "Add to Home Screen".
                </p>
            </div>
            <template #footer>
                <div class="w-100 d-flex justify-content-end">
                    <BaseButton @click="showInstallModal = false" variant="outline-primary">Close</BaseButton>
                </div>
            </template>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { ShieldCheck, Bot, Trash2, Link2, Link2Off, Download } from '@lucide/vue';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/users/user';
import { useToastStore } from '@/stores/toast';
import BaseModal from '@/components/base/BaseModal.vue';

const authStore = useAuthStore();
const userStore = useUserStore();
const toastStore = useToastStore();
const telegramUsername = import.meta.env.VITE_TELEGRAM_OTP_SUPPORT_USERNAME || 'optsecuritybot';
const isUnlinking = ref(false);
const isLoadingTelegram = ref(false);
const showInstallModal = ref(false);

const handleLinkTelegram = async () => {
    isLoadingTelegram.value = true;

    // Open a blank window synchronously to bypass popup blockers
    const telegramWindow = window.open('about:blank', '_blank');

    const data = await userStore.requestOtpTelegramLink();
    if (data?.telegramLink) {
        if (telegramWindow) {
            telegramWindow.location.href = data.telegramLink;
        } else {
            // Fallback if blocked
            window.location.href = data.telegramLink;
        }
        
        isLoadingTelegram.value = false;
        toastStore.showToast('A new tab opened. Please finish the setup in Telegram!', 'info');

        let pollCount = 0;
        const maxPolls = 100; // 5 minutes (100 * 3s)

        const pollInterval = setInterval(async () => {
            pollCount++;
            if (pollCount > maxPolls) {
                clearInterval(pollInterval);
                return;
            }

            await authStore.getProfile();
            if (authStore.user?.otp_telegram_chat_id) {
                clearInterval(pollInterval);
                toastStore.showToast('Successfully linked Telegram account!', 'success');
            }
        }, 3000);
    } else {
        if (telegramWindow) telegramWindow.close();
        isLoadingTelegram.value = false;
        toastStore.showToast('Failed to generate Telegram link', 'error');
    }
};

const handleUnlinkTelegram = async () => {
    isUnlinking.value = true;
    try {
        await authStore.unlinkOtpTelegram();
    } finally {
        isUnlinking.value = false;
    }
};



const isTotpEnabled = ref(false);
const isLoading = ref(false);
const isVerifying = ref(false);
const isDisabling = ref(false);
const password = ref('');
const qrCodeUrl = ref('');
const secretKey = ref('');
const verificationCode = ref('');

// ═══ PWA Installation Logic ═══
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
        showInstallModal.value = true;
    }
};

onMounted(() => {
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    isTotpEnabled.value = !!authStore.user?.isTotpEnabled;
});

onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
});

watch(() => authStore.user?.isTotpEnabled, (newVal) => {
    isTotpEnabled.value = !!newVal;
});

const handleTotpToggle = () => {
    if (!isTotpEnabled.value) {
        password.value = '';
        qrCodeUrl.value = '';
        secretKey.value = '';
        verificationCode.value = '';
    }
};

const setupTotp = async () => {
    if (!password.value) return;
    
    isLoading.value = true;
    try {
        const response = await authStore.enableTotp({ password: password.value });
        if (response && response.success) {
            qrCodeUrl.value = response.qrCodeUrl;
            secretKey.value = response.secret;
            password.value = ''; // clear password after success
        } else {
            // Uncheck the toggle if verification failed
            isTotpEnabled.value = false;
        }
    } finally {
        isLoading.value = false;
    }
};

const verifySetup = async () => {
    if (!verificationCode.value) return;
    
    isVerifying.value = true;
    try {
        const result = await authStore.verifyTotpSetup({ 
            token: verificationCode.value,
            secret: secretKey.value
        });
        if (result) {
            qrCodeUrl.value = '';
            secretKey.value = '';
            verificationCode.value = '';
            if (authStore.getProfile) {
                await authStore.getProfile();
            }
        }
    } finally {
        isVerifying.value = false;
    }
};

const submitDisableTotp = async () => {
    if (!password.value || !verificationCode.value) return;
    
    isDisabling.value = true;
    try {
        const success = await authStore.disableTotp({ 
            token: verificationCode.value
        });
        if (success) {
            password.value = '';
            verificationCode.value = '';
            // Fetch profile to sync authStore.user state
            if (authStore.getProfile) {
                await authStore.getProfile();
            }
        } else {
            // Revert toggle if verification failed
            isTotpEnabled.value = true;
        }
    } finally {
        isDisabling.value = false;
    }
};
</script>

<style scoped>



.telegram-bot-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
}

.btn-outline-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 16px;
    border-radius: 4px;
    border: 1px solid var(--border-color, #e2e8f0);
    background: transparent;
    color: var(--text-color, #1e293b);
    transition: all 0.2s ease;
    text-decoration: none;
    cursor: pointer;
}

.btn-outline-action:hover {
    background: rgba(0,0,0,0.03);
    color: var(--text-color, #1e293b);
}
/* Security Banner */
.telegram-security-banner {
    border-top: 1px solid rgba(16, 185, 129, 0.15);
}

.security-banner-content {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: rgba(16, 185, 129, 0.08);
    border-radius: 8px;
    font-size: 0.82rem;
    color: #065f46;
}
</style>
