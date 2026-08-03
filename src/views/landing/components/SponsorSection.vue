<template>
    <section class="sponsor-section">
        <div class="container">
            <div class="section-title mb-3">
                <h2>ប្រវត្តិសង្ខេបនៃវត្តនាគវ័ន</h2>
            </div>

            <div class="sponsor-paragraph-container">
                <p class="sponsor-text" ref="sponsorTextRef">
                    វត្តនាគវ័នគឺជាវត្តអារាមព្រះពុទ្ធសាសនាដ៏ចាស់ទុំ និងមានឈ្មោះបោះសំឡេងមួយក្នុងចំណោមវត្តអារាមសំខាន់ៗក្នុងរាជធានីភ្នំពេញ ដែលមានប្រវត្តិប្រទាក់ក្រឡាគ្នាយ៉ាងជិតស្និទ្ធជាមួយនឹងការអប់រំ និងការជ្រកកោនរបស់សិស្ស-និស្សិតមកពីតាមបណ្តាខេត្ត។ <br><br>

                    វត្តនាគវ័ន ស្ថិតនៅក្នុងសង្កាត់បឹងកក់ទី២ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ (នៅជិតតំបន់បឹងកក់ និងផ្លូវកម្ពុជាក្រោម)។ ដោយសារទីតាំងស្ថិតនៅជិតសាកលវិទ្យាល័យ និងមជ្ឈមណ្ឌលសិក្សាធំៗ វត្តនេះបានដើរតួនាទីយ៉ាងសំខាន់ក្នុងជីវភាពរស់នៅរបស់និស្សិតជាច្រើនទសវត្សរ៍មកនេះ។ <br><br>
                    
                    ជម្រកសម្រាប់សិស្ស-និស្សិតក្រីក្រ៖ វត្តនាគវ័នត្រូវបានគេស្គាល់យ៉ាងច្បាស់ថាជា «ផ្ទះទីពីរ» របស់សិស្ស-និស្សិតប្រុសៗដែលចាកចេញពីស្រុកកំណើតមកបន្តការសិក្សាថ្នាក់ឧត្តមសិក្សានៅភ្នំពេញ។ ព្រះសង្ឃ និងចៅអធិការវត្តគ្រប់ជំនាន់បានផ្តល់កុដិស្នាក់នៅ អាហារ និងការប្រដៅធម៌អាថ៌ដល់និស្សិតរាប់ពាន់នាក់។
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

const sponsorTextRef = ref(null);
let sponsorTL = null;
let hoverHandlers = [];

onMounted(async () => {
    await nextTick();
    const el = sponsorTextRef.value;
    if (!el) return;

    const segmenter = new Intl.Segmenter('km', { granularity: 'word' });

    const walk = (node) => {
        const children = Array.from(node.childNodes);
        children.forEach(child => {
            if (child.nodeType === 3) {
                const text = child.nodeValue;
                if (!text.trim()) return;

                const fragment = document.createDocumentFragment();
                const segments = segmenter.segment(text);
                
                Array.from(segments).forEach(s => {
                    if (!s.segment.trim()) {
                        fragment.appendChild(document.createTextNode(s.segment));
                    } else {
                        const span = document.createElement('span');
                        span.className = 'sponsor-word';
                        span.textContent = s.segment;
                        fragment.appendChild(span);
                    }
                });
                node.replaceChild(fragment, child);
            } else if (child.nodeType === 1) {
                walk(child);
            }
        });
    };

    walk(el);

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
