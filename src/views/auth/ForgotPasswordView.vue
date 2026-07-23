<style scoped>
.forgot-password-wrapper {
    height: 100vh;
}

.forgot-password-wrapper .forgot-password-container {
    width: 100%;
    height: 100%;
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.forgot-password-wrapper .forgot-password-container .forgot-password-placeholder {
    flex: 1.2;
    background: linear-gradient(135deg, color-mix(in srgb, var(--primary-color) 15%, transparent) 50%, transparent 100%);
    height: 100%;
    border-radius: var(--border-radius);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 4rem;
}

/* Minimalist Eyebrow Badge */
.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--primary-color-soft);
    border: 1px solid rgba(0, 109, 128, 0.12);
    padding: 6px 14px;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--primary-color);
    align-self: flex-start;
}

.status-dot {
    width: 6px;
    height: 6px;
    background-color: var(--primary-color);
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 109, 128, 0.4); }
    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(0, 109, 128, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 109, 128, 0); }
}

/* Hero Center Content */
.hero-body {
    margin-top: auto;
    margin-bottom: auto;
}

.hero-title {
    font-size: 2.25rem;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 1rem;
    color: var(--text-heading-color);
    font-family: 'Poppins', sans-serif;
}

.hero-title span {
    color: var(--primary-color);
}

.hero-desc {
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--text-base);
    margin-bottom: 2.25rem;
    max-width: 480px;
}

/* Minimalist Feature Items */
.hero-features {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 480px;
}

.feature-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
}

.feature-icon-wrapper {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--primary-color-soft);
    color: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
}

.feature-info h4 {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: var(--text-heading-color);
}

.feature-info p {
    font-size: 0.85rem;
    margin: 0;
    color: var(--text-base);
    line-height: 1.45;
    opacity: 0.85;
}

.hero-footer {
    display: flex;
    gap: 40px;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-clr);
    margin-top: auto;
}

.stat-box {
    display: flex;
    flex-direction: column;
}

.stat-num {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-heading-color);
    line-height: 1;
}

