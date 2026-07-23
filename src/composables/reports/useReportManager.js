import { ref } from 'vue';

export function useReportManager(store, formRef) {
    const editingReport = ref(null);
    const isEdit = ref(false);

    const edit = (data) => {
        if (!data) return;
        isEdit.value = true;
        editingReport.value = data;
    };

    const cancel = () => {
        editingReport.value = null;
        isEdit.value = false;
    };

    const submit = async (validatedPayload = null) => {
        const form = formRef.value;
        if (!form) return false;

        const payload = validatedPayload || await form.validateForm();
        if (!payload) return false;

        let success = false;
        if (isEdit.value) {
            success = await store.updateReport(editingReport.value?.id, payload);
        } else {
            success = await store.createReport(payload);
        }

        if (success !== false) {
            if (typeof form.initForm === 'function') {
                form.initForm();
            }
            cancel();
            return true;
        }
        return false;
    };

    const deleteReport = async (id) => {
        if (!id) return;
        await store.deleteReport(id);
    };

    return {
        editingReport,
        isEdit,
        edit,
        cancel,
        submit,
        delete: deleteReport
    };
}
