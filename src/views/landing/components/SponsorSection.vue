<template>
    <section class="sponsor-section" ref="sectionRef">
        <div class="container">
            <div class="section-title mb-3">
                <h2>ប្រវត្តិសង្ខេបនៃវត្តនាគវ័ន</h2>
            </div>

            <div class="sponsor-paragraph-container">
                <p class="sponsor-text">
                    <b>វត្តនាគវ័ន</b> គឺជាវត្តអារាមព្រះពុទ្ធសាសនាដ៏ចាស់ទុំ និងមានឈ្មោះបោះសំឡេងមួយក្នុងចំណោមវត្តអារាមសំខាន់ៗក្នុងរាជធានីភ្នំពេញ ដែលមានប្រវត្តិប្រទាក់ក្រឡាគ្នាយ៉ាងជិតស្និទ្ធជាមួយនឹងការអប់រំ និងការជ្រកកោនរបស់សិស្ស-និស្សិតមកពីតាមបណ្តាខេត្ត។
                </p>
            </div>
            <div class="section-title mb-3 mt-3">
                <h5 class="text-bold fw-bold">អត្ថន័យនៃឈ្មោះ «នាគវ័ន»</h5>
            </div>

            <div class="sponsor-paragraph-container">
                <p class="sponsor-text">
                    ដើមកំណើតពាក្យ៖ ពាក្យ «នាគ» សំដៅលើស្ដេចនាគ ឬសត្វនាគតាមជំនឿបែបពុទ្ធនិយម និងហិណ្ឌូនីយម រីឯពាក្យ «វ័ន» (ក្លាយមកពីពាក្យបាលី/សំស្ក្រឹត «វន») ប្រែថា ព្រៃ។
                    អត្ថន័យរួម៖ «នាគវ័ន» មានន័យចំថា «ព្រៃនាគ» ឬ «ព្រៃនៃសត្វនាគ»។
                 </p>
            </div>
             <div class="section-title mb-3 mt-3">
                <h5 class="text-bold fw-bold">ទីតាំងភូមិសាស្ត្រ</h5>
            </div>
             <div class="sponsor-paragraph-container">
                <p class="sponsor-text">
                    វត្តនាគវ័ន ស្ថិតនៅក្នុងសង្កាត់បឹងកក់ទី២ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ (នៅជិតតំបន់បឹងកក់ និងផ្លូវកម្ពុជាក្រោម)។ ដោយសារទីតាំងស្ថិតនៅជិតសាកលវិទ្យាល័យ និងមជ្ឈមណ្ឌលសិក្សាធំៗ វត្តនេះបានដើរតួនាទីយ៉ាងសំខាន់ក្នុងជីវភាពរស់នៅរបស់និស្សិតជាច្រើនទសវត្សរ៍មកនេះ។
                  </p>
             </div>
          
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sectionRef = ref(null);
let sponsorTLs = [];
let hoverHandlers = [];

onMounted(async () => {
    await nextTick();
    if (!sectionRef.value) return;

    const elements = sectionRef.value.querySelectorAll('.sponsor-text');
    if (!elements.length) return;

    elements.forEach(el => {
        const original = el.innerText.trim();

        const words = original.split(/\s+/).map(w => {
            const safe = w.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<span class="sponsor-word">${safe}</span>`;
        }).join(' ');

        el.innerHTML = words;

        const wordNodes = el.querySelectorAll('.sponsor-word');
        gsap.set(wordNodes, { y: 20, opacity: 0, display: 'inline-block' });

        // Add hover animations (cold effect) on each word
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

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: el,
                start: 'top 95%',
                end: 'bottom 60%',
                toggleActions: 'play none none reverse',
                markers: false,
            }
        });

        tl.to(wordNodes, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            stagger: { each: 0.02 }
        });

        sponsorTLs.push(tl);
    });
});

onUnmounted(() => {
    sponsorTLs.forEach(tl => {
        try { tl.scrollTrigger && tl.scrollTrigger.kill(); } catch (e) { }
        try { tl.kill(); } catch (e) { }
    });
    sponsorTLs = [];
    
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
