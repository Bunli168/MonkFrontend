import { defineStore } from "pinia";
import { ref } from "vue";

export const useRoomScheduleStore = defineStore('roomSchedule', () => {
    const ownSchedules = ref([]);
    const myBookings = ref([]);
    const myBookingsMeta = ref({ total: 0 });
    const myBookingsPage = ref(1);
    const myBookingsPerPage = ref(10);
    const isLoading = ref(false);

    const getOwnSchedules = async () => {
        // Mock implementation
        ownSchedules.value = [];
        return [];
    };

    const getMyBookings = async () => {
        // Mock implementation
        myBookings.value = [];
        myBookingsMeta.value = { total: 0 };
        return [];
    };

    const setupSocketListeners = () => {
        // Mock implementation - socket listeners would go here
    };

    return {
        ownSchedules,
        myBookings,
        myBookingsMeta,
        myBookingsPage,
        myBookingsPerPage,
        isLoading,
        getOwnSchedules,
        getMyBookings,
        setupSocketListeners
    };
});
