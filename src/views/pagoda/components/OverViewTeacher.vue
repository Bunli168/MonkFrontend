<template>
    <div class="tnak-overview-view">
        <div class="row g-3 mb-4">
            <div class="col-12">
                <div class="card position-relative overflow-hidden border-0 shadow-sm">
                    <div class="position-absolute w-100 h-100" style="top: 0; left: 0; z-index: 0;">
                        <Banner />
                    </div>

                    <div class="card-body d-flex flex-column justify-content-end position-relative text-white p-4"
                        style="z-index: 2; min-height: 220px;">
                        <h4 class="fw-bold mb-1 text-white">{{ authStore.user?.name }}</h4>
                        <p class="mb-3 text-white-50" style="font-size: 0.95rem;">{{ authStore.user?.email }}</p>
                        <div class="d-flex gap-2 align-items-center">
                            <span class="badge text-white rounded-pill px-3 py-2"
                                style="background-color: var(--primary-color);">
                                {{ authStore.user?.role }}
                            </span>
                            <span v-if="authStore.user?.profile?.kut" class="badge text-white rounded-pill px-3 py-2"
                                style="background-color: rgba(255, 255, 255, 0.25); backdrop-filter: blur(4px);">
                                Kut: {{ authStore.user.profile.kut.name }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12">
                <div class="card bg-transparent border-0 shadow-none">
                    <div class="row g-3">
                        <div class="col-12">
                            <div class="card p-2">
                                <DatePicker inline class="w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <h5 class="fw-bold mb-3">My Today's Events</h5>
        <div class="row g-3">
            <div class="col-lg-6" v-for="schedule in roomScheduleStore.ownSchedules" :key="schedule.id">
                <div class="card d-flex flex-wrap flex-row h-100 gap-2 p-2"
                    style="background-color: var(--surface-ground);">
                    <div class="card flex-fill justify-content-between">
                        <div class="card-body d-flex flex-column" style="background-color: var(--body-bg-color);">
                            <span>{{ schedule.status }}</span>
                            <h3 class="mb-0 mt-auto text-primary fw-bold">{{ schedule.room.name }}</h3>
                        </div>
                    </div>
                    <div class="card flex-fill gap-2 bg-transparent">
                        <div class="card-header bg-transparent d-flex align-items-center justify-content-between">
                            <span class="fw-bold">{{ schedule.session }}</span>
                            <div class="d-flex align-items-center gap-1 small">
                                <span>{{ schedule.startTime }}h</span>
                                <ArrowRight :size="14" />
                                <span>{{ schedule.endTime }}h</span>
                            </div>
                        </div>
                        <div class="card-body" style="background-color: var(--body-bg-color);">
                            <div class="d-flex gap-2 mb-3">
                                <span>{{ schedule.title }}</span>
                                ~
                                <span class="text-success">{{ schedule.subject }}</span>
                            </div>
                            <div class="d-flex align-items-center justify-content-between small">
                                <span class="d-flex align-items-center gap-2">
                                    <School :size="15" />
                                    {{ schedule.room.building }}
                                </span>
                                <span>Floor #{{ schedule.room.floor }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { ArrowRight, School } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth';
import { useRoomScheduleStore } from '@/stores/rooms/roomSchedule';
import { DatePicker } from 'primevue';
import Banner from '@/components/Banner.vue';

const authStore = useAuthStore();
const roomScheduleStore = useRoomScheduleStore();

onMounted(async () => {
    await roomScheduleStore.getOwnSchedules()
});
</script>
