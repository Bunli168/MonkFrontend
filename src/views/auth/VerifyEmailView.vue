<template>
    <div class="verify-wrapper d-flex flex-column align-items-center justify-content-center" style="height: 100vh; background-color: #ffffff;">
        <div class="text-center px-4" style="max-width: 400px; width: 100%;">
            
            <!-- Icon -->
            <div class="mb-4 d-inline-flex align-items-center justify-content-center" style="width: 64px; height: 64px; border: 1px solid #dc3545; border-radius: 50%;">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc3545" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-fingerprint"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>
            </div>
            
            <h1 class="h3 mb-2" style="font-weight: 600; color: #111;">Verify Identity</h1>
            <p class="text-muted mb-4" style="font-size: 15px;">Secure access to your unified workspace.</p>
            
            <button 
                @click="verify" 
                :disabled="isLoading"
                class="btn w-100 d-flex align-items-center justify-content-center gap-2 authorize-btn" 
                style="border: 1px solid #eaeaea; background: #fff; color: #333; padding: 12px; font-weight: 500; border-radius: 8px; transition: all 0.2s;"
            >
                <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span v-else>Authorize</span>
                <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            
            <div v-if="errorMessage" class="text-danger mt-3" style="font-size: 14px;">
                {{ errorMessage }}
            </div>
            <div v-if="success" class="text-success mt-3" style="font-size: 14px;">
                Verified successfully! Redirecting...
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();
const authStore = useAuthStore();

const isLoading = ref(false);
const success = ref(false);
const errorMessage = ref('');

const verify = async () => {
    const token = route.query.token;
    
    if (!token) {
        errorMessage.value = 'No verification token provided.';
        return;
    }
    
    isLoading.value = true;
    errorMessage.value = '';
    
    try {
        const response = await api.post('/auth/verify-email', { token });
        if (response.data?.success) {
            success.value = true;
            toastStore.showToast('Email verified successfully!', 'success');
            setTimeout(() => {
                if (authStore.isAuthenticated) {
                    if (authStore.isAdmin) {
                        router.push({ name: 'dashboard' });
                    } else {
                        router.push({ name: 'pagoda-overview' });
                    }
                } else {
                    router.push({ name: 'login' });
                }
            }, 1000);
        } else {
            success.value = false;
            errorMessage.value = response.data?.message || 'Verification failed.';
        }
    } catch (error) {
        success.value = false;
        errorMessage.value = error.response?.data?.message || 'An error occurred during verification.';
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    if (!route.query.token) {
        errorMessage.value = 'No verification token provided in the URL.';
    }
});
</script>

<style scoped>
.verify-wrapper {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
.authorize-btn:hover:not(:disabled) {
    background-color: #f8f9fa !important;
    border-color: #ddd !important;
}
</style>
