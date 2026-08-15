<script setup>
import { useAuthStore } from '@/stores/auth.js';
import { computed, ref } from 'vue';
import { useSidebarStore } from '@/stores/sidebar';
import { Menu, X } from '@lucide/vue';
import { useRoute } from 'vue-router';
import ProfileDropdown from '@/components/common/ProfileDropdown.vue';

const authStore = useAuthStore();
const sidebar = useSidebarStore();
const route = useRoute();
const user = computed(() => authStore.user);

const isImageLoading = ref(true);
</script>

<template>
    <header class="dashboard-header d-flex align-items-center justify-content-between px-lg-4 px-3 border-bottom">
        <div class="header-left d-flex align-items-center gap-3">
            <!-- Mobile Sidebar Toggle -->
            <button class="btn bg-transparent border-0 shadow-none d-lg-none p-2 rounded d-flex align-items-center justify-content-center" style="color: inherit;" @click="sidebar.toggleMobile()">
                <Menu :size="24" />
            </button>
            
            <h5 class="mb-0 fw-medium d-none d-lg-block">{{ route.meta.title }}</h5>
        </div>

        <!-- Mobile Centered Title -->
        <div class="header-center position-absolute start-50 translate-middle-x d-lg-none">
            <h6 class="mb-0 fw-medium">{{ route.meta.title }}</h6>
        </div>
        
        <div class="header-right d-flex align-items-center gap-3">
            <ProfileDropdown profileRouteName="dashboard" settingsRouteName="settings">
                <template #trigger="{ toggle, isOpen }">
                    <div class="d-flex align-items-center gap-3" @click="toggle" style="cursor: pointer;">
                        <span class="fw-medium d-none d-sm-block">{{ user?.firstName }} {{ user?.lastName }}</span>
                        <div class="avatar-ring-container" :class="{ 'is-loading': authStore.isLoading || isImageLoading }">
                            <div class="user-avatar overflow-hidden rounded-circle bg-light border position-relative" :class="{ 'active-profile': isOpen || route.name === 'settings' }">
                                <div class="avatar-default" :class="{ 'is-hidden': isOpen }">
                                    <img v-if="user?.profile?.avatarUrl" :src="$authImg(user.profile.avatarUrl)" alt="Avatar" class="w-100 h-100 object-fit-cover" @load="isImageLoading = false" @error="isImageLoading = false" />
                                    <img v-else src="/app-logo.png" alt="Avatar" class="w-100 h-100 object-fit-cover" @load="isImageLoading = false" @error="isImageLoading = false" />
                                </div>
                                <div class="avatar-active d-flex align-items-center justify-content-center w-100 h-100 bg-light" :class="{ 'is-visible': isOpen }">
                                    <X :size="20" class="text-muted" />
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </ProfileDropdown>
        </div>
    </header>
</template>

<style scoped>
.dashboard-header {
    background: color-mix(in srgb, var(--body-bg-color) 75%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-clr) !important;
    height: var(--sidebar-header-height);
    width: 100%;
    position: sticky;
    top: 0;
    z-index: 1000;
}

.user-avatar {
    width: 40px; 
    height: 40px;
    transition: all 0.2s ease;
}

.user-avatar.active-profile {
    border-color: var(--primary-color) !important;
    transform: scale(1.05);
}

.avatar-ring-container {
    position: relative;
    border-radius: 50%;
    padding: 2px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.avatar-ring-container.is-loading::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: conic-gradient(transparent 60%, var(--primary-color) 100%);
    animation: rotate 1.2s linear infinite;
}

.avatar-ring-container > .user-avatar {
    position: relative;
    z-index: 1;
    background-color: var(--surface-card);
}

.avatar-default, .avatar-active {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar-default {
    opacity: 1;
    transform: rotate(0) scale(1);
}

.avatar-default.is-hidden {
    opacity: 0;
    transform: rotate(-90deg) scale(0.5);
}

.avatar-active {
    opacity: 0;
    transform: rotate(90deg) scale(0.5);
}

.avatar-active.is-visible {
    opacity: 1;
    transform: rotate(0) scale(1);
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

</style>
