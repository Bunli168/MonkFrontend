<script setup>
import { onMounted, onUnmounted, watch, ref } from 'vue';
import { useRoute } from 'vue-router';
import LandingHeader from './LandingHeader.vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const route = useRoute();
let lenis;

// LandingShell.vue setup
const loaderTextRef = ref(null);
const loaderPath1Ref = ref(null);
const loaderPath2Ref = ref(null);
const loaderPath3Ref = ref(null);
const isIntroDone = ref(false);

watch(() => route.path, () => {
    if (lenis) {
        lenis.scrollTo(0, { immediate: true });
    } else {
        window.scrollTo(0, 0);
    }
});

onMounted(() => {
    document.documentElement.classList.add('hide-landing-scrollbar');
    // ── PREMIUM INTRO ANIMATION ──
    document.body.style.overflow = 'hidden'; 
    
    const tl = gsap.timeline({
        onComplete: () => {
            isIntroDone.value = true;
            window.isIntroDone = true; // Store globally so child components know
            document.body.style.overflow = '';
            window.dispatchEvent(new Event('introComplete'));
        }
    });

    // Initial paths are flat at bottom: "M 0 100 V 0 H 100 V 100 C 85 100 70 100 66 100 C 50 100 40 100 33 100 C 20 100 10 100 0 100 Z"
    const finalFlat = "M 0 0 V 0 H 100 V 0 C 85 0 70 0 66 0 C 50 0 40 0 33 0 C 20 0 10 0 0 0 Z";

    // Layer 1 (Darkest) - Fast wave
    const wave1 = "M 0 0 V 0 H 100 V 0 C 85 40 70 60 66 30 C 50 0 40 80 33 40 C 20 0 10 30 0 0 Z";
    
    // Layer 2 (Medium) - Medium wave
    const wave2 = "M 0 0 V 0 H 100 V 0 C 85 70 70 20 66 50 C 50 90 40 20 33 60 C 20 90 10 50 0 0 Z";
    
    // Layer 3 (Lightest) - Deepest wave
    const wave3 = "M 0 0 V 0 H 100 V 0 C 85 90 70 50 66 80 C 50 40 40 100 33 90 C 20 60 10 90 0 0 Z";

    // 1. Text reveals
    tl.fromTo(loaderTextRef.value, 
        { yPercent: 100 },
        { yPercent: 0, duration: 0.4, ease: "power4.out" }
    )
    // 2. Text slides up
    .to(loaderTextRef.value, 
        { yPercent: -100, opacity: 0, duration: 0.3, ease: "power3.in" },
        "+=0.15" // Short hold
    )
    
    // 3. Liquid Wipe - Morphing waves
    // Layer 3 (Top most layer - Light Hero BG) wipes up first
    .to(loaderPath3Ref.value, { attr: { d: wave3 }, duration: 0.25, ease: "power2.in" }, "-=0.2")
    .to(loaderPath3Ref.value, { attr: { d: finalFlat }, duration: 0.3, ease: "power4.out" })
    
    // Layer 2 (Primary Color)
    .to(loaderPath2Ref.value, { attr: { d: wave2 }, duration: 0.25, ease: "power2.in" }, "-=0.45")
    .to(loaderPath2Ref.value, { attr: { d: finalFlat }, duration: 0.3, ease: "power4.out" }, "-=0.2")
    
    // Layer 1 (Darkest Color)
    .to(loaderPath1Ref.value, { attr: { d: wave1 }, duration: 0.25, ease: "power2.in" }, "-=0.4")
    .to(loaderPath1Ref.value, { attr: { d: finalFlat }, duration: 0.3, ease: "power4.out" }, "-=0.2");

    // ... lenis initialization ...
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    
    window.scrollTo(0, 0);
})

onUnmounted(() => {
    document.documentElement.classList.remove('hide-landing-scrollbar');
    ScrollTrigger.getAll().forEach(t => t.kill());
    if (lenis) {
        lenis.destroy();
        gsap.ticker.remove((time) => lenis.raf(time * 1000));
    }
})
</script>

<style scoped>
.slider-wrapper {
    position: relative;
    width: 100%;
}

/* ── PREMIUM LOADER CSS ── */
.premium-loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 99999;
    display: flex;
    pointer-events: none;
}

.loader-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 99998; 
    transform: scale(1.02); /* Slight scale to prevent edge bleeding */
}

.loader-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100000;
}

.loader-text-mask {
    overflow: hidden;
    padding-bottom: 15px; /* Prevent clipping of letters with descenders like 'g' */
}

.loader-brand {
    font-size: 4rem;
    font-weight: 800;
    color: var(--primary-color);
    margin: 0;
    line-height: 1.2;
    letter-spacing: -1px;
    will-change: transform, opacity;
}

@media (max-width: 768px) {
    .loader-brand {
        font-size: 2.5rem;
    }
}
</style>

<template>
    <div class="landing-shell-container">
        <!-- Premium GSAP Loader -->
        <div class="premium-loader" v-if="!isIntroDone">
            <!-- SVG Dynamic Morphing Background -->
            <svg class="loader-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <!-- Layer 1 (Bottom most, Darkest) -->
                <path ref="loaderPath1Ref" d="M 0 100 V 0 H 100 V 100 C 85 100 70 100 66 100 C 50 100 40 100 33 100 C 20 100 10 100 0 100 Z" fill="var(--primary-color-dark)"></path>
                <!-- Layer 2 (Middle, Primary) -->
                <path ref="loaderPath2Ref" d="M 0 100 V 0 H 100 V 100 C 85 100 70 100 66 100 C 50 100 40 100 33 100 C 20 100 10 100 0 100 Z" fill="var(--primary-color)"></path>
                <!-- Layer 3 (Top most, Hero light background color) -->
                <path ref="loaderPath3Ref" d="M 0 100 V 0 H 100 V 100 C 85 100 70 100 66 100 C 50 100 40 100 33 100 C 20 100 10 100 0 100 Z" fill="var(--card-bg-color)"></path>
            </svg>
            
            <div class="loader-content">
                <div class="loader-text-mask">
                    <h1 ref="loaderTextRef" class="loader-brand">Monk Management</h1>
                </div>
            </div>
        </div>

        <header class="fixed-top" style="z-index: 1030;">
            <LandingHeader />
        </header>
        <div class="container-fluid p-0">
            <main class="content-wrapper slider-wrapper">
                <router-view />
            </main>
            <!-- <footer>
                <LandingFooter />
            </footer> -->
        </div>
    </div>
</template>

<style>
/* Hide the scrollbar only on the landing page layout */
html.hide-landing-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}
html.hide-landing-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
}
</style>