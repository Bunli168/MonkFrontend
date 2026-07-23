import { onMounted, onActivated } from 'vue'

export function useAutoFetch(fetchFn) {
    onMounted(fetchFn)
    onActivated(fetchFn)
}