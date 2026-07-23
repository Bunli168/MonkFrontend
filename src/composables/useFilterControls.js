import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useFilterControls(fetchAction, { search, filters, page, debounce = 300 }) {
    const authStore = useAuthStore();
    let timeout = null

    if (search) {
        watch(search, () => {
            if (!authStore.accessToken) return

            clearTimeout(timeout)
            timeout = setTimeout(() => {
                if (page) page.value = 1
                fetchAction()
            }, debounce)
        })
    }

    if (filters) {
        watch(filters, () => {
            if (!authStore.accessToken) return

            if (page) page.value = 1
            fetchAction()
        }, { deep: true })
    }
}