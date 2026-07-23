import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
    const isExpanded = ref(false)
    const isMobileOpen = ref(false)

    function toggle() {
        isExpanded.value = !isExpanded.value
    }

    function toggleMobile() {
        isMobileOpen.value = !isMobileOpen.value
    }

    function closeMobile() {
        isMobileOpen.value = false
    }

    return { isExpanded, isMobileOpen, toggle, toggleMobile, closeMobile }
})

