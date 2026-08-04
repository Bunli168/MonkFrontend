<template>
    <section class="our-profile-section py-5" ref="sectionRef">
        <div class="container">
            <div class="section-title mb-3">
                <h2>Meet the Development Team</h2>
                <p class="text-subheading">
                    We are a passionate group of developers dedicated to building innovative digital solutions.
                    Together, we crafted the ANT Portal to transform the educational experience through intuitive design
                    and robust engineering.
                  
                </p>
            </div>

            <div class="profile-grid-wrapper">
                <div class="profile-grid" ref="gridRef">
                    <div class="profile-card-wrapper" v-for="member in members" :key="member.id">
                        <div class="card p-3 d-flex flex-column border-0" :style="{ 'background-color': member.memberBg }">
                            <div class="card-body position-relative p-0 flex-grow-1" style="overflow: hidden; border-radius: calc(var(--border-radius) - 8px);">
                                <img :src="member.image" alt="Profile Picture" class="w-100 h-100" loading="lazy"
                                    style="object-fit: cover; object-position: top; position: absolute; top: 0; left: 0;">
                                
                                <div class="position-absolute bottom-0 start-0 w-100 p-4 text-center" 
                                    style="background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%);">
                                    <h4 class="mb-0 text-white">{{ member.firstName }} {{ member.lastName }}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Bunli from '@/assets/images/member/Bunli.JPG';


gsap.registerPlugin(ScrollTrigger);

const members = [
    { id: 1, firstName: 'Bunli', lastName: '', top: '16px', image: Bunli, memberBg: '#efe0ff' },
    { id: 2, firstName: 'Bunli', lastName: '', top: '16px', image: Bunli, memberBg: '#efe0ff' },
    { id: 3, firstName: 'Bunli', lastName: '', top: '16px', image: Bunli, memberBg: '#efe0ff' },
    { id: 4, firstName: 'Bunli', lastName: '', top: '16px', image: Bunli, memberBg: '#efe0ff' },
]

const sectionRef = ref(null);
const gridRef = ref(null);
let st;

onMounted(() => {
    // Wait slightly to ensure styles are calculated correctly
    setTimeout(() => {
        const grid = gridRef.value;
        const section = sectionRef.value;

        const getScrollAmount = () => {
            // The total distance to scroll is the grid's full width minus its parent's visible width
            return grid.scrollWidth - grid.parentElement.offsetWidth;
        };

        const tween = gsap.to(grid, {
            x: () => -getScrollAmount(),
            ease: "none" // Linear movement for scrubbing
        });

        st = ScrollTrigger.create({
            trigger: section,
            start: "center center",
            end: () => `+=${getScrollAmount()}`,
            pin: true,
            animation: tween,
            scrub: 1, // Smooth scrub
            invalidateOnRefresh: true, // Recalculate if window resizes
        });
    }, 100);
});

onUnmounted(() => {
    if (st) st.kill();
});
</script>

<style scoped>
.our-profile-section {
    width: 100%;
    background-color: var(--body-bg-color);
    position: relative;
    z-index: 10;
    overflow: hidden;
}

.profile-grid-wrapper {
    width: 100%;
    overflow: hidden;
    /* Hide the overflow from the flex track */
    padding: 2rem 0 4rem 0;
}

.profile-grid {
    display: flex;
    flex-wrap: nowrap;
    gap: 24px;
    width: max-content;
    /* Allow the grid to be as wide as all 6 cards */
    will-change: transform;
}

.profile-card-wrapper {
    /* Make each card take up roughly 1/3 of the container width minus gap */
    width: calc((1320px - 30px - 48px) / 3);
    /* 1320 is max container width, 30 is container padding, 48 is two 24px gaps */
    max-width: 400px;
    min-width: 280px;
}

/* Adjust card width based on screen size so 3, 2, or 1 fits cleanly initially */
@media (max-width: 1399px) {
    .profile-card-wrapper {
        width: calc((1140px - 30px - 48px) / 3);
    }
}

@media (max-width: 1199px) {
    .profile-card-wrapper {
        width: calc((960px - 30px - 48px) / 3);
    }
}

@media (max-width: 991px) {
    .profile-card-wrapper {
        width: calc((720px - 30px - 24px) / 2);
        /* 2 cards visible */
    }
}

@media (max-width: 767px) {
    .profile-card-wrapper {
        width: calc((540px - 30px - 24px) / 2);
    }
}

@media (max-width: 576px) {
    .profile-card-wrapper {
        width: calc(100vw - 30px);
        /* 1 card visible */
    }
}

.card {
    height: 60vh;
    min-height: 400px;
    max-height: 550px;
    border: none;
    border-radius: var(--border-radius);
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-4px);
}

/* Responsive Overrides */
@media (max-width: 991px) {
    .card {
        height: 50vh;
        min-height: 350px;
    }
}

@media (max-width: 576px) {
    .card {
        height: 45vh;
        min-height: 320px;
    }
}
</style>