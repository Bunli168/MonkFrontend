<template>
    <div class="tnak-header p-2" ref="headerRef">
        <div class="brand-pill container-xl position-relative ">
            <div class="d-flex align-items-center justify-content-between h-100 p-1">
            
            <!-- Left Side: Logo and Mobile Toggle -->
            <div class="d-flex align-items-center h-100" >
                <!-- Logo -->
                <div class="d-flex align-items-center gap-2" style="cursor: pointer;" @click="goHome">
                    <div class="logo-icon d-flex align-items-center justify-content-center flex-shrink-0" style="width: 28px; height: 28px;">
                        <Logo />
                    </div>
                    <span class="fw-bold fs-5 text-heading d-none d-sm-block">Pagoda Management</span>
                </div>

                <!-- Toggle Button (Mobile Only) -->
                <button @click.stop="showNavLinks = !showNavLinks" class="btn btn-sm d-xl-none border-0 p-1 toggle-btn ms-3 position-relative overflow-hidden" style="color: var(--text-color);">
                    <div class="avatar-default d-flex align-items-center justify-content-center w-100 h-100" :class="{ 'is-hidden': showNavLinks }">
                        <Menu :size="24" />
                    </div>
                    <div class="avatar-active d-flex align-items-center justify-content-center w-100 h-100" :class="{ 'is-visible': showNavLinks }">
                        <X :size="24" />
                    </div>
                </button>
            </div>

            <!-- Center: Navigation Links -->
            <div class="nav-links d-flex align-items-center gap-1 justify-content-center" :class="{ 'mobile-open': showNavLinks }">
                <router-link v-for="headerPath in headerPaths" :key="headerPath.path"
                    :to="{ name: headerPath.path }" active-class="active"
                    class="nav-link menu-link d-flex align-items-center px-3 py-2 gap-2" @click="showNavLinks = false">
                    <component :is="headerPath.icon" :size="18" :stroke-width="2" />
                    <span class="fw-medium" style="font-size: 0.9rem;">{{ headerPath.label }}</span>
                    <span v-if="headerPath.path === 'pagoda-my-events' && pendingEventCount > 0" class="badge rounded-pill bg-danger ms-1">{{ pendingEventCount }}</span>
                </router-link>
            </div>
            
            <!-- Right Side: Theme, Profile -->
            <div class="header-right-actions  d-flex align-items-center" >

                <!-- Profile Info Pill -->
                <ProfileDropdown profileRouteName="pagoda-profile" settingsRouteName="pagoda-profile">
                    <template #trigger="{ toggle, isOpen }">
                        <div class="avatar-wrapper position-relative overflow-hidden" 
                             :class="{ 'active-profile': route.name === 'pagoda-profile' || isOpen }"
                             @click="toggle" style="cursor: pointer;">
                            <div class="avatar-default" :class="{ 'is-hidden': isOpen }">
                                <img :src="$authImg(authStore.user?.profile?.avatarUrl) || '/neakavorn-pagoda.png'"
                                     alt="User Avatar" 
                                     class="w-100 h-100 object-fit-cover" />
                            </div>
                            <div class="avatar-active d-flex align-items-center justify-content-center w-100 h-100 bg-light" :class="{ 'is-visible': isOpen }">
                                <X :size="20" class="text-muted" />
                            </div>
                        </div>
                    </template>
                </ProfileDropdown>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useSystemStore } from '@/stores/system';
import { useRouter, useRoute } from 'vue-router';
import { LayoutDashboard, DoorOpen, FileText, Menu, ClipboardList, X, Bookmark, Users, Calendar, QrCode, UserX } from '@lucide/vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Logo from '@/components/Logo.vue';
import ProfileDropdown from '@/components/common/ProfileDropdown.vue';
import api from '@/api/api';
import { socket } from '@/utils/socket';

const authStore = useAuthStore();
const systemStore = useSystemStore();
const router = useRouter();
const route = useRoute();

const goHome = () => {
    if (authStore.userRole?.toUpperCase() === 'ATTENDANCETAKER') {
        router.push({ name: 'taker-attendance' });
    } else {
        router.push({ name: 'pagoda-overview' });
    }
};

