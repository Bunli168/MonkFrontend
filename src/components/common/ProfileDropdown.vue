<template>
    <div class="base-dropdown-container position-relative d-inline-block" ref="containerRef">
        <!-- Trigger Slot -->
        <slot name="trigger" :toggle="toggle" :is-open="isOpen"></slot>

        <!-- Custom Dropdown Menu -->
        <transition name="dropdown-anim">
            <div v-if="isOpen" class="menu-dropdown shadow-lg">
                <!-- Top Section: User Info -->
                <div class="user-info-section d-flex align-items-center gap-3 mb-2">
                    <div class="dropdown-avatar">
                        <img :src="$authImg(user?.profile?.avatarUrl) || '/avatar.png'" alt="User Avatar" class="w-100 h-100 object-fit-cover">
                    </div>
                    <div class="d-flex flex-column overflow-hidden" style="flex: 1; min-width: 0;">
                        <span class="fw-bold dropdown-name text-truncate w-100 d-block">{{ user?.name || 'User' }}</span>
                        <span class="text-muted dropdown-email text-truncate w-100 d-block">{{ user?.email || 'user@example.com' }}</span>
                    </div>
                </div>

                <!-- Bottom Section: Links Box -->
                <div class="dropdown-links-box">

                    <router-link :to="{ name: settingsRouteName }" class="menu-dropdown-link" @click="close">
                        <Settings :size="18" class="me-3" stroke-width="2" />
                        <span>Settings</span>
                    </router-link>

                    <button class="menu-dropdown-link border-0 w-100 text-start" @click.prevent="toggleTheme">
                        <Moon v-if="theme === 'light'" :size="18" class="me-3" stroke-width="2" />
                        <Sun v-else :size="18" class="me-3" stroke-width="2" />
                        <span>{{ theme === 'light' ? 'Dark Mode' : 'Light Mode' }}</span>
                    </button>

                    <hr class="my-2 mx-2 border-secondary-subtle" style="opacity: 0.5;">

                    <button class="menu-dropdown-link border-0 w-100 text-start text-danger" @click="openLogoutModal(close)">
                        <LogOut :size="18" class="me-3" stroke-width="2" />
                        <span>Log out</span>
                    </button>
                </div>
            </div>
        </transition>
    </div>

    <BaseModal v-model="showLogoutModal" size="sm" title="Confirm Logout">
        <p class="mb-0">Are you sure you want to log out?</p>
        <template #footer>
            <BaseButton type="button" variant="outline-danger" class="flex-grow-1" @click="showLogoutModal = false" :disabled="isLoggingOut">
                Cancel
            </BaseButton>
            <BaseButton type="button" variant="danger" class="flex-grow-1" @click="handleLogout" :disabled="isLoggingOut">
                <span v-if="isLoggingOut" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
            </BaseButton>
        </template>
    </BaseModal>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth.js';
import { useRouter } from 'vue-router';
import { Settings, LogOut, Sun, Moon } from '@lucide/vue';
import BaseModal from '@/components/base/BaseModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';

const props = defineProps({
    profileRouteName: {
        type: String,
        default: 'dashboard'
    },
    settingsRouteName: {
        type: String,
        default: 'dashboard'
    }
});

const authStore = useAuthStore();
const router = useRouter();
const user = computed(() => authStore.user);

const isOpen = ref(false);
const containerRef = ref(null);

const toggle = () => {
    isOpen.value = !isOpen.value;
};

const close = () => {
    isOpen.value = false;
};

const savedAppearance = JSON.parse(localStorage.getItem('app-Appearance')) || {};
const savedTheme = savedAppearance.theme || localStorage.getItem('app-theme') || 'light';
const theme = ref(savedTheme);

const toggleTheme = () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light';
    theme.value = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    const appAppearance = JSON.parse(localStorage.getItem('app-Appearance')) || {};
    appAppearance.theme = newTheme;
    localStorage.setItem('app-Appearance', JSON.stringify(appAppearance));
    localStorage.setItem('app-theme', newTheme);
    window.dispatchEvent(new Event('theme-changed'));
};

const handleThemeChange = () => {
    const appearance = JSON.parse(localStorage.getItem('app-Appearance')) || {};
    theme.value = appearance.theme || localStorage.getItem('app-theme') || 'light';
};

const handleClickOutside = (event) => {
    if (isOpen.value && containerRef.value && !containerRef.value.contains(event.target)) {
        close();
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('theme-changed', handleThemeChange);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('theme-changed', handleThemeChange);
});

const showLogoutModal = ref(false);
const isLoggingOut = ref(false);

const openLogoutModal = (closeFn) => {
    if (closeFn) closeFn();
    showLogoutModal.value = true;
};

const handleLogout = async () => {
    isLoggingOut.value = true;
    const res = await authStore.logout();
    if (res) {
        showLogoutModal.value = false;
        router.push({ name: 'Home' });
    }
    isLoggingOut.value = false;
};
</script>

<style scoped>
.menu-dropdown {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    background-color: var(--body-bg-color);
    border-radius: var(--border-radius);
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    min-width: 250px;
    z-index: 2000;
    transform-origin: top right;
    box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important;
}

/* Dropdown Animation */
.dropdown-anim-enter-active,
.dropdown-anim-leave-active {
    transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.dropdown-anim-enter-from,
.dropdown-anim-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
}
.dropdown-anim-enter-to,
.dropdown-anim-leave-from {
    opacity: 1;
    transform: scale(1) translateY(0);
}

.dropdown-avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--border-inner-radius);
    overflow: hidden;
    flex-shrink: 0;
    background-color: var(--surface-ground);
}

.dropdown-name {
    font-size: 0.95rem;
    color: var(--text-heading-color);
    line-height: 1.2;
}

.dropdown-email {
    font-size: 0.75rem;
    margin-top: 4px;
}

.dropdown-links-box {
    background-color: var(--surface-ground); /* Inner wrapper: surface-ground */
    border-radius: var(--border-inner-radius);
    padding: 0.5rem; /* p-2 */
    display: flex;
    flex-direction: column;
}

.menu-dropdown-link {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: transparent;
    border-radius: calc(var(--border-inner-radius) - 2px);
    text-decoration: none;
    color: var(--text-heading-color);
    font-size: 0.9rem;
    font-weight: 500;
    letter-spacing: -0.3px;
    transition: background-color 0.2s;
}

.menu-dropdown-link:hover {
    background-color: var(--body-bg-color);
}

.menu-dropdown-link.text-danger {
    color: var(--danger-color) !important;
}

.menu-dropdown-link.text-danger:hover {
    background-color: var(--danger-color);
    color: var(--text-white) !important;
}
</style>
