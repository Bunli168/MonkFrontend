<template>
    <section class="sponsor-section">
        <div class="container">
            <div class="section-title mb-3">
                <h2>Supported By</h2>
            </div>

            <div class="sponsor-paragraph-container">
                <p class="sponsor-text" ref="sponsorTextRef">
                    We extend our deepest gratitude to the organizations that provided scholarships and supported our
                    development team in bringing this project to life. We want to give a special thanks to the Ministry
                    of Post and Telecommunications (MPTC) for their unwavering support, the CBRD Fund for providing the
                    crucial scholarships that made this possible, and ANT Training for their exceptional guidance and
                    technical mentorship.
                </p>
            </div>

            <div class="sponsor-grid mt-3">
                <div class="row row-cols-1 row-cols-md-3 g-4 align-items-center justify-content-center">

                    <div class="col">
                        <div class="sponsor-card text-center p-4">
                            <img src="@/assets/images/sponsors/MPTC.png" alt="MPTC Logo"
                                class="img-fluid mb-3 sponsor-logo" loading="lazy" />
                            <h5 class="fw-bold text-heading-color mb-1 d-none">MPTC</h5>
                        </div>
                    </div>

                    <div class="col">
                        <div class="sponsor-card text-center p-4">
                            <img src="@/assets/images/sponsors/CBRD Fund.png" alt="CBRD Fund Logo"
                                class="img-fluid mb-3 sponsor-logo" loading="lazy" />
                            <h5 class="fw-bold text-heading-color mb-1 d-none">CBRD Fund</h5>
                        </div>
                    </div>

                    <div class="col">
                        <div class="sponsor-card text-center p-4">
                            <img src="@/assets/images/sponsors/ANT.png" alt="ANT Logo"
                                class="img-fluid mb-3 sponsor-logo" loading="lazy" />
                            <h5 class="fw-bold text-heading-color mb-1 d-none">ANT</h5>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sponsorTextRef = ref(null);
let sponsorTL = null;
let hoverHandlers = [];

onMounted(async () => {
    await nextTick();
    const el = sponsorTextRef.value;
    if (!el) return;

    const original = el.innerText.trim();

    const words = original.split(/\s+/).map(w => {
        const safe = w.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<span class="sponsor-word">${safe}</span>`;
    }).join(' ');

    el.innerHTML = words;

    const wordNodes = el.querySelectorAll('.sponsor-word');
    gsap.set(wordNodes, { y: 20, opacity: 0, display: 'inline-block' });

    // Add hover animations (cold effect) on each word
    hoverHandlers = [];
    wordNodes.forEach((node) => {
        const enter = () => {
            gsap.killTweensOf(node);
            gsap.to(node, { y: -8, scale: 1.06, color: 'var(--primary-color)', duration: 0.22, ease: 'power2.out' });
        };
        const leave = () => {
            gsap.killTweensOf(node);
            gsap.to(node, { y: 0, scale: 1, color: getComputedStyle(el).color || '', duration: 0.28, ease: 'power2.out' });
        };
        node.addEventListener('mouseenter', enter);
        node.addEventListener('mouseleave', leave);
        hoverHandlers.push({ node, enter, leave });
    });

    sponsorTL = gsap.timeline({
        scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            end: 'bottom 60%',
            toggleActions: 'play none none reverse',
            markers: false,
        }
    });

    sponsorTL.to(wordNodes, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        stagger: { each: 0.02 }
    });
});

onUnmounted(() => {
    if (sponsorTL) {
        try { sponsorTL.scrollTrigger && sponsorTL.scrollTrigger.kill(); } catch (e) { }
        try { sponsorTL.kill(); } catch (e) { }
        sponsorTL = null;
    }
    // remove hover listeners
    try {
        hoverHandlers.forEach(({ node, enter, leave }) => {
            try { node.removeEventListener('mouseenter', enter); } catch (e) { }
            try { node.removeEventListener('mouseleave', leave); } catch (e) { }
        });
        hoverHandlers = [];
    } catch (e) { }
});
</script>

<style scoped>
.sponsor-section {
    background-color: var(--body-bg-color);
    border-top: 1px solid var(--border-clr);
    position: relative;
    z-index: 10;
    padding: 4rem 0;
}

.sponsor-paragraph-container {
    max-width: 1000px;
    margin: 0 auto;
    text-align: center;
}

.sponsor-text {
    font-size: 1.1rem;
    line-height: 1.8;
    color: var(--text-color);
    text-align: justify;
}

.sponsor-card {
    background-color: transparent;
    border-radius: 16px;
    transition: all 0.3s ease;
    cursor: default;
}

.sponsor-card:hover {
    background-color: var(--card-bg);
}

.sponsor-logo {
    max-height: 50px;
    filter: grayscale(100%) opacity(0.5);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.sponsor-card:hover .sponsor-logo {
    filter: grayscale(0%) opacity(1);
}

@media (max-width: 991px) {
    .sponsor-text {
        font-size: 1.05rem;
    }

    .sponsor-logo {
        filter: grayscale(0%) opacity(1);
    }
}

@media (max-width: 768px) {
    .sponsor-text {
        font-size: 1rem;
        line-height: 1.6;
        text-align: left;
    }
}
</style>
