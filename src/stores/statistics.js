import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import { handleApiError } from '@/utils/apiError';

export const useStatisticsStore = defineStore('statistics', () => {
    const toastStore = useToastStore();
    
    const adminStats = ref(null);
    const teacherStats = ref(null);
    const studentStats = ref(null);
    const isLoading = ref(false);

    const fetchAdminStats = async () => {
        adminStats.value = {
            totalUsers: 150,
            activeUsers: 142,
            totalRooms: 45,
            activeSurveys: 3,
            pendingReports: 12,
            totalReports: 25,
            totalSurveys: 10
        };
        return adminStats.value;
    };

    const fetchTeacherStats = async () => {
        teacherStats.value = {
            myClasses: 5,
            totalStudents: 120,
            activeSurveys: 2
        };
        return teacherStats.value;
    };

    const fetchStudentStats = async () => {
        studentStats.value = {
            myClasses: 4,
            pendingSurveys: 1,
            completedSurveys: 3
        };
        return studentStats.value;
    };

    return {
        adminStats,
        teacherStats,
        studentStats,
        isLoading,
        fetchAdminStats,
        fetchTeacherStats,
        fetchStudentStats
    };
});
