<style scoped>
.feature-section {
    width: 100vw;
    background-color: var(--body-bg-color);
    position: relative;
    z-index: 10;
    padding-top: 5rem;
    padding-bottom: 5rem;
}

.section-title-split {
    font-size: 2.75rem;
    line-height: 1.2;
    font-weight: 700;
    color: var(--text-heading-color);
    letter-spacing: -1px;
}

.text-gradient {
    background: linear-gradient(90deg, var(--primary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.section-subtitle-split {
    font-size: 1.05rem;
    line-height: 1.6;
    color: var(--text-color);
}

.bento-card {
    background-color: var(--surface-ground);
    border: none;
    border-radius: calc(var(--border-radius) + 8px);
    display: flex;
    flex-direction: column;
    height: 100%;
}

.bento-card-body {
    background-color: var(--body-bg-color);
    border-radius: var(--border-radius);
    padding: 24px;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.bento-icon-box {
    background-color: var(--body-bg-color);
    border: 1px solid var(--border-clr);
    border-radius: var(--border-inner-radius);
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    color: var(--primary-color);
}

.bento-title {
    color: var(--text-heading-color);
    font-size: 1.15rem;
    font-weight: 600;
    margin-bottom: 8px;
    letter-spacing: -0.3px;
}

.bento-desc {
    color: var(--text-base);
    font-size: 0.95rem;
    line-height: 1.6;
}

.large-card {
    padding: 32px 24px;
    flex: 1;
    min-height: 380px;
}

.large-card .bento-desc {
    margin-bottom: 24px;
    font-size: 1.05rem;
}

.mockup-placeholder {
    width: 100%;
    flex: 1;
    min-height: 200px;
    background-color: var(--body-bg-color);
    border: 1px dashed var(--border-clr);
    border-radius: var(--border-inner-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color);
    font-size: 0.9rem;
    margin-top: auto;
}

@media (max-width: 991px) {
    .section-title-split {
        font-size: 2.25rem;
    }
}

@media (max-width: 768px) {
    .section-title-split {
        font-size: 1.85rem;
    }
    .large-card {
        min-height: 300px;
    }
}
</style>

<template>
    <section class="feature-section">
        <div class="feature-wrapper">
            <div class="container-fluid container-lg">
                <!-- Header Split Layout -->
                <div class="row align-items-end mb-4">
                    <div class="col-12 col-lg-6 mb-4 mb-lg-0 text-start">
                        <h2 class="section-title-split m-0">
                            Everything you need,<br>
                            <span style="color: var(--primary-color);">nothing you don't.</span>
                        </h2>
                    </div>
                    <div class="col-12 col-lg-5 ms-auto text-start">
                        <p class="section-subtitle-split m-0">
                            Monk Management System replaces scattered tools with a single, unified educational workspace. Stop switching tabs and start focusing on your students.
                        </p>
                    </div>
                </div>

                <!-- Bento Grid Layout -->
                <div class="row g-lg-4 g-3">
                    <!-- Column 1: Small Cards -->
                    <div class="col-12 col-lg-4 d-flex flex-column gap-lg-4 gap-3">
                        <div v-for="(item, index) in bentoColumns[0]" :key="index" class="bento-card p-2">
                            <div class="bento-card-body">
                                <div class="bento-icon-box">
                                    <component :is="item.icon" :size="22" stroke-width="2" />
                                </div>
                                <h4 class="bento-title">{{ item.title }}</h4>
                                <p class="bento-desc m-0">{{ item.description }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Column 2: Large Cards -->
                    <div class="col-12 col-lg-4 d-flex flex-column gap-lg-4 gap-3">
                        <div v-for="(item, index) in bentoColumns[1]" :key="index" class="bento-card p-2">
                            <div class="bento-card-body large-card text-center p-0">
                                <div class="p-4 flex-grow-1">
                                    <p class="bento-desc text-center m-0" style="max-width: 250px; margin: 0 auto !important;">
                                        {{ item.title }}
                                    </p>
                                </div>
                                <div class="mockup-image-wrapper w-100" style="padding: 0 24px; display: flex; justify-content: center; align-items: flex-end; flex: 1;">
                                    <div class="browser-mock" style="width: 100%; background: var(--surface-card); border: 1px solid var(--border-clr); border-bottom: none; border-radius: 12px 12px 0 0; box-shadow: 0 -8px 24px rgba(0,0,0,0.06); overflow: hidden; display: flex; flex-direction: column;">
                                        <!-- Mini Browser Header -->
                                        <div style="height: 28px; background: var(--body-bg-color); border-bottom: 1px solid var(--border-clr); display: flex; align-items: center; padding: 0 12px; gap: 6px;">
                                            <div style="width: 8px; height: 8px; border-radius: 50%; background: #ff5f56;"></div>
                                            <div style="width: 8px; height: 8px; border-radius: 50%; background: #ffbd2e;"></div>
                                            <div style="width: 8px; height: 8px; border-radius: 50%; background: #27c93f;"></div>
                                        </div>
                                        <img v-if="item.image" :src="item.image" alt="Mockup" style="width: 100%; height: auto; display: block; object-fit: cover; object-position: top; max-height: 250px;" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Column 3: Small Cards -->
                    <div class="col-12 col-lg-4 d-flex flex-column gap-lg-4 gap-3">
                        <div v-for="(item, index) in bentoColumns[2]" :key="index" class="bento-card p-2">
                            <div class="bento-card-body">
                                <div class="bento-icon-box">
                                    <component :is="item.icon" :size="22" stroke-width="2" />
                                </div>
                                <h4 class="bento-title">{{ item.title }}</h4>
                                <p class="bento-desc m-0">{{ item.description }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { Presentation, BarChart3, Users, MonitorSmartphone, Fingerprint, Settings2 } from '@lucide/vue';
import adminDashboardImg from '@/assets/images/mockups/admin-dashboard.png';
import studentSideImg from '@/assets/images/mockups/student-side.png';

const bentoColumns = [
    // Column 1: Small Cards
    [
        {
            icon: Presentation,
            title: 'Kudi Management',
            description: 'Manage room and bed in kudi efficiently. Track room assignment and occupancy.'
        },
        {
            icon: BarChart3,
            title: 'Daily Attendance',
            description: 'Track daily attendance of students and monks. Generate attendance reports securely.'
        },
        {
            icon: Users,
            title: 'Leave Management',
            description: 'Track absences and leaves of students and monks. Generate leave reports securely.'
        }
    ],
    // Column 2: Large Mockup Cards
    [
        {
            title: 'Monitor student progress and platform usage with real-time analytics.',
            image: adminDashboardImg
        },
        {
            title: 'Easily manage student data, enrollments, and academic records in one place.',
            image: studentSideImg
        }
    ],
    // Column 3: Small Cards
    [
        {
            icon: MonitorSmartphone,
            title: 'Multi-Platform Portal',
            description: 'Access dashboards and reports from any device seamlessly.'
        },
        {
            icon: Fingerprint,
            title: 'Role-Based Security',
            description: 'Ensure data privacy with tailored permissions for Kudi chef,Leader, and members.'
        },
        {
            icon: Settings2,
            title: 'Smart Form Validation',
            description: 'Prevent errors with built-in data validation for all educational forms.'
        }
    ]
];
</script>