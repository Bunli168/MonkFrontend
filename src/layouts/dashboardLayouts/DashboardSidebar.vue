<style scoped>
.sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    background-color: var(--sidebar-bg-color);
    z-index: 1000;
    display: flex;
}

@media (max-width: 991.98px) {
    .sidebar {
        position: static;
        height: 100%;
    }
}

.main-sidebar {
    width: var(--main-sidebar-width);
    flex-shrink: 0;
    height: 100%;
    background-color: var(--main-sidebar-bg);
    display: flex;
    flex-direction: column;
    align-items: center;
}

@media (max-width: 991.98px) {
    .main-sidebar {
        display: none !important;
    }
}

.main-sidebar-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    flex-shrink: 0;
    border-bottom: 1px solid var(--sidebar-border-color);
    height: var(--sidebar-header-height);
}

@media (max-width: 991.98px) {
    .main-sidebar-brand {
        display: none;
    }
}

.toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background-color: transparent;
    color: var(--sidebar-text-active);
    cursor: pointer;
    flex-shrink: 0;
}

.icon-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    flex: 1;
}

.icon-btn {
    width: 100%;
    padding: 12px 0;
    display: flex;
    height: 48px;
    align-items: center;
    justify-content: center;
    color: var(--sidebar-text-muted);
    text-decoration: none;
    flex-shrink: 0;
    border-left: 3px solid transparent;
    transition: color 0.15s, border-color 0.15s;
    box-sizing: border-box;
}

.icon-btn:hover {
    color: var(--sidebar-text-hover);
}

.icon-btn.is-active {
    color: var(--sidebar-text-active);
    border-left-color: var(--sidebar-text-active);
}

.second-sidebar {
    width: var(--sidebar-width);
    flex-shrink: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.second-sidebar.collapsed {
    width: 0;
}

@media (max-width: 991.98px) {
    .second-sidebar.collapsed {
        width: var(--sidebar-width);
    }
}

.sidebar-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--sidebar-header-height);
    border-bottom: 1px solid var(--sidebar-border-color);
}

.label-col {
    flex: 1;
    position: relative;
}

.sidebar-decoration {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 250px;
    background-color: var(--primary-color);
    -webkit-mask-image: url('/sidebar-decoration.png');
    -webkit-mask-size: 100% auto;
    -webkit-mask-position: bottom;
    -webkit-mask-repeat: no-repeat;
    mask-image: url('/sidebar-decoration.png');
    mask-size: 100% auto;
    mask-position: bottom;
    mask-repeat: no-repeat;
    opacity: 0.5;
    pointer-events: none;
    user-select: none;
    display: block;
    z-index: 0;
}

.navbar-nav {
    position: relative;
    overflow: hidden;
    width: 100%;
    padding: 0;
}

.nav-item {
    width: 100%;
}

.active-pill {
    position: absolute;
    left: 12px;
    right: 0;
    background-color: var(--body-bg-color);
    border-radius: 50px 0 0 50px;
    pointer-events: none;
    transition: top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.active-pill.no-transition {
    transition: none;
}

.active-pill::before,
.active-pill::after {
    content: '';
    position: absolute;
    width: var(--border-radius);
    height: var(--border-radius);
    right: 0;
    background-color: transparent;
    pointer-events: none;
}

.active-pill::before {
    top: calc(-1 * var(--border-radius));
    border-bottom-right-radius: var(--border-radius);
    box-shadow: 5px 5px 0 5px var(--body-bg-color);
}

.active-pill::after {
    bottom: calc(-1 * var(--border-radius));
    border-top-right-radius: var(--border-radius);
    box-shadow: 5px -5px 0 5px var(--body-bg-color);
}

.nav-link {
    position: relative;
    padding: 12px 24px;
    margin-left: 12px;
    color: var(--sidebar-text-hover);
    text-decoration: none;
    display: flex;
    align-items: center;
    border-radius: var(--border-radius) 0 0 var(--border-radius);
    font-weight: 500;
    z-index: 1;
    white-space: nowrap;
    box-sizing: border-box;
    width: calc(100% - 12px);
}

.nav-link:hover {
    color: var(--sidebar-text-active);
}

.nav-link.is-active {
    color: var(--primary-color);
}

.footer-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 0;
    width: 100%;
}

.theme-switcher {
    background-color: var(--sidebar-element-bg);
    border-radius: 50px;
    display: flex;
    flex-direction: column;
    padding: 2px;
    gap: 2px;
}

