import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api/api';

export const useSystemStore = defineStore('system', () => {
    const currentEvent = ref(null);
    const isLoading = ref(false);
    const hasLoaded = ref(false);

    const isSeasonOpen = computed(() => {
        if (!currentEvent.value) return false;
        if (currentEvent.value.is_closed) return false;
        
        if (currentEvent.value.end_date) {
            const endDate = new Date(currentEvent.value.end_date);
            const today = new Date();
            // End of the day
            endDate.setHours(23, 59, 59, 999);
            if (today > endDate) {
                return false;
            }
        }
        
        return true;
    });

    const fetchCurrentSeason = async () => {
        if (isLoading.value) return;
        isLoading.value = true;
        try {
            const response = await api.get('/retreat-events/current');
            if (response.data.success) {
                currentEvent.value = response.data.data;
            } else {
                currentEvent.value = null;
            }
            hasLoaded.value = true;
        } catch (error) {
            console.error('Failed to fetch current season:', error);
            currentEvent.value = null;
        } finally {
            isLoading.value = false;
        }
    };

    return {
        currentEvent,
        isLoading,
        hasLoaded,
        isSeasonOpen,
        fetchCurrentSeason
    };
});
