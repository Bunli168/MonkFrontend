<template>
    <div class="tnak-overview-view">
        <!-- Banner Section -->
        <div class="row mb-3">
            <div class="col-12">
                <div class="card position-relative overflow-hidden">
                    <div class="position-absolute w-100 h-100" style="top: 0; left: 0; z-index: 0;">
                        <Banner />
                    </div>
                    <div class="card-body d-flex justify-content-between align-items-end position-relative p-4"
                        style="z-index: 2; min-height: 220px;">
                        <div class="d-flex flex-column text-white">
                            <h3 class="fw-bold mb-1 text-white">{{ authStore.user?.name || 'User' }}</h3>
                            <p class="mb-3 text-white-50" style="font-size: 0.95rem;">{{ authStore.user?.email }}</p>
                            <div class="d-flex gap-2 align-items-center">
                                <span class="badge px-3 py-2 text-base" style="letter-spacing: 0.5px; font-weight: 600; border-radius: var(--border-inner-radius); background-color: var(--surface-ground);">
                                    {{ roleLabelKhmer }}
                                </span>
                                <span v-if="authStore.user?.profile?.kut" class="badge px-3 py-2 text-base text-uppercase" style="letter-spacing: 0.5px; font-weight: 600; border-radius: var(--border-inner-radius); background-color: var(--surface-ground);">
                                    កុដិ: {{ authStore.user.profile.kut.name }}
                                </span>
                            </div>
                        </div>
                        <!-- Weather inside banner -->
                        <div class="d-none d-md-block">
                            <div class="card p-3" style="background-color: var(--surface-ground); border-radius: var(--border-inner-radius); min-width: 260px;">
                                <div class="card-body p-0 d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="d-flex align-items-center gap-1 text-muted mb-1" style="font-size: 0.85rem;">
                                            <MapPin :size="14" />
                                            <span>{{ weatherData.location }}</span>
                                        </div>
                                        <div class="fw-bold text-heading" style="font-size: 2rem; line-height: 1;">{{ weatherData.temp }}°</div>
                                        <div class="text-muted mt-2" style="font-size: 0.85rem;">{{ weatherData.description }} • Feels {{ weatherData.feelsLike }}°</div>
                                    </div>
                                    <div class="text-primary ms-4">
                                        <component :is="weatherData.icon" :size="48" stroke-width="1.5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Layout Grid -->
        <div class="row g-3">
            <!-- Left Column: Profile Summary -->
            <div class="col-12 d-flex flex-column gap-3">
                <!-- Profile Summary Section -->
                <div class="card p-3" style="background-color: var(--body-bg-color)">
                    <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3">
                        <div class="d-flex align-items-center gap-2">
                            <div class="rounded p-1 d-flex align-items-center justify-content-center" style="background-color: rgba(40, 167, 69, 0.1); color: var(--success, #28a745);">
                                <User :size="16" />
                            </div>
                            <span class="fw-bold text-heading">My Profile Summary / ព័ត៌មានផ្ទាល់ខ្លួន</span>
                        </div>
                        <router-link :to="{ name: 'pagoda-profile' }" class="btn btn-sm btn-primary d-inline-flex align-items-center gap-2 text-nowrap rounded-pill px-3 py-1 fw-medium shadow-sm" style="font-size: 0.85rem;">
                            <Edit :size="14" />
                            <span>Edit Details</span>
                        </router-link>
                    </div>
                    
                    <div class="row g-3" style="font-size: 0.9rem;">
                        <div class="col-12 col-sm-6">
                            <ul class="list-unstyled mb-0 d-flex flex-column gap-2">
                                <li><strong class="text-secondary">Name:</strong> {{ profileName }}</li>
                                <li><strong class="text-secondary">Email:</strong> {{ authStore.user?.email }}</li>
                                <li v-if="authStore.user?.profile?.phone"><strong class="text-secondary">Phone:</strong> {{ authStore.user.profile.phone }}</li>
                            </ul>
                        </div>
                        <div class="col-12 col-sm-6" v-if="authStore.isMonk && monkSurvey">
                            <ul class="list-unstyled mb-0 d-flex flex-column gap-2">
                                <li><strong class="text-secondary">Ordained Name:</strong> {{ monkSurvey.ordained_name || '-' }}</li>
                                <li><strong class="text-secondary">Preceptor:</strong> {{ monkSurvey.preceptor_name || '-' }}</li>
                                <li><strong class="text-secondary">Wat:</strong> {{ monkSurvey.current_wat || '-' }}</li>
                            </ul>
                        </div>
                        <div class="col-12 col-sm-6" v-else-if="authStore.user?.profile">
                            <ul class="list-unstyled mb-0 d-flex flex-column gap-2">
                                <li v-if="authStore.user.profile.dateOfBirth"><strong class="text-secondary">DOB:</strong> {{ formatDate(authStore.user.profile.dateOfBirth) }}</li>
                                <li v-if="authStore.user.profile.gender"><strong class="text-secondary">Gender:</strong> {{ authStore.user.profile.gender }}</li>
                                <li v-if="authStore.user.profile.university_name"><strong class="text-secondary">University:</strong> {{ authStore.user.profile.university_name }}</li>
                                <li v-if="authStore.user.profile.university_year"><strong class="text-secondary">Year:</strong> {{ authStore.user.profile.university_year }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import Banner from '@/components/Banner.vue';
import api from '@/api/api';
import { formatDate } from '@/utils/dateFormat';
import { MapPin, CloudSun, Sun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning, User, Edit } from '@lucide/vue';

const router = useRouter();
const authStore = useAuthStore();

const monkSurvey = ref(null);
const attendanceSummary = ref(null);

const roleLabelKhmer = computed(() => {
    const roleName = authStore.userRole?.toUpperCase();
    const labels = {
        'SUPERADMIN': 'មេដឹកនាំ',
        'ADMIN': 'មេកុដិ',
        'MONK': 'សាមណេរ',
        'BHIKKHU': 'ភិក្ខុ',
        'STUDENT': 'និស្សិត',
        'MEKUDI': 'មេកុដិ',
    };
    return labels[roleName] || roleName || 'និស្សិត';
});

const profileName = computed(() => {
    const profile = authStore.user?.profile || authStore.user?.UserProfile;
    if (profile) {
        return profile.first_name_kh || profile.last_name_kh
            ? `${profile.last_name_kh || ''} ${profile.first_name_kh || ''}`.trim()
            : `${profile.first_name_en || ''} ${profile.last_name_en || ''}`.trim();
    }
    return authStore.user?.name || '';
});

const loadMonkSurvey = async () => {
    if (authStore.isMonk) {
        try {
            const response = await api.get('/monk-surveys/me');
            if (response.data?.success && response.data.data) {
                monkSurvey.value = response.data.data;
            }
        } catch (error) {
            console.error('Failed to load monk survey in overview:', error);
        }
    }
};

const loadSummary = async () => {
    try {
        const response = await api.get('/attendances/my-summary');
        if (response.data?.success && response.data.data) {
            attendanceSummary.value = response.data.data;
        }
    } catch (error) {
        console.error('Failed to load attendance summary in overview:', error);
    }
};

const weatherData = ref({
    temp: '--',
    feelsLike: '--',
    description: 'Loading...',
    icon: markRaw(CloudSun),
    location: 'Loading...'
});

const fetchWeather = async () => {
    const fetchWithCoords = async (lat, lon, locationName) => {
        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code&timezone=auto`);
            const data = await response.json();
            
            const temp = Math.round(data.current.temperature_2m);
            const feelsLike = Math.round(data.current.apparent_temperature);
            const code = data.current.weather_code;
            
            let desc = 'Clear';
            let icon = Sun;
            
            if (code === 0) { desc = 'Clear sky'; icon = Sun; }
            else if (code === 1 || code === 2 || code === 3) { desc = 'Partly cloudy'; icon = CloudSun; }
            else if (code === 45 || code === 48) { desc = 'Foggy'; icon = CloudFog; }
            else if (code >= 51 && code <= 57) { desc = 'Drizzle'; icon = CloudDrizzle; }
            else if (code >= 61 && code <= 67) { desc = 'Rainy'; icon = CloudRain; }
            else if (code === 71 || code === 73 || code === 75 || code === 77 || code === 85 || code === 86) { desc = 'Snowy'; icon = CloudSnow; }
            else if (code === 80 || code === 81 || code === 82) { desc = 'Showers'; icon = CloudRain; }
            else if (code >= 95) { desc = 'Thunderstorm'; icon = CloudLightning; }
            
            weatherData.value = {
                temp,
                feelsLike,
                description: desc,
                icon: markRaw(icon),
                location: locationName
            };
        } catch (error) {
            console.error('Failed to fetch weather', error);
            weatherData.value.description = 'Failed to load weather';
        }
    };

    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                let locationName = 'Current Location';
                try {
                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    const geoData = await geoRes.json();
                    locationName = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.state || 'Current Location';
                } catch (e) {
                    console.error('Reverse geocoding failed', e);
                }
                fetchWithCoords(lat, lon, locationName);
            },
            (error) => {
                fetchWithCoords(11.5564, 104.9282, 'Phnom Penh');
            },
            { timeout: 5000 }
        );
    } else {
        fetchWithCoords(11.5564, 104.9282, 'Phnom Penh');
    }
};



const currentDate = ref(new Date());
let timer = null;
let weatherInterval = null;

onMounted(async () => {
    timer = setInterval(() => {
        currentDate.value = new Date();
    }, 60000);

    fetchWeather();
    loadMonkSurvey();
    loadSummary();
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
    if (weatherInterval) clearInterval(weatherInterval);
});
</script>