const headerPaths = computed(() => {
    if (authStore.userRole?.toUpperCase() === 'ATTENDANCETAKER') {
        return [
            { label: 'Take Attendance', path: 'taker-attendance', icon: ClipboardList },
            { label: 'Absences', path: 'taker-absent-permission', icon: FileText },
            { label: '3+ Absences', path: 'taker-warnings', icon: FileText },
            { label: 'Unassigned', path: 'taker-unassigned', icon: UserX }
        ];
    }

    const paths = [
        { label: 'Overview', path: 'pagoda-overview', icon: LayoutDashboard },
        { label: authStore.isTeacher ? 'My Schedule' : (authStore.isMonk ? 'Monk Profile' : 'ពត៌មាននិស្សិត'), path: 'pagoda-my-bookings', icon: Bookmark },
    ];
    
    if (authStore.isStudent && !authStore.isMonk) {
        paths.push({ label: 'ប្រវត្តិរូបនិស្សិត', path: 'pagoda-student-biography', icon: ClipboardList });
    }
    if (authStore.isMonk) {
        paths.push({ label: 'ការនិមន្តរបស់ខ្ញុំ', path: 'pagoda-my-events', icon: Calendar });
        paths.push({ label: 'ប្រវត្តិរូបសង្ខេប', path: 'pagoda-monk-biography', icon: ClipboardList });
    }
    


    if (authStore.isTeacher || authStore.isAdmin || authStore.isMekudi) {
        paths.push({ label: 'Users', path: 'pagoda-users', icon: Users });
    }
    
    if ( authStore.isMekudi) {
        paths.push({ label: 'Attendance', path: 'pagoda-attendance', icon: Calendar });
    }
    
    if (authStore.isAttendanceTaker ) {
        paths.push({ label: 'Take Attendance', path: 'taker-attendance', icon: ClipboardList });
    }
    
    if (authStore.isAttendanceTaker || authStore.isAdmin) {
        paths.push({ label: 'Absences', path: 'taker-absent-permission', icon: FileText });
        paths.push({ label: '3+ Absences', path: 'taker-warnings', icon: FileText });
        paths.push({ label: 'Unassigned', path: 'taker-unassigned', icon: UserX });
    }
    
    if (false) {
        paths.push({ label: 'Fine Ledger', path: 'pagoda-ledger', icon: FileText });
    }
    
    if (systemStore.isSeasonOpen && (authStore.isMekudi || authStore.isMonk)) {
        paths.push({ label: 'Attendance', path: 'self-register', icon: ClipboardList });
    }

    // Admin & SuperAdmin get a link back to the main dashboard
    if (authStore.isAdmin || authStore.isSuperAdmin) {
        paths.push({ label: 'Dashboard', path: 'dashboard', icon: LayoutDashboard });
    }
    
    return paths;
});

const showNavLinks = ref(false);
const headerRef = ref(null);
const pendingEventCount = ref(0);

const fetchPendingEventCount = async () => {
    if (authStore.isMonk) {
        try {
            const res = await api.get('/ceremony-events/my-assignments');
            const assignments = res.data?.data || [];
            pendingEventCount.value = assignments.filter(a => a.status === 'ASSIGNED').length;
        } catch (error) {
            console.error('Error fetching pending events count:', error);
        }
    }
};

const handleClickOutside = (event) => {
    if (showNavLinks.value && headerRef.value && !headerRef.value.contains(event.target)) {
        showNavLinks.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    if (!systemStore.hasLoaded) {
        systemStore.fetchCurrentSeason();
    }
    fetchPendingEventCount();
    socket.on('ceremony_event_created', fetchPendingEventCount);
    socket.on('ceremony_event_updated', fetchPendingEventCount);
    socket.on('ceremony_assignment_updated', fetchPendingEventCount);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    socket.off('ceremony_event_created', fetchPendingEventCount);
    socket.off('ceremony_event_updated', fetchPendingEventCount);
    socket.off('ceremony_assignment_updated', fetchPendingEventCount);
});

</script>

<style scoped>
.tnak-header {
    width: 100%;
    position: relative;
    z-index: 1000;
}

.brand-pill {
    background-color: var(--body-bg-color);
    border-radius: var(--border-radius);
    height: var(--header-height, 56px);
}

/* Nav Links */
.menu-link {
    border-radius: var(--border-inner-radius);
    text-decoration: none;
    color: var(--text-muted);
    white-space: nowrap;
}

.menu-link:hover {
    background-color: rgba(0,0,0,0.03);
    color: var(--text-color);
}

.menu-link.active {
    background-color: color-mix(in srgb, var(--primary-color) 10%, transparent);
    color: var(--primary-color) !important;
}

/* Actions & Profile */
.action-btn {
    width: 36px;
    height: 36px;
    background: rgba(0,0,0,0.03);
    color: var(--text-muted);
    transition: all 0.2s ease;
}

.action-btn:hover {
    background: rgba(0,0,0,0.08);
    color: var(--text-color);
}

.avatar-wrapper {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    transition: all 0.2s ease;
    border: 2px solid transparent;
}

.avatar-wrapper:hover {
    border-color: rgba(0,0,0,0.1);
    transform: scale(1.05);
}

.avatar-wrapper.active-profile {
    border-color: var(--primary-color);
}

/* Mobile Responsiveness */
.toggle-btn {
    width: 36px;
    height: 36px;
    background: rgba(0,0,0,0.03);
    border-radius: var(--border-inner-radius);
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



@media (max-width: 1199.98px) {
    .nav-links {
        position: absolute;
        top: calc(100% + 4px);
        left: 0.5rem;
        right: 0.5rem;
        background-color: var(--surface-ground);
        flex-direction: column !important;
        align-items: stretch !important;
        max-height: 0;
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        border-radius: var(--border-radius);
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        z-index: 1000;
        overflow: hidden;
        padding: 0 0.5rem;
        gap: 0.25rem !important;
    }
    
    .nav-links.mobile-open {
        max-height: var(--mobile-nav-max-height, 80vh);
        overflow-y: auto;
        opacity: 1;
        pointer-events: auto;
        padding: 0.5rem;
    }
}

.header-right-actions {
    position: relative;
}

</style>