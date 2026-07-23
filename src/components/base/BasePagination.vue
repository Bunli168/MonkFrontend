<template>
    <div class="base-pagination-wrapper" v-if="totalItems > 0">
        <Paginator :first="first" :rows="perPage" :totalRecords="totalItems" @page="onPage"
            :template="dynamicPaginatorTemplate" :rowsPerPageOptions="dynamicRowsPerPageOptions" :alwaysShow="dynamicRowsPerPageOptions.length > 1">
            <template #start>
                <div class="pagination-text text-base small d-none d-sm-block">
                    Showing
                    <span class="fw-semibold">{{ ((currentPage - 1) * perPage) + 1 }}</span>
                    to
                    <span class="fw-semibold">{{ Math.min(currentPage * perPage, totalItems) }}</span>
                    of
                    <span class="fw-semibold">{{ totalItems }}</span>
                </div>
            </template>
        </Paginator>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import Paginator from 'primevue/paginator';

const props = defineProps({
    currentPage: {
        type: Number,
        required: true
    },
    totalPages: {
        type: Number,
        required: true
    },
    totalItems: {
        type: Number,
        required: true,
        default: 0
    },
    perPage: {
        type: Number,
        default: 10
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['page-change', 'update:perPage', 'update:per-page']);

const first = computed(() => (props.currentPage - 1) * props.perPage);

const dynamicRowsPerPageOptions = computed(() => {
    const allOptions = [10, 20, 50, 100];
    const options = [];
    for (const opt of allOptions) {
        options.push(opt);
        if (opt >= props.totalItems) {
            break;
        }
    }
    return options;
});

const dynamicPaginatorTemplate = computed(() => {
    if (dynamicRowsPerPageOptions.value.length <= 1) {
        return "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink";
    }
    return "RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink";
});

const onPage = (event) => {
    if (event.rows !== props.perPage) {
        emit('update:perPage', event.rows);
        emit('update:per-page', event.rows);
        emit('page-change', 1);
    } else {
        emit('page-change', event.page + 1);
    }
};
</script>

<style scoped>
:deep(.p-paginator) {
    background-color: var(--body-bg-color) !important;
    border-radius: var(--border-inner-padding);
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page),
:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last) {
    color: var(--text-heading-color) !important;
    min-width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--border-inner-radius);
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page:not(.p-highlight):hover),
:deep(.p-paginator .p-paginator-first:not(.p-disabled):hover),
:deep(.p-paginator .p-paginator-prev:not(.p-disabled):hover),
:deep(.p-paginator .p-paginator-next:not(.p-disabled):hover),
:deep(.p-paginator .p-paginator-last:not(.p-disabled):hover) {
    background-color: var(--surface-ground) !important;
}

:deep(.p-disabled) {
    opacity: 0.5;
}
</style>
