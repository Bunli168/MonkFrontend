<template>
    <div class="base-table-container">
        <DataTable removableSort resizableColumns columnResizeMode="expand" :value="tableRows" :lazy="true"
            :paginator="true" :totalRecords="totalRecords" :rows="perPage" :first="firstRowIndex" :sortField="sortBy"
            :sortOrder="primeSortOrder" @page="onServerPage" @sort="onServerSort" :rowClass="getRowClass"
            v-model:selection="internalSelection" :dataKey="dataKey" @rowClick="(e) => $emit('row-click', e.data)"
            :paginatorTemplate="dynamicPaginatorTemplate"
            currentPageReportTemplate="{first} to {last} of {totalRecords}" :rowsPerPageOptions="dynamicRowsPerPageOptions"
            :alwaysShow="dynamicRowsPerPageOptions.length > 1">
            <template #empty>
                <div class="empty-state-wrapper py-5 text-center">
                    <i class="bi bi-inbox text-muted display-6 mb-2 d-block"></i>
                    <p class="m-0 text-muted">No records found.</p>
                </div>
            </template>

            <Column v-if="selectable" selectionMode="multiple" headerStyle="width: 3rem"></Column>

            <Column v-if="showIndex" header="No." headerStyle="width: 5rem" :sortable="true" sortField="id">
                <template #body="{ index }">
                    <div v-if="showSkeleton" class="skeleton-cell py-1">
                        <Skeleton width="1.5rem" height="1.25rem" borderRadius="var(--border-radius)" />
                    </div>
                    <div v-else class="cell-content">
                        {{ getRowNumber(index) }}
                    </div>
                </template>
            </Column>

            <Column v-for="(col, idx) in activeColumns" :key="col.field || idx" :field="col.field"
                :sortField="col.sortField || col.field" :header="col.header || col.label || col.field"
                :sortable="col.sortable !== false" :class="col.class" :headerClass="col.headerClass || col.class" :headerStyle="col.headerStyle" :style="col.style">
                <template #body="{ data }">
                    <div v-if="showSkeleton" class="skeleton-cell py-1">
                        <Skeleton width="85%" height="1.25rem" borderRadius="var(--border-radius)" />
                    </div>
                    <div v-else class="cell-content">
                        <slot :name="col.field || 'default'" :data="data" :field="col.field" :value="resolveField(data, col.field)">
                            {{ resolveField(data, col.field) }}
                        </slot>
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { DataTable, Column, Skeleton } from 'primevue';

const resolveField = (data, field) => {
    if (!data || !field) return '';
    if (field.includes('.')) {
        return field.split('.').reduce((obj, key) => (obj ? obj[key] : ''), data);
    }
    return data[field] !== undefined && data[field] !== null ? data[field] : '';
};

const props = defineProps({
    columns: { type: Array, default: () => [] },
    rows: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },

    page: { type: Number, default: 1 },
    perPage: { type: Number, default: 10 },
    totalRecords: { type: Number, default: 0 },

    rowClass: { type: Function, default: null },

    sortBy: { type: String, default: 'id' },
    sortOrder: { type: String, default: 'asc' },

    selectable: { type: Boolean, default: false },
    showIndex: { type: Boolean, default: true },
    dataKey: { type: String, default: 'id' },
    selection: { type: Array, default: () => [] }
});

const emit = defineEmits(['update:page', 'update:perPage', 'update:per-page', 'update:sortBy', 'update:sort-by', 'update:sortOrder', 'update:sort-order', 'refresh-data', 'update:selection', 'row-click']);

const internalSelection = computed({
    get: () => props.selection,
    set: (val) => emit('update:selection', val)
});

const firstRowIndex = computed(() => (props.page - 1) * props.perPage);

const getRowNumber = (index) => {
    if (props.sortOrder === 'desc') {
        return props.totalRecords - firstRowIndex.value - index;
    }
    return firstRowIndex.value + index + 1;
};

const primeSortOrder = computed(() => props.sortOrder === 'desc' ? -1 : 1);

const showSkeleton = computed(() => props.loading);

