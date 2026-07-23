import { ref } from 'vue';

export function useFeedbackManager(store, formRefs) {
    const states = ref({});

    const getState = (id) => {
        if (!states.value[id]) {
            states.value[id] = {
                isLoading: false,
                isSubmitting: false,
                isDeleting: false,
                isEditFeedback: true,
                hasRating: false,
                hasFetched: false,
                resolutionId: null,
                ratingData: null
            };
        }
        return states.value[id];
    };

    const togglePanel = async (event, reportId) => {
        if (event.value !== false) return;

        const state = getState(reportId);
        if (state.isLoading || state.hasFetched) return;

        state.isLoading = true;

        const reportDetail = await store.getReportById(reportId);
        if (reportDetail) {
            const ratingData = reportDetail.resolution;
            if (ratingData) {
                state.hasRating = true;
                state.isEditFeedback = false;
                state.resolutionId = ratingData.id;
                state.ratingData = ratingData;
                const formRef = formRefs.value[reportId];
                if (formRef) {
                    formRef.formData.rating = ratingData?.rating || 0;
                    formRef.formData.comment = ratingData?.comment || '';
                }
            } else {
                state.hasRating = false;
                state.isEditFeedback = true;
                state.ratingData = null;
            }
            state.hasFetched = true;
        }
        state.isLoading = false;
    };

    const submit = async (reportId) => {
        const formRef = formRefs.value[reportId];
        if (!formRef) return;

        const state = getState(reportId);
        if (state.isSubmitting) return;

        state.isSubmitting = true;
        try {
            const form = formRef.formData;
            const payload = {
                reportId: reportId,
                rating: form.rating || 0,
                comment: form.comment || ''
            };

            let success = false;

            if (state.hasRating && state.resolutionId) {
                const updatePayload = {
                    rating: form.rating || 0,
                    comment: form.comment || ''
                };
                success = await store.updateFeedbackReport(state.resolutionId, updatePayload);
            } else {
                success = await store.feedbackReport(payload);
            }

            if (success) {
                state.hasFetched = false;
                const reportDetail = await store.getReportById(reportId);
                if (reportDetail && reportDetail.resolution) {
                    state.hasRating = true;
                    state.isEditFeedback = false;
                    state.resolutionId = reportDetail.resolution.id;
                    state.ratingData = reportDetail.resolution;
                    state.hasFetched = true;
                }
            }
        } finally {
            state.isSubmitting = false;
        }
    };

    const deleteFeedback = async (reportId) => {
        const state = getState(reportId);
        if (!state.resolutionId || state.isLoading || state.isDeleting) return;

        state.isLoading = true;
        state.isDeleting = true;
        try {
            const success = await store.deleteFeedbackReport(state.resolutionId);
            if (success) {
                state.hasRating = false;
                state.isEditFeedback = true;
                state.resolutionId = null;
                state.ratingData = null;
                const formRef = formRefs.value[reportId];
                if (formRef) {
                    formRef.formData.rating = 0;
                    formRef.formData.comment = '';
                }
            }
        } finally {
            state.isLoading = false;
            state.isDeleting = false;
        }
    };

    return {
        states,
        getState,
        togglePanel,
        submit,
        delete: deleteFeedback
    };
}
