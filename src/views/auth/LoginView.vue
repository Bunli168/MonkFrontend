<style scoped>
.login-wrapper {
    height: 100vh;
}

.login-wrapper .login-container {
    width: 100%;
    height: 100%;
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.login-wrapper .login-container .login-placeholder {
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

.login-wrapper .login-container .login-form {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.login-form-inner {
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
    <div class="login-wrapper p-3">
        <div class="login-container">
            
            <div class="login-placeholder d-lg-flex d-none">
                <!-- Soft Ambient glow blob -->
                <div class="ambient-glow"></div>

                <div class="hero-badge animate-slide-up">
                    <span class="status-dot"></span>
                    Monk Management System Platform
                </div>

                <div class="hero-body">
                    <h2 class="hero-title animate-slide-up delay-1">
                        Empowering School Communities<br>
                        <span>Digitally &amp; Efficiently</span>
                    </h2>
                    <p class="hero-desc animate-slide-up delay-1">
                        Access real-time dashboards, manage user registration, complete validation forms, and track survey results seamlessly.
                    </p>

                    <div class="hero-features">
                        <div class="feature-item animate-slide-up delay-2">
                            <div class="feature-icon-wrapper">
                                <BarChart3 :size="20" stroke-width="1.75" />
                            </div>
                            <div class="feature-info">
                                <h4>Real-Time Analytics</h4>
                                <p>Monitor surveys and view detailed response details instantly.</p>
                            </div>
                        </div>
                        <div class="feature-item animate-slide-up delay-3">
                            <div class="feature-icon-wrapper">
                                <ShieldCheck :size="20" stroke-width="1.75" />
                            </div>
                            <div class="feature-info">
                                <h4>Highly Secure Authentication</h4>
                                <p>Multi-factor OTP security and structured permission levels.</p>
                            </div>
                        </div>
                        <div class="feature-item animate-slide-up delay-4">
                            <div class="feature-icon-wrapper">
                                <ClipboardCheck :size="20" stroke-width="1.75" />
                            </div>
                            <div class="feature-info">
                                <h4>Smart Form Validation</h4>
                                <p>Dynamic, inline validation to prevent empty data submission.</p>
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

            <div class="login-form p-lg-5 p-2 p-lg-4 animate-slide-up delay-1">
                <div class="login-form-inner">
                    <router-link :to="{ name: 'Home' }" class="text-decoration-none d-flex align-items-center gap-2 mb-4 text-muted back-btn" style="width: max-content;">
                        <ArrowLeft :size="15" />
                        <span>Back to Home</span>
                    </router-link>
                    <Logo class="brand-icon" />
                    <h1 class="h3 mb-4 font-weight-bold">Sign in to your account</h1>
                    <div>
                        <LoginForm ref="loginFormRef" class="mb-3" @submit="handleValidSubmit" />
                    </div>
                    <div class="text-end mb-3">
                        <router-link :to="{ name: 'forgot-password' }" class="text-decoration-none small" style="color: var(--primary-color);">
                            Forgot Password?
                        </router-link>
                    </div>
                    <BaseButton :isLoading="isLoading" type="submit" form="login-form"
                        class="w-100 justify-content-center mt-2">
                        {{ isLoading ? 'Logging in...' : 'Login to Portal' }}
                    </BaseButton>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import LoginForm from '@/components/forms/LoginForm.vue';
import Logo from '@/components/Logo.vue';
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { BarChart3, ShieldCheck, ClipboardCheck, ArrowLeft } from '@lucide/vue';

const loginFormRef = ref(null)
const isLoading = ref(false)
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const handleValidSubmit = async (values) => {
    const payload = {
        email: values.email.trim(),
        password: values.password.trim()
    }

    isLoading.value = true;

    try {
        const result = await authStore.login(payload);

        if (!result) {
            loginFormRef.value.setFieldValue('password', '');
            return;
        }

        if (result.requireOtp) {
            router.push({ name: 'otp' })
        } else if (result.requirePasswordChange) {
            router.push({ name: 'change-password' })
        } else {
            if (route.query.redirect) {
                router.push(route.query.redirect);
            } else if (authStore.isAdmin) {
                router.push({ name: 'dashboard' });
            } else {
                router.push({ name: 'pagoda-overview' });
            }
        }
    } finally {
        isLoading.value = false;
    }
}
</script>