.theme-btn {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: var(--sidebar-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    cursor: pointer;
}

.theme-btn:hover {
    color: var(--sidebar-text-active);
}

.theme-btn.active {
    background-color: var(--primary-color);
    color: var(--body-bg-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.divider {
    width: 30px;
    height: 1px;
    background-color: var(--sidebar-border-color);
    margin: 1.25rem 0;
}
</style>

<template>
    <aside class="sidebar">

        <div class="main-sidebar">
            <div class="main-sidebar-brand mb-3">
                <Logo style="width: 35px; height: 35px; flex-shrink: 0;" />
            </div>

            <div class="icon-col">
                <router-link v-for="item in navItems" :key="item.id" :to="item.link" class="icon-btn"
                    :class="{ 'is-active': isActive(item.link) }" v-tooltip.right="item.label">
                    <component :is="item.icon" :size="20" :stroke-width="1.75" />
                </router-link>
            </div>

            <div class="footer-col">
                <a :href="`https://t.me/${telegramUsername}?start=${authStore.user?.phone || ''}`" target="_blank" class="theme-btn mb-2" v-tooltip.right="'Link Telegram'" style="text-decoration: none; color: #0088cc;">
                    <Send :size="18" :stroke-width="2" />
                </a>

                <div class="theme-switcher mb-3">
                    <button aria-label="Light theme" class="theme-btn" :class="{ active: theme === 'light' }"
                        @click="setTheme('light')" v-tooltip.right="'Light theme'">
                        <Sun :size="15" :stroke-width="2" />
                    </button>
                    <button aria-label="Dark theme" class="theme-btn" :class="{ active: theme === 'dark' }"
                        @click="setTheme('dark')" v-tooltip.right="'Dark theme'">
                        <Moon :size="15" :stroke-width="2" />
                    </button>
                </div>
                
                <button aria-label="Toggle sidebar" class="toggle-btn mt-2" @click="sidebar.toggle()"
                    v-tooltip.right="sidebar.isExpanded ? 'Collapse' : 'Expand'">
                    <PanelLeftClose v-if="sidebar.isExpanded" :size="22" :stroke-width="1.5" />
                    <PanelLeftOpen v-else :size="22" :stroke-width="1.5" />
                </button>
            </div>
        </div>


        <div class="second-sidebar" :class="{ collapsed: !sidebar.isExpanded }">
            <div class="sidebar-brand mb-3">
            </div>

            <div class="label-col">
                <div class="active-pill" :class="{ 'no-transition': !pillReady }"
                    :style="{ top: pillTop + 'px', height: pillHeight + 'px' }"></div>

                <ul class="navbar-nav">
                    <li class="nav-item" v-for="(item, index) in navItems" :key="item.id"
                        :ref="el => { if (el) itemRefs[index] = el }">
                        <router-link :to="item.link" class="nav-link" :class="{ 'is-active': isParentActive(item) }">
                            <span class="d-none d-lg-inline">{{ item.label }}</span>
                            <span class="d-lg-none">{{ item.shortLabel || item.label }}</span>
                        </router-link>
                    </li>
                </ul>

                <div class="sidebar-decoration" aria-hidden="true"></div>
            </div>


        </div>
    </aside>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { LayoutDashboard, Users, PanelLeftClose, PanelLeftOpen, Flag, FileText, School, Sun, Moon, Settings, Calendar, Settings2, DollarSign, ClipboardList, Send } from '@lucide/vue';
import Logo from '@/components/Logo.vue';
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useSidebarStore } from '@/stores/sidebar';

const authStore = useAuthStore();

const sidebar = useSidebarStore();
const telegramUsername = import.meta.env.VITE_TELEGRAM_SUPPORT_USERNAME || 'Monk_permission_bot';

let savedAppearance = {};
try {
    const stored = localStorage.getItem('app-Appearance');
    if (stored) savedAppearance = JSON.parse(stored);
} catch (e) { }

const savedTheme = savedAppearance.theme || localStorage.getItem('app-theme') || 'light';
const theme = ref(savedTheme);

function setTheme(val) {
    theme.value = val;
    document.documentElement.setAttribute('data-theme', val);
    document.documentElement.setAttribute('data-bs-theme', val);

    let savedAppearance = {};
    try {
        const stored = localStorage.getItem('app-Appearance');
        if (stored) savedAppearance = JSON.parse(stored);
    } catch (e) { }

    savedAppearance.theme = val;
    localStorage.setItem('app-Appearance', JSON.stringify(savedAppearance));
}

const route = useRoute();
const itemRefs = ref([]);
const pillTop = ref(0);
const pillHeight = ref(0);
const pillReady = ref(false);

const navItems = computed(() => {
    const items = [
        { id: 1, label: 'Dashboard', link: '/dashboard', icon: LayoutDashboard, roles: ['SuperAdmin', 'ADMIN', 'MEKUDI'] },
        { id: 2, label: 'Users', link: '/dashboard/user', icon: Users, roles: ['SuperAdmin', 'ADMIN', 'MEKUDI'] },
        { id: 4, label: 'Attendance', link: '/dashboard/attendance', icon: Calendar, roles: ['SuperAdmin', 'MEKUDI'] },
        { id: 11, label: 'Attendance', link: '/pagoda/taker/management', icon: ClipboardList, roles: ['ADMIN', 'MEKUDI', 'ATTENDANCETAKER'] },
        // { id: 12, label: 'Leave Requests', link: '/dashboard/leave-requests', icon: FileText, roles: ['SuperAdmin', 'ADMIN', 'MEKUDI'] },
        { id: 13, label: 'Events & Assignments', shortLabel: 'Events', link: '/dashboard/ceremony-events', icon: Flag, roles: ['SuperAdmin', 'ADMIN', 'MEKUDI'] },
        { id: 10, label: 'System Settings', link: '/dashboard/system-settings', icon: Settings2, roles: ['SuperAdmin'] },
        { id: 9, label: 'Settings', link: '/dashboard/settings', icon: Settings },
    ];
    
    return items.filter(item => {
        if (!item.roles) return true;
        return authStore.hasRole(item.roles);
    });
});

function isActive(link) {
    return route.path === link;
}

function isParentActive(item) {
    if (route.path === item.link) return true;
    if (item.children && item.children.some(child => route.path === child.link)) return true;
    return false;
}

function updatePill(animate = true) {
    const activeIndex = navItems.value.findIndex(item => isParentActive(item))
    const el = itemRefs.value[activeIndex]
    if (el) {
        pillTop.value = el.offsetTop

        const navLinkElement = el.querySelector('.nav-link');
        pillHeight.value = navLinkElement ? navLinkElement.offsetHeight : el.offsetHeight;
    }
    if (animate) pillReady.value = true
}

onMounted(async () => {
    setTheme(theme.value);
    await nextTick()
    updatePill(false)
    await nextTick()
    pillReady.value = true
})

watch(() => route.path, async () => {
    await nextTick();
    updatePill(true);
})
</script>