const tableRows = computed(() => {
    return props.loading ? Array(props.perPage).fill({}) : props.rows;
});

const dynamicRowsPerPageOptions = computed(() => {
    const allOptions = [10, 20, 50, 100];
    const options = [];
    for (const opt of allOptions) {
        options.push(opt);
        if (opt >= props.totalRecords) {
            break;
        }
    }
    return options;
});

const dynamicPaginatorTemplate = computed(() => {
    return "FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink";
});

const triggerRefresh = () => {
    emit('refresh-data', { showLoading: true });
};

const onServerPage = (event) => {
    let changed = false;
    
    if (event.rows !== props.perPage) {
        emit('update:perPage', event.rows);
        emit('update:per-page', event.rows);
        emit('update:page', 1);
        changed = true;
    } else {
        const nextPageNumber = event.page + 1;
        if (nextPageNumber !== props.page) {
            emit('update:page', nextPageNumber);
            changed = true;
        }
    }

    if (changed) {
        triggerRefresh();
    }
};

const onServerSort = (event) => {
    const direction = event.sortOrder === 1 ? 'asc' : 'desc';
    const sortField = event.sortField || 'id';
    
    let changed = false;

    if (sortField !== props.sortBy) {
        emit('update:sortBy', sortField);
        emit('update:sort-by', sortField);
        changed = true;
    }
    
    if (direction !== props.sortOrder) {
        emit('update:sortOrder', direction);
        emit('update:sort-order', direction);
        changed = true;
    }

    if (changed) {
        emit('update:page', 1);
        triggerRefresh();
    }
};

const selectedColumns = ref([...props.columns]);
watch(() => props.columns, (newVal) => {
    selectedColumns.value = [...newVal];
}, { deep: true, immediate: true });

const activeColumns = computed(() => {
    return props.columns.filter(col => selectedColumns.value.some(s => s.field === col.field));
});

const oldRowsMap = ref({});
const previousRowsSnapshot = ref([]);
const rowAnimationState = ref({});
const animationTimeouts = ref({});

const getRowClass = (data) => {
    if (!data) return '';
    
    let cls = '';
    const id = data.id || data._id;
    
    if (rowAnimationState.value[id]) {
        cls += rowAnimationState.value[id] + ' ';
    }
    
    if (props.rowClass) {
        const customClass = props.rowClass(data);
        if (customClass) {
            cls += customClass;
        }
    }
    
    return cls.trim();
};

watch(() => props.rows, async (newRows) => {
    if (!props.loading && newRows && newRows.length > 0) {
        if (previousRowsSnapshot.value.length > 0) {
            newRows.forEach((newRow) => {
                const id = newRow.id || newRow._id;
                if (!id) return;

                const currentJson = JSON.stringify(newRow);
                const oldJson = oldRowsMap.value[id];

                if (oldJson && oldJson !== currentJson) {
                    const oldObj = JSON.parse(oldJson);
                    // Check if there are significant changes beyond just timestamps
                    const isSignificantChange = Object.keys(newRow).some(key => {
                        if (key === 'updatedAt' || key === 'createdAt') return false;
                        return JSON.stringify(newRow[key]) !== JSON.stringify(oldObj[key]);
                    });

                    if (!isSignificantChange) return;

                    // Clear any existing timeouts for this row
                    if (animationTimeouts.value[id]) {
                        clearTimeout(animationTimeouts.value[id].fade);
                        clearTimeout(animationTimeouts.value[id].clear);
                    } else {
                        animationTimeouts.value[id] = {};
                    }

                    // Apply highlight class reactively
                    rowAnimationState.value[id] = 'row-highlight';

                    animationTimeouts.value[id].fade = setTimeout(() => {
                        rowAnimationState.value[id] = 'row-fade-out';

                        animationTimeouts.value[id].clear = setTimeout(() => {
                            if (rowAnimationState.value[id] === 'row-fade-out') {
                                delete rowAnimationState.value[id];
                            }
                        }, 500);
                    }, 400);
                }
            });
        }
        newRows.forEach((newRow) => {
            const id = newRow.id || newRow._id;
            if (id) oldRowsMap.value[id] = JSON.stringify(newRow);
        });

        previousRowsSnapshot.value = JSON.parse(JSON.stringify(newRows));
    }
}, { deep: true, immediate: true });

