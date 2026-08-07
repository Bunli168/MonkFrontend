import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/api";
import { useToastStore } from "../toast";
import { sanitizeId } from "@/utils/security";

export const useReportStore = defineStore('report', () => {
    const reports = ref([]);
    const report = ref(null);
    const isLoading = ref(false);
    const toast = useToastStore();
    
    const search = ref('');
    const sortBy = ref('createdAt');
    const sortOrder = ref('desc');
    const page = ref(1);
    const perPage = ref(12);
    const totalItems = ref(0);
    const categoryId = ref(null);
    const statusFilter = ref(null);
    const statusStats = ref({});
    const reportStatus = ref([]);

    const getAllReports = async (options = {}) => {
        try {
            if (options.showLoading !== false && !options.append) isLoading.value = true;
            
            const params = new URLSearchParams({
                search: search.value || '',
                sortBy: sortBy.value || 'createdAt',
                sortOrder: sortOrder.value || 'desc',
                page: page.value || 1,
                limit: perPage.value || 12
            });

            if (categoryId.value) params.append('category_id', categoryId.value);
            if (statusFilter.value) params.append('status', statusFilter.value);

            const res = await api.get(`/reports?${params.toString()}`);
            
            if (options.append) {
                reports.value = [...reports.value, ...res.data.data];
            } else {
                reports.value = res.data.data;
            }
            
            totalItems.value = res.data.pagination?.totalItems || 0;
            return res.data.data;
        } catch (error) {
            toast.showToast('Failed to fetch reports', 'error');
            return [];
        } finally {
            isLoading.value = false;
        }
    };

    const getReportById = async (id) => {
        try {
            const safeId = sanitizeId(id);
            isLoading.value = true;
            const res = await api.get(`/reports/${safeId}`);
            report.value = res.data.data;
            return res.data.data;
        } catch (error) {
            toast.showToast('Failed to fetch report', 'error');
            return null;
        } finally {
            isLoading.value = false;
        }
    };

    const getReportStatus = async () => {
        try {
            // Assuming this fetches allowed statuses from backend, or we can hardcode
            reportStatus.value = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
            return reportStatus.value;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const fetchStatusStats = async () => {
        try {
            const res = await api.get('/reports/stats');
            statusStats.value = res.data.data || {};
            return statusStats.value;
        } catch {
            return {};
        }
    };

    const updateReportStatus = async (reportId, newStatus) => {
        try {
            const safeId = sanitizeId(reportId);
            const res = await api.patch(`/reports/${safeId}/status`, { status: newStatus });
            toast.showToast('Status updated successfully', 'success');
            const index = reports.value.findIndex(r => r.id === reportId);
            if (index !== -1) reports.value[index].status = newStatus;
            if (report.value && report.value.id === reportId) {
                report.value.status = newStatus;
            }
            return res.data;
        } catch (error) {
            toast.showToast('Failed to update status', 'error');
            return false;
        }
    };

    const setupSocketListeners = () => {
        // Socket listeners configured server-side via auth token
    };

    return {
        reports,
        report,
        isLoading,
        search,
        sortBy,
        sortOrder,
        page,
        perPage,
        totalItems,
        categoryId,
        statusFilter,
        statusStats,
        reportStatus,
        getAllReports,
        getReportById,
        getReportStatus,
        fetchStatusStats,
        updateReportStatus,
        setupSocketListeners
    };
});
