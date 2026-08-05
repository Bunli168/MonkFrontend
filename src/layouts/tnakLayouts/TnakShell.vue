<template>
    <div class="tnak-layout">
        <PremiumBackground />

        <TnakHeader />

        <div class="tnak-layout-body position-relative p-1 p-md-2">
            <div class="container-xl h-100 p-0">
                <router-view v-slot="{ Component, route }">
                    <keep-alive>
                        <component :is="Component" :key="route.name" />
                    </keep-alive>
                </router-view>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth.js';
import TnakHeader from './TnakHeader.vue';
import PremiumBackground from '@/components/PremiumBackground.vue';
import { onMounted } from 'vue';

const authStore = useAuthStore();

onMounted(async () => {
    await authStore.getProfile();
});
</script>
