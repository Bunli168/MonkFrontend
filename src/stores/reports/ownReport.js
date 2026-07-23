import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/api";
import { useToastStore } from "../toast";

export const useOwnReportstore = defineStore('ownReport', () => {
    const ownReports = ref([]);
    const ownReport = ref(null);
    const isLoading = ref(false);
    const toast = useToastStore();

    const search = ref('');
    const sortBy = ref('createdAt');
    const sortOrder = ref('desc');
    const page = ref(1);
    const totalPages = ref(1);
    const statusFilter = ref(null);

    const getOwnReports = async (options = {}) => {
        try {
            if (options.showLoading !== false && !options.append) isLoading.value = true;
            
            const params = new URLSearchParams({
                search: search.value || '',
                sortBy: sortBy.value || 'createdAt',
                sortOrder: sortOrder.value || 'desc',
                page: page.value || 1,
                limit: 12
            });

            if (statusFilter.value) params.append('status', statusFilter.value);

            const res = await api.get(`/reports?${params.toString()}`);
            
            if (options.append) {
                ownReports.value = [...ownReports.value, ...res.data.data];
            } else {
                ownReports.value = res.data.data;
            }
            
            totalPages.value = res.data.pagination?.totalPages || 1;
            return res.data.data;
        } catch (error) {
            console.error('Failed to fetch own reports:', error);
            if (!options.silent) {
                const errMsg = error.response?.data?.message || error.message || 'Unknown error';
                toast.showToast(`Failed to fetch your reports: ${errMsg}`, 'error');
            }
            return [];
        } finally {
            isLoading.value = false;
        }
    };

    const getOwnReportById = async (id) => {
        try {
            isLoading.value = true;
            const res = await api.get(`/reports/${id}`);
            ownReport.value = res.data.data;
            return res.data.data;
        } catch (error) {
            console.error('Failed to fetch own report:', error);
            toast.showToast('Failed to fetch report', 'error');
            return null;
        } finally {
            isLoading.value = false;
        }
    };

    const createReport = async (data) => {
        try {
            isLoading.value = true;
            
            const isFile = (img) => img instanceof File || img instanceof Blob || (img && typeof img === 'object' && img.name && img.size !== undefined);
            const hasFiles = data.images && data.images.some(isFile);
            let payload = data;
            let headers = {};
            
            if (hasFiles) {
                payload = new FormData();
                Object.keys(data).forEach(key => {
                    if (key === 'images') {
                        const existingImages = [];
                        data.images.forEach(img => {
                            if (isFile(img)) {
                                payload.append('images', img);
                            } else {
                                existingImages.push(img);
                            }
                        });
                        if (existingImages.length > 0) {
                            payload.append('images', JSON.stringify(existingImages));
                        }
                    } else if (data[key] !== undefined && data[key] !== null) {
                        payload.append(key, data[key]);
                    }
                });
                headers['Content-Type'] = 'multipart/form-data';
            }
            
            const res = await api.post('/reports', payload, { headers });
            toast.showToast('Report submitted successfully', 'success');
            await getOwnReports();
            return res.data;
        } catch (error) {
            console.error('Failed to submit report:', error);
            toast.showToast('Failed to submit report', 'error');
            return null;
        } finally {
            isLoading.value = false;
        }
    };

    const updateReport = async (id, data) => {
        try {
            isLoading.value = true;
            
            const isFile = (img) => img instanceof File || img instanceof Blob || (img && typeof img === 'object' && img.name && img.size !== undefined);
            const hasFiles = data.images && data.images.some(isFile);
            let payload = data;
            let headers = {};
            
            if (hasFiles) {
                payload = new FormData();
                Object.keys(data).forEach(key => {
                    if (key === 'images') {
                        const existingImages = [];
                        data.images.forEach(img => {
                            if (isFile(img)) {
                                payload.append('images', img);
                            } else {
                                existingImages.push(img);
                            }
                        });
                        if (existingImages.length > 0) {
                            payload.append('images', JSON.stringify(existingImages));
                        }
                    } else if (data[key] !== undefined && data[key] !== null) {
                        payload.append(key, data[key]);
                    }
                });
                headers['Content-Type'] = 'multipart/form-data';
            }
            
            const res = await api.put(`/reports/${id}`, payload, { headers });
            toast.showToast('Report updated successfully', 'success');
            await getOwnReports();
            return res.data;
        } catch (error) {
            console.error('Failed to update report:', error);
            toast.showToast('Failed to update report', 'error');
            return null;
        } finally {
            isLoading.value = false;
        }
    };

    const deleteReport = async (id) => {
        try {
            isLoading.value = true;
            const res = await api.delete(`/reports/${id}`);
            toast.showToast('Report deleted successfully', 'success');
            await getOwnReports();
            return true;
        } catch (error) {
            console.error('Failed to delete report:', error);
            toast.showToast('Failed to delete report', 'error');
            return false;
        } finally {
            isLoading.value = false;
        }
    };

    const setupSocketListeners = () => {
        // Mock socket listener setup
        console.log('Socket listeners set up for own reports');
    };

    return {
        ownReports,
        ownReport,
        isLoading,
        search,
        sortBy,
        sortOrder,
        page,
        totalPages,
        statusFilter,
        getOwnReports,
        getOwnReportById,
        createReport,
        updateReport,
        deleteReport,
        setupSocketListeners
    };
});
