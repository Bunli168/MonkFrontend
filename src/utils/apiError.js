export const handleApiError = (error, toastStore) => {
    const apiMessage = error?.response?.data?.message;
    const thrownMessage = error?.message;

    let finalMessage = '';

    if (apiMessage) {
        finalMessage = apiMessage;
    } else if (thrownMessage) {
        finalMessage = thrownMessage;
    } else {
        finalMessage = 'Connection lost!';
    }

    if (finalMessage && toastStore?.showToast) {
        toastStore.showToast(finalMessage, 'danger');
    }

    return finalMessage;
}