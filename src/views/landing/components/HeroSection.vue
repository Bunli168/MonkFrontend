<style scoped>
.hero-section {
    min-height: 100vh;
    height: auto;
    width: 100%;
    position: relative;
    overflow: visible;
    box-sizing: border-box;
    padding-block: 0;
    margin: 0;
}

.hero-wrapper {
    background: linear-gradient(180deg, color-mix(in srgb, var(--primary-color) 15%, transparent) 0%, transparent 80%);
    background-color: var(--body-bg-color);
    width: 100%;
    min-height: 100vh;
    height: auto;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding-top: 15vh;
    padding-bottom: 8vh;
    box-sizing: border-box;
    transform-origin: bottom center;
}

.hero-section .hero-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    z-index: 10;
}

.hero-section .hero-text h1 {
    font-size: 72px;
    line-height: 86px;
    text-align: center;
}

.hero-section .hero-text h1 span {
    color: var(--primary-color);
}

.hero-mockups-container {
    height: auto;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 32px;
}

.mockup-card {
    width: 50vw;
    max-width: 600px;
    flex-shrink: 0;
    border-radius: 10px;
    overflow: hidden;
    background: var(--surface-card);
    border: 1px solid var(--border-color);
    transition: transform 0.3s ease;
}

.mockup-card:hover {
    transform: translateY(-8px);
}

.browser-header {
    height: 32px;
    background-color: var(--surface-ground);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    padding: 0 12px;
    gap: 6px;
}

.browser-header .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.dot.red {
    background: #ff5f56;
}

.dot.yellow {
    background: #ffbd2e;
}

.dot.green {
    background: #27c93f;
}

.mockup-card img {
    width: 100%;
    height: auto;
    display: block;
}

/* Responsive Design */
@media (max-width: 1200px) {
    .hero-section .hero-text h1 {
        font-size: 64px;
        line-height: 76px;
    }
}

@media (max-width: 991px) {
    .hero-mockups-container {
        gap: 20px;
    }

    .mockup-card {
        width: 65vw;
    }

    .hero-section .hero-text h1 {
        font-size: 56px;
        line-height: 68px;
    }

    .hero-wrapper::before,
    .hero-wrapper::after {
        background-size: 45vw;
        opacity: 0.6;
    }
}

@media (max-width: 768px) {
    .mockup-card {
        width: 80vw;
    }

    .hero-section {
        min-height: 100vh;
        height: auto;
    }

    .hero-wrapper {
        padding-bottom: 0;
    }

    .hero-section .hero-text {
        text-align: center;
        align-items: center;
        justify-content: center;
    }

    .hero-section .hero-text h1 {
        font-size: 42px;
        line-height: 52px;
        padding: 0 15px;
        text-align: center;
    }

    .text-subheading {
        font-size: 16px;
        padding: 0 20px;
        text-align: center;
    }

    .hero-section .hero-text p br,
    .hero-section .hero-text h1 br {
        display: none;
    }

    .browser-wrapper {
        padding: 0;
        margin-top: 30px;
        position: relative;
        flex: 1;
        /* Takes up ALL remaining space below text */
        display: flex;
        justify-content: center;
        align-items: flex-start;
        /* Align to top of available space so it grows down */
        overflow: visible;
    }

    .browser-header {
        display: none;
    }

    .browser-mockup {
        height: 100%;
        /* Fill the entire remaining vertical space */
        width: auto;
        /* Expand width naturally */
        max-height: none;
        max-width: none;
        /* Allow horizontal overflow */
        background-color: transparent;
        box-shadow: none;
        margin: 0 auto;
        border-radius: var(--border-radius) var(--border-radius) 0 0;
        transform: perspective(1200px) rotateX(5deg) translateY(10px) translateZ(0);
        /* Much flatter on mobile */
    }

    .browser-body {
        height: 100%;
        width: 100%;
        background-color: transparent;
        border-radius: var(--border-radius);
    }

    .browser-body :deep(.p-imagecompare),
    .browser-body :deep(.p-imagecompare img) {
        border-radius: var(--border-radius);
    }

    .hero-wrapper::before,
    .hero-wrapper::after {
        opacity: 0.2;
    }
}

