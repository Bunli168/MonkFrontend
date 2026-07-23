<script setup>
import { useSidebarStore } from '@/stores/sidebar';
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import DashboardSidebar from './DashboardSidebar.vue';
import DashboardHeader from './DashboardHeader.vue';
import PremiumBackground from '@/components/PremiumBackground.vue';
import { useAuthStore } from '@/stores/auth.js';

const sidebar = useSidebarStore();
const route = useRoute();
const authStore = useAuthStore();

watch(() => route.path, () => {
    sidebar.closeMobile();
});

onMounted(async () => {
    await authStore.getProfile();
})

</script>

<template>
    <div class="dashboard-shell-container">
        <PremiumBackground />
        
        <div class="sidebar-backdrop d-lg-none" :class="{ 'show': sidebar.isMobileOpen }"
            @click="sidebar.closeMobile()">
        </div>

        <div class="content-sidebar" :class="{ 'mobile-show': sidebar.isMobileOpen }">
            <DashboardSidebar />
        </div>

        <main class="content-wrapper" :class="{ collapsed: !sidebar.isExpanded }">
            <DashboardHeader />
            <div class="container-fluid p-lg-4 p-3">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </div>
        </main>
    </div>
</template>

<style scoped>
.sidebar-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1005;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s;
    will-change: opacity;
}

.sidebar-backdrop.show {
    opacity: 1;
    visibility: visible;
}

.content-wrapper {
    margin-left: calc(var(--sidebar-width) + var(--main-sidebar-width));
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 100vh;
}

.content-wrapper.collapsed {
    margin-left: var(--main-sidebar-width);
}

@media (max-width: 991.98px) {
    .content-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 1011;
        transform: translateX(-100%);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform;
    }



    .content-sidebar.mobile-show {
        transform: translateX(0);
    }

    .content-wrapper {
        margin-left: 0 !important;
        min-height: calc(100vh - var(--sidebar-header-height));
    }

}
</style>