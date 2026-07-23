<template>
    <section class="portfolio-section" @mousemove="handleMouseMove">

        <!-- Dynamic Marquee Divider -->
        <div class="marquee-wrapper" ref="marqueeTriggerRef">
            <div class="marquee-divider" ref="marqueeRef">
                <div class="marquee-track" ref="marqueeTrackRef">
                    <span class="marquee-item" v-for="i in 15" :key="i">
                        SELECTED WORKS <span class="star">✦</span> INNOVATIVE DESIGN <span class="star">✦</span>
                    </span>
                </div>
            </div>
        </div>

        <div class="container" style="margin-top: 4rem;">
            <div class="section-title mb-5">
                <h2>What we have done...</h2>
            </div>

            <!-- Portfolio List Layout -->
            <div class="portfolio-list" ref="portfolioListRef">
                <!-- Header -->
                <div class="portfolio-row header-row">
                    <div class="col-name">Project Name</div>
                    <div class="col-client">Client</div>
                    <div class="col-year">Year</div>
                    <div class="col-category">Services</div>
                    <div class="col-action"></div>
                </div>

                <!-- Project Rows -->
                <div class="portfolio-row project-row" v-for="(project, index) in projects" :key="index"
                    @mouseenter="(e) => setProject(project, e)" @mouseleave="clearProject">
                    <div class="col-name">
                        <div class="project-avatar">
                            {{ project.name.charAt(0) }}
                        </div>
                        <span class="project-title">{{ project.name }}</span>
                        <span v-if="project.isNew" class="badge-new">NEW</span>
                    </div>
                    <div class="col-client">{{ project.client }}</div>
                    <div class="col-year">{{ project.year }}</div>
                    <div class="col-category">{{ project.category }}</div>
                    <div class="col-action">
                    </div>
                </div>
            </div>
        </div>

        <!-- Floating Cursor Image Preview -->
        <div class="cursor-image-preview" ref="cursorPreviewRef">
            <img v-if="activeProject" :src="activeProject.image" alt="Portfolio Preview" loading="lazy" />
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import tnakDigitalMockup from '@/assets/images/mockups/TnakDigital.png';
import eFeedbackMockup from '@/assets/images/mockups/E_Feedback.png';
import blogPostMockup from '@/assets/images/mockups/BlogPost.jpg';
import chouyRokMockup from '@/assets/images/mockups/ChouyRok.png';

const projects = [
    {
        name: "MONK MANAGEMENT SYSTEM",
        client: "ANT",
        year: "2026",
        category: "Web Full Stack",
        image: tnakDigitalMockup,
        isNew: true
    },
    {
        name: "E-FEEDBACK",
        client: "ANT",
        year: "2026",
        category: "Web Frontend",
        image: eFeedbackMockup,
        isNew: false
    },
    {
        name: "BLOG POST",
        client: "ANT",
        year: "2025",
        category: "Web Frontend",
        image: blogPostMockup,
        isNew: false
    },
    {
        name: "CHOUY ROK",
        client: "ANT",
        year: "2025",
        category: "Web Frontend",
        image: chouyRokMockup,
        isNew: false
    }
];

const marqueeTriggerRef = ref(null);
const marqueeRef = ref(null);
const marqueeTrackRef = ref(null);
const cursorPreviewRef = ref(null);
const activeProject = ref(null);
const portfolioListRef = ref(null);

let xTo, yTo;
let fadeOutTween;

let marqueeScrollTrigger = null;
let marqueeTween = null;
let resizeHandler = null;
let projectTL = null;

