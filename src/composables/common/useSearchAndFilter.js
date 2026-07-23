import { ref, watch, onUnmounted } from 'vue';

export function useSearchAndFilter(defaultFilters = {}, onFilterChange = null) {
    const searchQuery = ref('');
    const debouncedSearchQuery = ref('');
    const filters = ref({ ...defaultFilters });
    let searchTimeout = null;

    const clearSearch = () => {
        searchQuery.value = '';
    };

    const triggerChange = () => {
        if (onFilterChange && typeof onFilterChange === 'function') {
            onFilterChange({
                search: debouncedSearchQuery.value,
                ...filters.value
            });
        }
    };

    // Watch for search input and debounce
    watch(searchQuery, (newValue) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        searchTimeout = setTimeout(() => {
            if (debouncedSearchQuery.value !== newValue) {
                debouncedSearchQuery.value = newValue;
                triggerChange();
            }
        }, 500);
    });

    // Watch for other filter changes
    watch(filters, (newFilters, oldFilters) => {
        triggerChange();
    }, { deep: true });

    onUnmounted(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
    });

    return {
        searchQuery,
        debouncedSearchQuery,
        filters,
        clearSearch
    };
}
