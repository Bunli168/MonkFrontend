import { defineStore } from "pinia";
import { ref } from "vue";

export const useRoomStore = defineStore('room', () => {
    const rooms = ref([]);
    const room = ref(null);
    const isLoading = ref(false);
    
    // Missing state for RoomListView
    const roomStats = ref({ all: 0, occupied: 0, available: 0 });
    const totalItems = ref(0);
    const page = ref(1);
    const perPage = ref(10);
    const sortBy = ref('created_at');
    const sortOrder = ref('DESC');
    const activeFilter = ref('all');

    const getAllRooms = async () => {
        // Mock implementation
        rooms.value = [];
        return [];
    };

    const getRoomById = async (id) => {
        // Mock implementation
        room.value = null;
        return null;
    };

    const fetchRoomStats = async () => {
        // Mock implementation
    };

    const getRoomTypes = async () => {
        // Mock implementation
        return [];
    };

    const deleteRoom = async (id) => {
        // Mock implementation
    };

    return {
        rooms,
        room,
        isLoading,
        roomStats,
        totalItems,
        page,
        perPage,
        sortBy,
        sortOrder,
        activeFilter,
        getAllRooms,
        getRoomById,
        fetchRoomStats,
        getRoomTypes,
        deleteRoom
    };
});