onMounted(() => {
    // Initialize cursor GSAP effects if ref is available
    if (cursorPreviewRef.value) {
        xTo = gsap.quickTo(cursorPreviewRef.value, "x", { duration: 0.5, ease: "power3" });
        yTo = gsap.quickTo(cursorPreviewRef.value, "y", { duration: 0.5, ease: "power3" });
        gsap.set(cursorPreviewRef.value, { scale: 0.5, opacity: 0 });
    }

    // Setup GSAP marquee using fromTo and ScrollTrigger
    const setupMarquee = () => {
        if (!marqueeTriggerRef.value || !marqueeTrackRef.value) return;

        // kill previous instances if any
        if (marqueeTween) {
            marqueeTween.kill();
            marqueeTween = null;
        }
        if (marqueeScrollTrigger) {
            marqueeScrollTrigger.kill();
            marqueeScrollTrigger = null;
        }

        const track = marqueeTrackRef.value;
        // disable any CSS animation to avoid conflicts
        try { track.style.animation = 'none'; } catch (e) { }

        // Ensure content repeats seamlessly by duplicating children once
        if (!track.dataset.duplicated) {
            try {
                track.innerHTML = track.innerHTML + track.innerHTML;
                track.dataset.duplicated = 'true';
            } catch (e) { }
        }

        // Calculate distance to move: half the scrollWidth (original content width)
        const trackWidth = track.scrollWidth / 2;
        const distance = trackWidth;

        gsap.set(track, { x: 0 });

        // Create a tween that moves the track by `distance`. We'll let ScrollTrigger scrub control progress.
        if (marqueeTween) { marqueeTween.kill(); marqueeTween = null; }
        marqueeTween = gsap.fromTo(track, { x: 0 }, { x: -distance, ease: 'none', force3D: true });

        // Tie the tween to a ScrollTrigger with scrub so scrolling up/down moves the marquee left/right
        marqueeScrollTrigger = ScrollTrigger.create({
            trigger: marqueeTriggerRef.value,
            start: 'top bottom',
            // give enough scroll distance to cover the marquee's travel
            end: () => `+=${Math.max(window.innerHeight, distance * 1.5)}`,
            scrub: 0.5,
            animation: marqueeTween,
            invalidateOnRefresh: true,
        });
    };

    setupMarquee();

    // Recalculate on resize
    resizeHandler = () => {
        if (marqueeTween) { marqueeTween.kill(); marqueeTween = null; }
        if (marqueeScrollTrigger) { marqueeScrollTrigger.kill(); marqueeScrollTrigger = null; }
        setupMarquee();
        // debug info
        try {
            // eslint-disable-next-line no-console
            console.debug('Marquee setup:', { track: marqueeTrackRef.value, trigger: marqueeTriggerRef.value });
        } catch (e) { }
        ScrollTrigger.refresh();
    };

    window.addEventListener('resize', resizeHandler);
    // Fix GSAP ScrollTrigger calculation issue on page refresh
    nextTick(() => {
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 300); // Gives time for fonts/images to layout correctly
    });

    // Setup subtle 'cold' animation for project rows using ScrollTrigger scrub
    const setupProjectAnimation = () => {
        const listEl = portfolioListRef.value;
        if (!listEl) return;

        // select only project rows (exclude header)
        const rows = listEl.querySelectorAll('.project-row');
        if (!rows || rows.length === 0) return;

        if (projectTL) {
            try { projectTL.scrollTrigger && projectTL.scrollTrigger.kill(); } catch (e) { }
            try { projectTL.kill(); } catch (e) { }
            projectTL = null;
        }

        gsap.set(rows, { y: 18, opacity: 0, transformOrigin: 'center' });

        projectTL = gsap.timeline({
            scrollTrigger: {
                trigger: listEl,
                start: 'top 85%',
                end: 'bottom 60%',
                scrub: 0.6,
                invalidateOnRefresh: true,
            }
        });

        projectTL.to(rows, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            stagger: { each: 0.12 }
        });
    };

    // init project animation after DOM paints
    nextTick(() => setupProjectAnimation());
});

onUnmounted(() => {
    if (marqueeTween && typeof marqueeTween.kill === 'function') marqueeTween.kill();
    if (marqueeScrollTrigger && typeof marqueeScrollTrigger.kill === 'function') marqueeScrollTrigger.kill();
    if (projectTL) {
        try { projectTL.scrollTrigger && projectTL.scrollTrigger.kill(); } catch (e) { }
        try { projectTL.kill(); } catch (e) { }
        projectTL = null;
    }
    if (resizeHandler) window.removeEventListener('resize', resizeHandler);
});

const handleMouseMove = (e) => {
    if (activeProject.value && xTo && yTo) {
        xTo(e.clientX - 200);
        yTo(e.clientY - 125);
    }
};

