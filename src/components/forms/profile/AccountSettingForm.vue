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
            <!-- Compact Telegram Bot 2FA Row (OTP) -->
            <div class="d-flex align-items-center justify-content-between mb-4 pb-4 border-bottom">
                <div class="d-flex align-items-center gap-3">
                    <div class="setting-icon-wrapper" style="width: 40px; height: 40px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background-color: rgba(var(--primary-color-rgb), 0.1); border-radius: 10px;">
                        <Send :size="20" style="color: var(--primary-color);" />
                    </div>
                    <div>
                        <label class="form-label mb-0 fw-medium d-block">Telegram OTP</label>
                        <span class="text-muted small">
                            <span v-if="authStore.user?.otp_telegram_chat_id" class="text-success"><ShieldCheck :size="12" class="me-1"/>បានភ្ជាប់រួចរាល់</span>
                        </span>
                    </div>
                </div>
                
                <div>
                    <button v-if="!authStore.user?.otp_telegram_chat_id" type="button" @click="handleLinkOtpTelegram" class="btn btn-sm d-flex align-items-center justify-content-center px-3" style="background-color: var(--primary-color); color: white;" :disabled="isLinkingOtp" title="ភ្ជាប់គណនី (Link Account)">
                        <span v-if="isLinkingOtp" class="spinner-border spinner-border-sm"></span>
                        <Link2 v-else :size="16" />
                    </button>
                    <button v-else type="button" class="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center px-3" @click="handleUnlinkOtpTelegram" :disabled="isUnlinkingOtp">
                        <Trash2 v-if="!isUnlinkingOtp" :size="16" />
                        <span v-else class="spinner-border spinner-border-sm"></span>
                    </button>
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
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { ShieldCheck, Send, Trash2, Download, Link2 } from '@lucide/vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const telegramUsername = import.meta.env.VITE_TELEGRAM_SUPPORT_USERNAME || 'Monk_permission_bot';
const otpTelegramUsername = import.meta.env.VITE_TELEGRAM_OTP_SUPPORT_USERNAME || 'optsecuritybot';
const isUnlinking = ref(false);
const isUnlinkingOtp = ref(false);

const handleUnlinkTelegram = async () => {
    isUnlinking.value = true;
    try {
        await authStore.unlinkTelegram();
    } finally {
        isUnlinking.value = false;
    }
};

const isLinkingOtp = ref(false);
const handleLinkOtpTelegram = async () => {
    isLinkingOtp.value = true;
    try {
        const token = await authStore.generateTelegramLinkToken();
        if (token) {
            window.open(`https://t.me/${otpTelegramUsername}?start=${token}`, '_blank');
        } else {
            alert('បរាជ័យក្នុងការបង្កើតតំណភ្ជាប់ សូមព្យាយាមម្តងទៀត។');
        }
    } finally {
        isLinkingOtp.value = false;
    }
};

const handleUnlinkOtpTelegram = async () => {
    isUnlinkingOtp.value = true;
    try {
        await authStore.unlinkOtpTelegram();
    } finally {
        isUnlinkingOtp.value = false;
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
        alert('សូមអនុវត្តតាមការណែនាំខាងក្រោម ដើម្បីដំឡើងកម្មវិធីចូលក្នុងឧបករណ៍របស់អ្នក!');
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
/* Ultra-Premium Telegram Security Card */
.telegram-security-card {
    position: relative;
    border-radius: 16px;
    background: var(--body-bg-color, #ffffff);
    border: 1px solid rgba(36, 161, 222, 0.2);
    box-shadow: 0 10px 30px -10px rgba(36, 161, 222, 0.12), 0 4px 12px rgba(0, 0, 0, 0.03);
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.telegram-security-card:hover {
    box-shadow: 0 16px 40px -12px rgba(36, 161, 222, 0.2), 0 6px 16px rgba(0, 0, 0, 0.04);
    border-color: rgba(36, 161, 222, 0.35);
    transform: translateY(-2px);
}

.telegram-card-glow {
    position: absolute;
    top: -50px;
    right: -50px;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(36, 161, 222, 0.18) 0%, rgba(36, 161, 222, 0) 70%);
    pointer-events: none;
    z-index: 1;
}

.telegram-card-body {
    position: relative;
    z-index: 2;
    padding: 1.5rem;
}

.telegram-icon-wrapper {
    position: relative;
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, #2AABEE 0%, #229ED9 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    box-shadow: 0 8px 18px rgba(34, 158, 217, 0.35);
    flex-shrink: 0;
}

.telegram-icon-svg {
    transform: translateX(-1px) translateY(1px);
}

.status-indicator {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid var(--body-bg-color, #fff);
}

.status-indicator.active {
    background-color: #10B981;
    box-shadow: 0 0 8px #10B981;
}

.status-indicator.inactive {
    background-color: #F59E0B;
}

.telegram-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-color, #1e293b);
}

.telegram-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.2px;
}

.telegram-badge.connected {
    background-color: rgba(16, 185, 129, 0.12);
    color: #059669;
    border: 1px solid rgba(16, 185, 129, 0.25);
}

.telegram-badge.disconnected {
    background-color: rgba(245, 158, 11, 0.12);
    color: #d97706;
    border: 1px solid rgba(245, 158, 11, 0.25);
}

.pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
}

.pulse-dot.active {
    background-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
    animation: pulse-green 2s infinite;
}

.pulse-dot.warning {
    background-color: #F59E0B;
}

@keyframes pulse-green {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.telegram-desc {
    font-size: 0.85rem;
    color: var(--text-muted, #64748b);
    max-width: 420px;
    line-height: 1.5;
}

/* Actions Button */
.btn-link-telegram {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #2AABEE 0%, #229ED9 100%);
    color: #ffffff !important;
    font-weight: 600;
    font-size: 0.88rem;
    border-radius: 10px;
    text-decoration: none;
    box-shadow: 0 6px 16px rgba(34, 158, 217, 0.35);
    overflow: hidden;
    transition: all 0.25s ease;
    border: none;
    white-space: nowrap;
}

.btn-link-telegram:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 22px rgba(34, 158, 217, 0.45);
    color: #ffffff;
}

.btn-glow {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
    transition: left 0.6s ease;
}

.btn-link-telegram:hover .btn-glow {
    left: 100%;
}

.btn-unlink-telegram {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: transparent;
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 10px;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-unlink-telegram:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.08);
    border-color: #ef4444;
    transform: translateY(-1px);
}

/* Steps section */
.telegram-steps-container {
    border-top: 1px dashed rgba(36, 161, 222, 0.25);
}

.steps-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #0284c7;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.step-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    border-radius: 12px;
    background: rgba(36, 161, 222, 0.04);
    border: 1px solid rgba(36, 161, 222, 0.12);
    height: 100%;
    transition: background 0.2s;
}

.step-card:hover {
    background: rgba(36, 161, 222, 0.08);
}

.step-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background: #0088cc;
    color: #ffffff;
    font-size: 0.72rem;
    font-weight: 800;
    flex-shrink: 0;
}

.step-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.step-text strong {
    font-size: 0.82rem;
    color: var(--text-color, #1e293b);
}

.step-text span {
    font-size: 0.75rem;
    color: var(--text-muted, #64748b);
    line-height: 1.4;
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
