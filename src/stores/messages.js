import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/api/api';
import { useToastStore } from './toast';

export const useMessageStore = defineStore('message', () => {
    const messages = ref([]);
    const isLoading = ref(false);
    const toastStore = useToastStore();

    const getInbox = async () => {
        isLoading.value = true;
        try {
            const response = await api.get('/messages/inbox');
            if (response.data?.success) {
                messages.value = response.data.data;
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
            toastStore.showToast('Failed to load messages', 'error');
        } finally {
            isLoading.value = false;
        }
    };

    const markAsRead = async (messageId) => {
        try {
            const response = await api.patch(`/messages/${messageId}/read`);
            if (response.data?.success) {
                const msg = messages.value.find(m => m.id === messageId);
                if (msg && msg.MessageRecipients && msg.MessageRecipients.length > 0) {
                    msg.MessageRecipients[0].is_read = true;
                }
            }
        } catch (error) {
            console.error('Failed to mark message as read:', error);
        }
    };

    return {
        messages,
        isLoading,
        getInbox,
        markAsRead
    };
});