const setProject = (project, e) => {
    if (fadeOutTween) fadeOutTween.kill();

    // Only instantly jump to cursor if the preview is currently hidden.
    // This allows the preview box to glide smoothly when moving quickly between rows.
    if (!activeProject.value && cursorPreviewRef.value) {
        gsap.set(cursorPreviewRef.value, { x: e.clientX - 200, y: e.clientY - 125 });
    }

    activeProject.value = project;

    // Animate the pop-in effect with a premium, smooth ease
    if (cursorPreviewRef.value) {
        gsap.to(cursorPreviewRef.value, {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out", // Removed bouncy 'back' ease for a more premium fluid feel
            overwrite: "auto"
        });
    }
};

const clearProject = () => {
    if (!cursorPreviewRef.value) return;
    
    fadeOutTween = gsap.to(cursorPreviewRef.value, {
        scale: 0.8, // Don't scale down all the way to 0.5, keeps it feeling larger and smoother
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
        overwrite: "auto",
        onComplete: () => {
            activeProject.value = null;
        }
    });
};
</script>

<style scoped>
.portfolio-section {
    background-color: var(--body-bg-color);
    position: relative;
    z-index: 10;
    padding-top: 0;
}

/* Infinite Marquee Styles */
.marquee-wrapper {
    width: 100vw;
    overflow: hidden;
}

.marquee-divider {
    width: 100vw;
    background-color: var(--primary-color);
    padding: 1rem 0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.marquee-track {
    display: flex;
    width: max-content;
}

.marquee-item {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--body-bg-color);
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 2px;
    display: flex;
    align-items: center;
    padding-right: 2rem;
}

.marquee-item .star {
    color: var(--body-bg-color);
    opacity: 0.8;
    margin: 0 1.5rem;
    font-size: 1rem;
}

@keyframes scroll-marquee {
    0% {
        transform: translateX(0);
    }

    100% {
        transform: translateX(-50%);
    }
}

.portfolio-list {
    width: 100%;
    display: flex;
    flex-direction: column;
}

.portfolio-row {
    display: grid;
    grid-template-columns: 2.5fr 1.5fr 1fr 1.5fr 100px;
    align-items: center;
    padding: 24px 12px;
    border-bottom: 2px dotted var(--border-clr);
    transition: background-color 0.3s ease;
}

.header-row {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-color);
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 2px dotted var(--border-clr);
    padding-bottom: 16px;
    pointer-events: none;
}

.project-row {
    cursor: pointer;
    color: var(--text-heading-color);
    font-weight: 500;
    font-size: 1.1rem;
}

.project-row:hover {
    background-color: var(--primary-color-soft);
}

.col-name {
    display: flex;
    align-items: center;
    gap: 16px;
}

.project-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--primary-color-soft);
    color: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.2rem;
}

.project-title {
    position: relative;
    display: inline-block;
    padding-bottom: 2px;
}

.project-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: var(--text-heading-color);
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.3s ease;
}

.project-row:hover .project-title::after {
    transform: scaleX(1);
}

.badge-new {
    font-size: 0.6rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    background-color: var(--primary-color);
    color: #fff;
    margin-left: 8px;
    letter-spacing: 1px;
}

.col-client,
.col-category {
    color: var(--text-color);
}

.view-btn {
    background: transparent;
    border: 1px solid var(--border-clr);
    border-radius: 6px;
    padding: 6px 16px;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-heading-color);
    cursor: pointer;
    transition: all 0.3s ease;
}

.project-row:hover .view-btn {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

/* ── Floating Cursor Preview ── */
.cursor-image-preview {
    position: fixed;
    top: 0;
    left: 0;
    width: 400px;
    height: 250px;
    pointer-events: none;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--card-bg-color);
    border-radius: var(--border-radius);
    overflow: hidden;
    will-change: transform, opacity;
}

.cursor-image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Responsive */
@media (max-width: 991px) {
    .portfolio-row {
        grid-template-columns: 2fr 1fr 1fr 100px;
    }

    .col-category {
        display: none;
    }
}

@media (max-width: 768px) {
    .portfolio-row {
        grid-template-columns: 1fr 100px;
        padding: 16px 8px;
    }

    .col-client,
    .col-year {
        display: none;
    }

    .cursor-image-preview {
        display: none !important;
    }
}
</style>
