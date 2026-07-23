<style scoped>
.header-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    display: flex;
    justify-content: center;
    padding: 16px 0;
    pointer-events: none;
}

.navbar {
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.navbar-brand {
    margin-right: 0 !important;
}

.navbar-brand h5 {
    font-weight: 800;
    letter-spacing: -1px;
    font-size: 1.5rem;
    color: var(--primary-color) !important;
}

.pill-btn {
    display: inline-flex;
    align-items: center;
    border-radius: var(--border-radius);
    padding: 6px 6px 6px 20px;
    gap: 16px;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
}

.grey-pill {
    background-color: var(--surface-ground);
    color: var(--text-heading-color);
}

.grey-pill:hover {
    background-color: var(--card-bg-color);
}

.white-circle {
    background-color: var(--body-bg-color);
    color: var(--text-heading-color);
}

.black-pill {
    background-color: var(--primary-color);
    color: var(--body-bg-color);
}

.black-pill:hover {
    background-color: color-mix(in srgb, var(--primary-color) 80%, black);
}

.dark-circle {
    background-color: color-mix(in srgb, var(--primary-color) 80%, white);
}

.pill-text {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
    line-height: 2;
}

.pill-icon-circle {
    width: 32px;
    height: 32px;
    border-radius: calc(var(--border-radius) - 6px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.pill-icon-circle img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Dropdown Menu */
.menu-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background-color: var(--surface-ground);
    border-radius: var(--border-radius);
    padding: 12px;
    display: none;
    /* Controlled by GSAP */
    flex-direction: column;
    gap: 4px;
    min-width: 260px;
    z-index: 2000;
    transform-origin: top right;
    pointer-events: auto;
}

.menu-dropdown-link {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    border-radius: var(--border-inner-radius);
    text-decoration: none;
    color: var(--text-heading-color);
    font-size: 20px;
    font-weight: 500;
    letter-spacing: -0.5px;
    transition: background-color 0.2s;
}

.menu-dropdown-link:hover {
    background-color: var(--card-bg-color);
}

.menu-dropdown-link.active {
    background-color: var(--body-bg-color);
}

@media (max-width: 768px) {
    .header-wrapper {
        padding: 12px 0;
    }

    .pill-text {
        display: none;
        /* Hide text on mobile, just show icons */
    }

    .pill-btn {
        padding: 6px;
        gap: 0;
    }
}
</style>

<template>
    <div class="header-wrapper" ref="headerRef">
        <div class="container-fluid container-lg position-relative">
            <nav class="navbar p-0">
                <!-- Brand Logo -->
                <div class="navbar-brand d-flex align-items-center" style="gap: 8px; cursor: pointer;"
                    @click="router.push('/')" ref="brandRef">
                    <Logo style="width: 35px; height: 35px;" class="brand-icon" />
                </div>

                <div class="d-flex align-items-center gap-2 gap-md-3 position-relative">
                    <!-- Profile / Login Pill -->
                    <router-link v-if="authStore.isAuthenticated"
                        :to="{ path: ['student', 'teacher'].includes(authStore.userRole?.toLowerCase()) ? '/tnak' : '/dashboard' }"
                        class="pill-btn grey-pill">
                        <span class="pill-text">{{ authStore.user?.profile?.firstName?.toUpperCase() || 'DASHBOARD'
                            }}</span>
                        <div class="pill-icon-circle white-circle">
                             <img v-if="authStore.user?.profile?.avatarUrl" :src="$authImg(authStore.user.profile.avatarUrl)"
                                alt="Avatar" />
                            <User v-else :size="16" stroke-width="2.5" />
                        </div>
                    </router-link>
                    <router-link v-else :to="{ name: 'login' }" class="pill-btn grey-pill">
                        <span class="pill-text">LOGIN</span>
                        <div class="pill-icon-circle white-circle">
                            <LogIn :size="16" stroke-width="2.5" />
                        </div>
                    </router-link>

                    <!-- Menu Toggle Pill -->
                    <button class="pill-btn black-pill" @click="toggleMenu">
                        <span class="pill-text">{{ isMenuOpen ? 'CLOSE' : 'MENU' }}</span>
                        <div class="pill-icon-circle dark-circle">
                            <MoreVertical v-if="isMenuOpen" :size="16" stroke-width="3" color="white" />
                            <MoreHorizontal v-else :size="16" stroke-width="3" color="white" />
                        </div>
                    </button>

                    <!-- GSAP Dropdown Menu -->
                    <div class="menu-dropdown" ref="menuDropdownRef">
                        <router-link v-for="(item, index) in navItems" :key="index" :to="item.path"
                            class="menu-dropdown-link" active-class="active" @click="toggleMenu">
                            <ArrowRight v-if="route.path === item.path" :size="20" class="me-3" stroke-width="2.5" />
                            <span>{{ item.label }}</span>
                        </router-link>
                    </div>
                </div>
            </nav>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { Home, LogIn, Users, User, MoreHorizontal, MoreVertical, ArrowRight } from '@lucide/vue';
import { useAuthStore } from '@/stores/auth';
import { useRoute, useRouter } from 'vue-router';
import Logo from '@/components/Logo.vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const headerRef = ref(null);
const brandRef = ref(null);
const menuDropdownRef = ref(null);
const isMenuOpen = ref(false);
let st;

onMounted(() => {
    let isHidden = false;

    st = ScrollTrigger.create({
        start: "top top",
        end: "max",
        onUpdate: (self) => {
            if (isMenuOpen.value) return;

            // Hide logo when scrolled past 80% of window height (leaving hero section)
            if (self.scroll() > window.innerHeight * 0.8) {
                if (!isHidden) {
                    isHidden = true;
                    gsap.to(brandRef.value, {
                        opacity: 0,
                        x: -20,
                        duration: 0.3,
                        ease: "power2.out",
                        pointerEvents: "none",
                        overwrite: "auto"
                    });
                }
            } else {
                if (isHidden) {
                    isHidden = false;
                    gsap.to(brandRef.value, {
                        opacity: 1,
                        x: 0,
                        duration: 0.3,
                        ease: "power2.out",
                        pointerEvents: "auto",
                        overwrite: "auto"
                    });
                }
            }
        }
    });
});

onUnmounted(() => {
    if (st) st.kill();
});

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
    if (isMenuOpen.value) {
        // Animate Dropdown In
        gsap.fromTo(menuDropdownRef.value,
            { opacity: 0, scale: 0.9, y: -20, display: 'none' },
            { opacity: 1, scale: 1, y: 0, display: 'flex', duration: 0.3, ease: "back.out(1.2)" }
        );

        // Smoothly animate the Menu Button changing to CLOSE
        gsap.fromTo('.black-pill .pill-text',
            { opacity: 0, x: -10 },
            { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
        );
        gsap.fromTo('.black-pill .pill-icon-circle',
            { rotation: -90, scale: 0.5 },
            { rotation: 0, scale: 1, duration: 0.4, ease: "back.out(2)" }
        );
    } else {
        // Animate Dropdown Out
        gsap.to(menuDropdownRef.value, {
            opacity: 0, scale: 0.9, y: -20, display: 'none', duration: 0.2, ease: "power2.in"
        });

        // Smoothly animate the Close Button changing back to MENU
        gsap.fromTo('.black-pill .pill-text',
            { opacity: 0, x: 10 },
            { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
        );
        gsap.fromTo('.black-pill .pill-icon-circle',
            { rotation: 90, scale: 0.5 },
            { rotation: 0, scale: 1, duration: 0.4, ease: "back.out(2)" }
        );
    }
};

const navItems = computed(() => {
    return [
        { label: 'Home', path: "/", icon: Home },
        { label: 'About Us', path: "/about", icon: Users },
    ]
});
</script>