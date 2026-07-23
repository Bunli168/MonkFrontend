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
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { ShieldCheck } from '@lucide/vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const isTotpEnabled = ref(false);
const isLoading = ref(false);
const isVerifying = ref(false);
const isDisabling = ref(false);
const password = ref('');
const qrCodeUrl = ref('');
const secretKey = ref('');
const verificationCode = ref('');

onMounted(() => {
    isTotpEnabled.value = !!authStore.user?.isTotpEnabled;
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