@media (max-width: 480px) {
    .hero-section .hero-text h1 {
        font-size: 34px;
        line-height: 42px;
    }
}
</style>

<template>
    <section class="hero-section" ref="heroRef">
        <div class="hero-wrapper" ref="wrapperRef">
            <div class="hero-text" ref="heroTextRef">
                <h1 ref="heroH1Ref">
                    <span>Empowering Schools</span><br>
                    With Seamless Digital Solutions
                </h1>
                <p class="text-subheading" ref="heroSubRef">
                    Streamline your pagoda's workflow with Monk Management System. From real-time student tracking to internal surveys and
                    comprehensive reporting, everything you need in one secure platform.
                </p>
            </div>

            <div ref="mockupsContainerRef" class="hero-mockups-container mt-5">
                <!-- Left Mockup -->
                <div class="mockup-card">
                    <div class="browser-header">
                        <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
                    </div>
                    <img src="@/assets/images/mockups/otp-page.png" class="img-fluid" />
                </div>

                <!-- Center Mockup -->
                <div class="mockup-card">
                    <div class="browser-header">
                        <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
                    </div>
                    <img src="@/assets/images/mockups/admin-dashboard.png" class="img-fluid" />
                </div>

                <!-- Right Mockup -->
                <div class="mockup-card">
                    <div class="browser-header">
                        <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
                    </div>
                    <img src="@/assets/images/mockups/student-side.png" class="img-fluid" />
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ImageCompare from 'primevue/imagecompare';

gsap.registerPlugin(ScrollTrigger);

const heroRef = ref(null);
const wrapperRef = ref(null);
const heroH1Ref = ref(null);
const heroSubRef = ref(null);
const heroTextRef = ref(null);
const mockupsContainerRef = ref(null);
let st;

onMounted(() => {
    // ── Entrance animation (Wait for Intro Loader) ──
    // Set initial hidden states immediately so they don't flash before the loader finishes
    gsap.set(heroH1Ref.value, { y: 60, opacity: 0 });
    gsap.set(heroSubRef.value, { y: 40, opacity: 0 });
    gsap.set(mockupsContainerRef.value, { y: 60, opacity: 0 });

    const playEntrance = () => {
        const entranceTl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Stagger entrance: title → subtitle → browser mockups
        entranceTl
            .to(heroH1Ref.value, {
                y: 0,
                opacity: 1,
                duration: 0.8,
            })
            .to(heroSubRef.value, {
                y: 0,
                opacity: 1,
                duration: 0.6,
            }, "-=0.6")
            .fromTo(mockupsContainerRef.value,
                { y: 60, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8 },
                "-=0.4"
            );
    };

    // Listen for the custom event dispatched by LandingShell, or play immediately if intro already done
    if (window.isIntroDone) {
        playEntrance();
    } else {
        window.addEventListener('introComplete', playEntrance, { once: true });
    }

    // ── Scroll-triggered zoom-out (pinned panel overscroll) ──
    setTimeout(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: heroRef.value,
                start: "bottom bottom",
                end: "+=100%",
                pin: true,
                pinSpacing: false,
                scrub: true
            }
        });

        tl.fromTo(wrapperRef.value,
            { scale: 1, opacity: 1, borderRadius: "0px" },
            { scale: 0.7, opacity: 0.5, borderRadius: "32px", duration: 0.9 },
            0
        )
            .to(wrapperRef.value, { opacity: 0, duration: 0.1 });

        st = tl.scrollTrigger;
    }, 100);
});

onUnmounted(() => {
    if (st) st.kill();
    gsap.killTweensOf([heroH1Ref.value, heroSubRef.value]);
});
</script>