</script>

<style scoped>
:deep(.p-datatable-paginator-bottom),
:deep(.p-paginator) {
    border: none;
    background-color: var(--body-bg-color);
}

:deep(.p-datatable) {
    border-radius: var(--border-inner-radius) !important;
    overflow: auto;
    width: 100%;
}

.base-table-container {
    overflow-x: auto;
    width: 100%;
    max-width: 100%;
    -webkit-overflow-scrolling: touch;
}

:deep(.p-datatable-wrapper) {
    overflow-x: auto !important;
    width: 100% !important;
    -webkit-overflow-scrolling: touch;
}

:deep(.p-datatable-thead) {
    background-color: transparent !important;
}

:deep(.p-datatable-thead > tr > th) {
    background-color: var(--body-bg-color) !important;
    color: var(--text-base) !important;
    border-color: var(--border-clr) !important;
}

:deep(.p-datatable-column-title) {
    font-weight: 600 !important;
    font-size: 15px !important;
}

:deep(.p-datatable-thead > tr > th.text-center .p-column-header-content) {
    justify-content: center;
}

:deep(.p-datatable-tbody > tr) {
    height: 55px;
    max-height: 55px;
    background-color: transparent;
}

:deep(.p-datatable-tbody > tr > td) {
    padding: 0 1rem !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-base);
    font-size: 14px;
    background-color: var(--body-bg-color) !important;
    border-bottom: 1px solid var(--border-clr);
}

:deep(.p-datatable-tbody > tr:hover > td) {
    background-color: var(--surface-ground) !important;
}

:deep(.p-datatable-tbody > tr.row-highlight > td) {
    background-color: var(--primary-color-soft) !important;
    transition: none !important;
}

:deep(.p-datatable-tbody > tr.row-highlight > td:first-child) {
    box-shadow: inset 2px 0 0 0 var(--primary-color) !important;
}

:deep(.p-datatable-tbody > tr.row-fade-out > td) {
    transition: background-color 0.5s ease-out, box-shadow 0.5s ease-out !important;
}

:deep(.p-datatable-tbody > tr.row-fade-out > td:first-child) {
    box-shadow: inset 0 0 0 0 var(--primary-color) !important;
}

:deep(.p-datatable-tbody > tr[data-p-selected="true"] > td),
:deep(.p-datatable-tbody > tr.p-highlight > td) {
    background-color: var(--primary-color-soft) !important;
}

:deep(.p-skeleton) {
    background-color: var(--surface-ground) !important;
}

:deep(.p-datatable-sort-icon) {
    color: var(--text-label) !important;
    transition: none;
}

:deep(.p-datatable-column-sorted .p-datatable-sort-icon) {
    color: var(--primary-color) !important;
}

.empty-state-wrapper {
    padding: 3rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 0.9rem;
}

.empty-state-wrapper i {
    font-size: 1.75rem;
}
</style>

<style>
.p-datatable-tbody > tr.row-border-primary > td:first-child {
    box-shadow: inset 2px 0 0 0 var(--primary-color) !important;
}
.p-datatable-tbody > tr.row-border-secondary > td:first-child {
    box-shadow: inset 2px 0 0 0 var(--secondary-color) !important;
}
.p-datatable-tbody > tr.row-border-success > td:first-child {
    box-shadow: inset 2px 0 0 0 var(--success-color) !important;
}
.p-datatable-tbody > tr.row-border-danger > td:first-child {
    box-shadow: inset 2px 0 0 0 var(--danger-color) !important;
}
.p-datatable-tbody > tr.row-border-warning > td:first-child {
    box-shadow: inset 2px 0 0 0 var(--warning-color) !important;
}
.p-datatable-tbody > tr.row-border-info > td:first-child {
    box-shadow: inset 2px 0 0 0 var(--info-color) !important;
}
</style>