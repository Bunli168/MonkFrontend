import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/api";
import { useToastStore } from "../toast";

export const useReportCategoryStore = defineStore('reportCategory', () => {
    const reportCategories = ref([]);
    const reportCategory = ref(null);
    const isLoading = ref(false);
    const toast = useToastStore();

    const search = ref('');
    const sortOrder = ref('desc');
    const page = ref(1);
    const totalPages = ref(1);

    const getAllReportCategories = async (options = {}) => {
        try {
            if (options.showLoading !== false && !options.append) isLoading.value = true;
            
            const params = new URLSearchParams({
                search: search.value || '',
                sortDir: sortOrder.value || 'desc',
                page: page.value || 1,
                limit: 12
            });

            const res = await api.get(`/report-categories?${params.toString()}`);
            
            if (options.append) {
                reportCategories.value = [...reportCategories.value, ...res.data.data];
            } else {
                reportCategories.value = res.data.data;
            }
            
            totalPages.value = res.data.pagination?.totalPages || 1;
            
            return res.data.data;
        } catch (error) {
            console.error('Failed to fetch report categories:', error);
            toast.showToast('Failed to fetch categories', 'error');
            return [];
        } finally {
            isLoading.value = false;
        }
    };

    const getReportCategoryById = async (id) => {
        try {
            isLoading.value = true;
            const res = await api.get(`/report-categories/${id}`);
            reportCategory.value = res.data.data;
            return res.data.data;
        } catch (error) {
            console.error('Failed to fetch category:', error);
            toast.showToast('Failed to fetch category', 'error');
            return null;
        } finally {
            isLoading.value = false;
        }
    };

    const createReportCategory = async (data) => {
        try {
            isLoading.value = true;
            const res = await api.post('/report-categories', data);
            toast.showToast('Category created successfully', 'success');
            await getAllReportCategories();
            return res.data;
        } catch (error) {
            console.error('Failed to create category:', error);
            toast.showToast('Failed to create category', 'error');
            return null;
        } finally {
            isLoading.value = false;
        }
    };

    const updateReportCategory = async (id, data) => {
        try {
            isLoading.value = true;
            const res = await api.put(`/report-categories/${id}`, data);
            toast.showToast('Category updated successfully', 'success');
            await getAllReportCategories();
            return res.data;
        } catch (error) {
            console.error('Failed to update category:', error);
            toast.showToast('Failed to update category', 'error');
            return null;
        } finally {
            isLoading.value = false;
        }
    };

    const deleteReportCategory = async (id) => {
        try {
            isLoading.value = true;
            await api.delete(`/report-categories/${id}`);
            toast.showToast('Category deleted successfully', 'success');
            await getAllReportCategories();
            return true;
        } catch (error) {
            console.error('Failed to delete category:', error);
            toast.showToast('Failed to delete category', 'error');
            return false;
        } finally {
            isLoading.value = false;
        }
    };

    return {
        reportCategories,
        reportCategory,
        isLoading,
        search,
        sortOrder,
        page,
        totalPages,
        getAllReportCategories,
        getReportCategoryById,
        createReportCategory,
        updateReportCategory,
        deleteReportCategory
    };
});
