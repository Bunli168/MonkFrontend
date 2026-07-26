<template>
    <div class="system-settings-container d-flex flex-column gap-3">
        <!-- Title Banner -->
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center p-3 rounded" style="background-color: var(--body-bg-color); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
            <div>
                <h5 class="fw-bold mb-1" style="color: var(--text-heading-color);">System Settings</h5>
                <p class="mb-0 text-muted" style="font-size: 13px;">Manage global configurations that rarely change.</p>
            </div>
        </div>

        <!-- Tab Navigation -->
        <div class="card border-0 shadow-sm" style="background-color: var(--surface-card);">
            <div class="border-bottom px-3" style="background-color: var(--surface-card);">
                <ul class="nav nav-tabs border-0 gap-1">
                    <li class="nav-item" v-for="tab in tabs" :key="tab.id">
                        <button
                            class="nav-tab-btn"
                            :class="{ active: activeTab === tab.id }"
                            @click="activeTab = tab.id"
                        >
                            <component :is="tab.icon" :size="15" />
                            <span>{{ tab.label }}</span>
                        </button>
                    </li>
                </ul>
            </div>

            <!-- Tab Content -->
            <div class="p-3">
                <KeepAlive>
                    <component :is="activeComponent" />
                </KeepAlive>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { MapPin, Calendar, Armchair, Home, Settings } from '@lucide/vue';
import LocationSettings from '@/views/admin/reports/ProvinceDistrictCommuneView.vue';
import RetreatEventSettings from './RetreatEventSettings.vue';
import SeatingRowSettings from './SeatingRowSettings.vue';
import KudiSettings from '@/views/admin/kuts/KutView.vue';

const tabs = [
    { id: 'kudi', label: 'Kudi Numbers', icon: Home },
    { id: 'seating-rows', label: 'Seating Rows', icon: Armchair },
   { id: 'retreat-events', label: 'Retreat Events', icon: Calendar },
   { id: 'locations', label: 'Locations', icon: MapPin }
];

const activeTab = ref('kudi');

const activeComponent = computed(() => {
    switch (activeTab.value) {
        case 'locations': return LocationSettings;
        case 'retreat-events': return RetreatEventSettings;
        case 'kudi': return KudiSettings;
        case 'seating-rows': return SeatingRowSettings;
        default: return KudiSettings;
    }
});
</script>

<style scoped>
.nav-tab-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--text-muted-color, #888);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
    margin-bottom: -1px;
    white-space: nowrap;
}

.nav-tab-btn:hover {
    color: var(--primary-color);
}

.nav-tab-btn.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
}
</style>
