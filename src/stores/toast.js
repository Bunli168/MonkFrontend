import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
    const toasts = ref([])

    const showToast = (message, type = 'success', duration = 3000) => {
        // Map 'error' to 'danger' for Bootstrap compatibility
        const normalizedType = type === 'error' ? 'danger' : type
        const id = Date.now() + Math.random()
        const toast = { id, message, type: normalizedType, duration, remaining: duration, startTime: Date.now(), timerId: null }
        toasts.value.push(toast)

        if (duration > 0) {
            resumeToast(id)
        }
    }

    const removeToast = (id) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index !== -1) {
            clearTimeout(toasts.value[index].timerId)
            toasts.value.splice(index, 1)
        }
    }

    const pauseToast = (id) => {
        const toast = toasts.value.find(t => t.id === id)
        if (toast && toast.timerId) {
            clearTimeout(toast.timerId)
            toast.timerId = null
            toast.remaining -= (Date.now() - toast.startTime)
        }
    }

    const resumeToast = (id) => {
        const toast = toasts.value.find(t => t.id === id)
        if (toast && toast.remaining > 0 && !toast.timerId) {
            toast.startTime = Date.now()
            toast.timerId = setTimeout(() => {
                removeToast(id)
            }, toast.remaining)
        }
    }

    return { toasts, showToast, removeToast, pauseToast, resumeToast }
})
