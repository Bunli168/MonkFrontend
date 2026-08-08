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

/* Segmented Control using CSS Variables for theming */
.custom-segmented-control {
    background-color: var(--bg-secondary);
    border-radius: 12px;
    border: 1px solid var(--border-clr);
    position: relative;
    padding: 6px;
}
.segmented-btn {
    border: none;
    background: transparent;
    color: var(--sidebar-text-muted);
    font-size: 0.9rem;
    font-weight: 600;
    border-radius: 8px;
    transition: all 0.25s ease;
    cursor: pointer;
    box-shadow: none;
}
.segmented-btn:hover:not(.active) {
    color: var(--text-heading-color);
    background: color-mix(in srgb, var(--text-base) 5%, transparent);
}
.segmented-btn.active {
    background: var(--bg-primary);
    color: var(--primary-color);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.icon-circle-teal {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--primary-color-soft);
    color: var(--primary-color);
    flex-shrink: 0;
}

.note-box {
    background: var(--bg-secondary);
    border-radius: 10px;
    border: 1px dashed var(--border-clr);
}

.success-icon-wrapper {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: color-mix(in srgb, #10b981 15%, transparent);
    color: #10b981;
    box-shadow: 0 8px 16px rgba(16, 185, 129, 0.15);
}

.btn-primary-custom {
    background: var(--primary-color);
    border: none;
    color: white;
    transition: all 0.2s;
}
.btn-primary-custom:hover {
    filter: brightness(0.9);
    box-shadow: 0 4px 12px rgba(0, 109, 128, 0.2);
    color: white;
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
                    Account Recovery Guide
                </div>

                <div class="hero-body">
                    <h2 class="hero-title animate-slide-up delay-1">
                        កន្លែងកំណត់<br>
                        <span>លេខសម្ងាត់ថ្មី (Reset)</span>
                    </h2>
                    <p class="hero-desc animate-slide-up delay-1">
                        អនុវត្តតាមសេចក្តីណែនាំដើម្បីទទួលបានលេខសម្ងាត់ថ្មី និងចូលប្រើប្រាស់ប្រព័ន្ធគ្រប់គ្រងវត្តឡើងវិញ។
                    </p>

                    <div class="hero-features">
                        <div class="feature-item animate-slide-up delay-2">
                            <div class="feature-icon-wrapper">
                                <UserCheck :size="20" stroke-width="1.75" />
                            </div>
                            <div class="feature-info">
                                <h4>ទំនាក់ទំនងមេកុដិ / Admin</h4>
                                <p>ទាក់ទងមេកុដិរបស់អ្នកដើម្បីស្នើសុំ ពាក្យសម្ងាត់ដើមមកវិញ</p>
                            </div>
                        </div>
                        <div class="feature-item animate-slide-up delay-3">
                            <div class="feature-icon-wrapper">
                                <KeyRound :size="20" stroke-width="1.75" />
                            </div>
                            <div class="feature-info">
                                <h4>កំណត់លេខសម្ងាត់រហ័ស</h4>
                                <p>Admin អាចបង្កើតលេខសម្ងាត់ថ្មីជូនលោកអ្នកភ្លាមៗក្នុងប្រព័ន្ធ។</p>
                            </div>
                        </div>
                        <div class="feature-item animate-slide-up delay-4">
                            <div class="feature-icon-wrapper">
                                <MessageCircle :size="20" stroke-width="1.75" />
                            </div>
                            <div class="feature-info">
                                <h4>ជំនួយការ Telegram Support</h4>
                                <p>អាចទាក់ទងមកកាន់ក្រុមការងារបច្ចេកទេសតាម Telegram ប្រសិនបើមានបញ្ហា។</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="hero-footer animate-slide-up delay-4">
                    <div class="stat-box">
                        <span class="stat-num">100+</span>
                        <span class="stat-lbl">Neakavanorn Management</span>
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
                <div class="forgot-password-form-inner text-center">
                    <div class="d-flex justify-content-start w-100">
                        <router-link :to="{ name: 'login' }" class="text-decoration-none d-flex align-items-center gap-2 mb-4 text-muted back-btn" style="width: max-content;">
                            <ArrowLeft :size="16" />
                            <span>Back to Login</span>
                        </router-link>
                    </div>

                    <Logo class="brand-icon mx-auto mb-3" />
                    
                    <h1 class="h3 mb-4 font-weight-bold" style="color: var(--text-heading-color); font-family: 'Poppins', 'Kantumruy Pro', sans-serif;">
                        កំណត់លេខសម្ងាត់ឡើងវិញ
                    </h1>

                    <!-- Custom Segmented Control -->
                    <div class="custom-segmented-control mb-4 d-flex">
                        <button type="button" 
                            @click="activeTab = 'monk'; showTelegramContact = false; isSuccess = false;" 
                            :class="['segmented-btn flex-fill d-flex align-items-center justify-content-center gap-2 py-2', activeTab === 'monk' ? 'active' : '']">
                            <span>🙏 ព្រះសង្ឃ / និស្សិត</span>
                        </button>
                        <button type="button" 
                            @click="activeTab = 'email'; showTelegramContact = false; isSuccess = false;" 
                            :class="['segmented-btn flex-fill d-flex align-items-center justify-content-center gap-2 py-2', activeTab === 'email' ? 'active' : '']">
                            <span>📧 អ៊ីមែលផ្ទាល់ខ្លួន</span>
                        </button>
                    </div>
                    
                    <!-- TAB 1: Monk & Student Instruction -->
                    <div v-if="activeTab === 'monk'" class="animate-slide-up">
                        <div class="text-start mb-2">
                            <div class="d-flex align-items-center gap-3 mb-3">
                                <div class="icon-circle-teal d-flex align-items-center justify-content-center">
                                    <UserCheck :size="22" />
                                </div>
                                <div>
                                    <h3 class="m-0 font-weight-bold" style="font-size: 1.05rem; color: var(--text-heading-color);">ទាក់ទងមេកុដិ ឬ Admin</h3>
                                    <span class="text-muted" style="font-size: 0.82rem;">សម្រាប់គណនីក្នុងប្រព័ន្ធវត្តអារាម</span>
                                </div>
                            </div>
                            <p class="mb-4 text-muted" style="font-size: 0.96rem; line-height: 1.75;">
                                ប្រសិនបើលោកអ្នកភ្លេចលេខសម្ងាត់ សូមមេត្តាទាក់ទងមកកាន់ <strong style="color: var(--primary-color);">មេកុដិ ឬ Admin</strong> របស់អ្នកដើម្បីធ្វើការកំណត់លេខសម្ងាត់ថ្មីក្នុងប្រព័ន្ធ!
                            </p>
                            <div class="note-box p-3">
                                <p class="m-0 text-muted" style="font-size: 0.85rem; line-height: 1.65;">
                                    <strong style="color: var(--text-heading-color);">💡 ចំណាំ (Note)៖</strong> ដើម្បីសុវត្ថិភាព និងការគ្រប់គ្រងទិន្នន័យក្នុងប្រព័ន្ធវត្តអារាម ការកំណត់លេខសម្ងាត់ថ្មីសម្រាប់គណនីព្រះសង្ឃ ភិក្ខុ និងនិស្សិត ត្រូវធ្វើឡើងតាមរយៈមេកុដិ ឬអ្នកគ្រប់គ្រងប្រព័ន្ធផ្ទាល់ប៉ុណ្ណោះ។
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- TAB 2: Email Reset Form -->
                    <div v-else class="animate-slide-up text-start">
                        <!-- Forbidden / Telegram Redirection -->
                        <div v-if="showTelegramContact" class="text-center">
                            <h2 class="h5 mb-3 font-weight-bold" style="color: var(--text-heading-color);">គណនីមានសុវត្ថិភាពខ្ពស់ (2FA)</h2>
                            <p class="text-muted mb-4" style="line-height: 1.6; font-size: 0.95rem;">
                                គណនីរបស់អ្នកបានបើកមុខងារការពារ ២ ជាន់។ សូមទាក់ទង Admin តាម Telegram ដើម្បីប្តូរលេខសម្ងាត់។
                            </p>
                            <BaseButton @click="openTelegramLink" class="w-100 mb-3 justify-content-center d-flex align-items-center gap-2" variant="primary">
                                <MessageCircle :size="18" />
                                Contact Support via Telegram
                            </BaseButton>
                            <button type="button" @click="showTelegramContact = false" class="btn btn-link text-muted w-100 text-decoration-none">
                                ព្យាយាមអ៊ីមែលផ្សេង (Try Another Email)
                            </button>
                        </div>

                        <!-- Success state -->
                        <div v-else-if="isSuccess" class="text-center animate-slide-up">
                            <div class="success-icon-wrapper mx-auto mb-4 d-flex align-items-center justify-content-center">
                                <CheckCircle2 :size="38" />
                            </div>
                            <h3 class="h4 font-weight-bold mb-2" style="color: var(--text-heading-color);">ពិនិត្យអ៊ីមែលរបស់អ្នក</h3>
                            <p class="text-muted mb-4 mx-auto" style="font-size: 0.94rem; line-height: 1.7; max-width: 330px;">
                                យើងបានផ្ញើតំណភ្ជាប់សុវត្ថិភាពដើម្បីកំណត់លេខសម្ងាត់ថ្មីទៅកាន់ប្រអប់សំបុត្រ (Inbox) របស់អ្នកហើយ។
                            </p>
                            <div class="note-box p-3 mb-4 text-start">
                                <p class="m-0 text-muted" style="font-size: 0.84rem; line-height: 1.6;">
                                    <strong style="color: var(--text-heading-color);">💡 មិនឃើញអ៊ីមែលទេ?</strong> សូមពិនិត្យមើលក្នុងថត Spam ឬ Junk Folder របស់អ្នក។
                                </p>
                            </div>
                            <div class="d-flex flex-column gap-2">
                                <router-link :to="{ name: 'login' }" class="btn btn-primary-custom w-100 font-weight-bold d-flex align-items-center justify-content-center gap-2 text-decoration-none" style="padding: 0.5rem 1rem;">
                                    <span>ត្រឡប់ទៅចូលប្រព័ន្ធ (Back to Login)</span>
                                </router-link>
                                <button type="button" @click="isSuccess = false; email = ''" class="btn btn-link text-muted w-100 text-decoration-none" style="padding: 0.5rem 1rem;">
                                    មិនទទួលបានអ៊ីមែល? <strong style="color: var(--primary-color);">ផ្ញើម្តងទៀត</strong>
                                </button>
                            </div>
                        </div>

                        <!-- Form state -->
                        <div v-else>
                            <form @submit.prevent="onSubmit" novalidate>
                                <div class="mb-3">
                                    <BaseInput required type="email" label="អ៊ីមែលផ្ទាល់ខ្លួន (Email Address)" v-model="email" :error="errors.email" placeholder="admin@example.com" />
                                </div>
                                <BaseButton :isLoading="isLoading" type="submit" class="w-100 justify-content-center mt-2">
                                    {{ isLoading ? 'កំពុងផ្ញើ...' : 'ផ្ញើតំណប្តូរលេខសម្ងាត់ (Send Reset Link)' }}
                                </BaseButton>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { UserCheck, KeyRound, MessageCircle, ArrowLeft, CheckCircle2 } from '@lucide/vue';
import Logo from '@/components/Logo.vue';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useForm, useField } from 'vee-validate';
import { authSchemas } from '@/utils/validations';

const activeTab = ref('monk'); // 'monk' or 'email'
const isLoading = ref(false);
const isSuccess = ref(false);
const showTelegramContact = ref(false);
const authStore = useAuthStore();
const telegramUsername = import.meta.env.VITE_TELEGRAM_SUPPORT_USERNAME || 'Monk_permission_bot';
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
    isSuccess.value = false;
    const res = await authStore.forgotPassword({ email: values.email.trim() });
    isLoading.value = false;
    
    if (res.isUserForbidden) {
        showTelegramContact.value = true;
    } else if (res.success) {
        isSuccess.value = true;
    }
});
</script>