.stat-lbl {
    font-size: 0.75rem;
    color: var(--sidebar-text-muted);
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.forgot-password-wrapper .forgot-password-container .forgot-password-form {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.forgot-password-form-inner {
    width: 100%;
    max-width: 400px;
}

.brand-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 1.5rem;
}

/* Ambient Background Glow */
.ambient-glow {
    position: absolute;
    top: -20%;
    left: -20%;
    width: 70%;
    height: 70%;
    background: radial-gradient(circle, color-mix(in srgb, var(--primary-color) 25%, transparent) 0%, transparent 70%);
    filter: blur(80px);
    pointer-events: none;
    z-index: 0;
    animation: floatGlow 12s ease-in-out infinite alternate;
}

@keyframes floatGlow {
    0% {
        transform: translate(0, 0) scale(1);
    }
    100% {
        transform: translate(8%, 8%) scale(1.15);
    }
}

/* Ensure contents are relative to sit above absolute ambient glow */
.hero-badge,
.hero-body,
.hero-footer {
    position: relative;
    z-index: 1;
}

/* Entrance Animations */
.animate-slide-up {
    opacity: 0;
    animation: slideUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.delay-1 {
    animation-delay: 100ms;
}
.delay-2 {
    animation-delay: 200ms;
}
.delay-3 {
    animation-delay: 300ms;
}
.delay-4 {
    animation-delay: 400ms;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(16px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.back-btn {
    transition: all 0.2s ease;
}
.back-btn:hover {
    color: var(--primary-color) !important;
    transform: translateX(-4px);
}
</style>

<template>
    <div class="forgot-password-wrapper p-3">
        <div class="forgot-password-container">
            <div class="forgot-password-placeholder d-lg-flex d-none">
                <!-- Soft Ambient glow blob -->
                <div class="ambient-glow"></div>

                <div class="hero-badge animate-slide-up">
                    <span class="status-dot"></span>
                    Account Recovery
                </div>

                <div class="hero-body">
                    <h2 class="hero-title animate-slide-up delay-1">
                        Regain Access<br>
                        <span>Quickly &amp; Securely</span>
                    </h2>
                    <p class="hero-desc animate-slide-up delay-1">
                        Follow the simple steps to reset your password and get back to managing your educational activities.
                    </p>

                    <div class="hero-features">
                        <div class="feature-item animate-slide-up delay-2">
                            <div class="feature-icon-wrapper">
                                <Mailbox :size="20" stroke-width="1.75" />
                            </div>
                            <div class="feature-info">
                                <h4>Secure Link</h4>
                                <p>A time-sensitive, encrypted reset link will be sent to your inbox.</p>
                            </div>
                        </div>
                        <div class="feature-item animate-slide-up delay-3">
                            <div class="feature-icon-wrapper">
                                <LifeBuoy :size="20" stroke-width="1.75" />
                            </div>
                            <div class="feature-info">
                                <h4>24/7 Support</h4>
                                <p>Our support team is always available if you encounter issues.</p>
                            </div>
                        </div>
                        <div class="feature-item animate-slide-up delay-4">
                            <div class="feature-icon-wrapper">
                                <KeyRound :size="20" stroke-width="1.75" />
                            </div>
                            <div class="feature-info">
                                <h4>Fast Recovery</h4>
                                <p>Get back to managing your educational activities in minutes.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="hero-footer animate-slide-up delay-4">
                    <div class="stat-box">
                        <span class="stat-num">100+</span>
                        <span class="stat-lbl">School Tnaks</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-num">99.9%</span>
                        <span class="stat-lbl">Platform Uptime</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-num">Secured</span>
                        <span class="stat-lbl">SSL Encrypted</span>
                    </div>
                </div>
            </div>
            
            <div class="forgot-password-form p-5 p-lg-4 animate-slide-up delay-1">
                <div class="forgot-password-form-inner">
                    <!-- Telegram Support Redirection State -->
                    <div v-if="showTelegramContact" class="text-center">
                        <Logo class="brand-icon mx-auto" />
                        <h2 class="h4 mb-3 font-weight-bold text-heading-color">Access Restricted</h2>
                        <p class="text-muted mb-4" style="line-height: 1.6; font-size: 0.95rem;">
                            Please contact system support on Telegram to reset your password.
                        </p>
                        <BaseButton @click="openTelegramLink" class="w-100 mb-3 d-flex align-items-center justify-content-center gap-2" variant="primary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                            Contact Support via Telegram
                        </BaseButton>
                        <BaseButton @click="showTelegramContact = false" class="w-100" variant="outline-secondary">
                            Try Another Email
                        </BaseButton>
                    </div>

                    <!-- Input Form State -->
                    <div v-else>
                        <Logo class="brand-icon" />
                        <h1 class="h4 mb-3 font-weight-bold">Forgot Password</h1>
                        <p class="text-muted mb-4">Enter your email address to receive a secure password reset link.</p>
                        
                        <form @submit.prevent="onSubmit" novalidate class="mb-3">
                            <div class="mb-3">
                                <BaseInput required type="email" label="Email Address" v-model="email" :error="errors.email" placeholder="admin@example.com" />
                            </div>
                            <BaseButton :isLoading="isLoading" type="submit" class="w-100 justify-content-center">
                                {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
                            </BaseButton>
                        </form>

                        <div class="text-center mt-3">
                            <router-link :to="{ name: 'login' }" class="text-decoration-none small" style="color: var(--primary-color);">
                                Back to Login
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Mailbox, LifeBuoy, KeyRound } from '@lucide/vue';
import Logo from '@/components/Logo.vue';
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import { useForm, useField } from 'vee-validate';

import { authSchemas } from '@/utils/validations';

const isLoading = ref(false);
const showTelegramContact = ref(false);
const authStore = useAuthStore();
const telegramUsername = import.meta.env.VITE_TELEGRAM_SUPPORT_USERNAME || 'chm_kiwi';
const openTelegramLink = () => window.open('https://t.me/' + telegramUsername, '_blank');

const { handleSubmit, errors } = useForm({
    validationSchema: authSchemas.forgotPassword,
    initialValues: {
        email: ''
    }
});

const { value: email } = useField('email');

const onSubmit = handleSubmit(async (values) => {
    isLoading.value = true;
    const res = await authStore.forgotPassword({ email: values.email.trim() });
    isLoading.value = false;
    
    if (res.isUserForbidden) {
        showTelegramContact.value = true;
    }
});
</script>
