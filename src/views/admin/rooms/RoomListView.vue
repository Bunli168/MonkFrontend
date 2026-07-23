<template>
    <div class="card" style="background-color: var(--surface-ground);">
        <div class="mb-2 d-flex flex-column flex-xl-row align-items-xl-center gap-2 w-100">
            <div class="flex-grow-1 overflow-auto pb-1 pb-xl-0 d-flex align-items-center gap-2" style="min-width: 0;">
                
                <BaseFilter v-model="activeFilter" :options="filterOptions" style="min-width: max-content;" />
            </div>
            <div class="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 flex-shrink-0">
                <div class="search-input">
                    <BaseInput 
                        v-model="searchAndFilter.searchQuery.value" 
                        placeholder="Search rooms..." 
                        :prefixIcon="Search"
                        clearable
                    />
                </div>
                <BaseButton class="flex-shrink-0 text-nowrap" @click="onCreate()">Add new Room</BaseButton>
            </div>
        </div>
        <BaseTable :columns="colDefs" :rows="roomStore.rooms" :loading="roomStore.isLoading"
            :total-records="roomStore.totalItems" v-model:page="roomStore.page" v-model:per-page="roomStore.perPage"
            v-model:sort-by="roomStore.sortBy" v-model:sort-order="roomStore.sortOrder"
            @refresh-data="roomStore.getAllRooms">
            <template #images="{ data }">
                <div class="d-flex">
                    <Image
                        style="border-radius: var(--border-radius); overflow: hidden; border: 3px solid var(--surface-ground);"
                        v-for="image in data.images" :key="image.id || image.imageUrl" alt="Room Image" height="35"
                        width="35" :src="$authImg(image.imageUrl)" preview lazy="true" />
                    <div v-if="!data?.images?.length"
                        class="d-flex align-items-center justify-content-center text-muted"
                        style="width: 35px; height: 35px; border-radius: var(--border-radius);">
                        <ImageIcon :size="24" :stroke-width="1" />
                    </div>
                </div>
            </template>
            <template #name="{ data }">
                <div class="d-flex flex-column">
                    <span class="text-primary">{{ data?.name }}</span>
                    <span class="small">Capacity : {{ data?.capacity }}</span>
                </div>
            </template>
            <template #building="{ data }">
                <div class="d-flex flex-column">
                    {{ data?.building }}
                    <span class="small">Floor #{{ data.floor }}</span>
                </div>
            </template>
            <template #isActive="{ data }">
                <BaseBadge 
                    :status="data?.isActive ? 'OPENING' : 'CLOSED'" 
                    pill 
                    size="sm" 
                    :loading="togglingStatusId === data.id"
                />
            </template>
            <template #facilities="{ data }">
                <div class="truncate-2-lines">{{ data?.facilities }}</div>
            </template>
            <template #_count="{ data }">
                <div class="d-flex flex-column">
                    <span class="small">Schedules : {{ data?._count?.schedules }}</span>
                    <span class="small">Sessions : {{ data?._count?.sessions }}</span>
                </div>
            </template>
            <template #action="{ data }">
                <BaseActionMenu :items="getActionItems(data)" />
            </template>
        </BaseTable>
    </div>

    <BaseModal v-model="showStatusModal" :title="targetStatusRoom?.isActive ? 'Close Room' : 'Open Room'" size="sm">
        <div class="text-center">
            <div class="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle" 
                 :class="targetStatusRoom?.isActive ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'" 
                 style="width: 60px; height: 60px;">
                <X v-if="targetStatusRoom?.isActive" :size="28" />
                <Check v-else :size="28" />
            </div>
            <p class="mb-4 fw-medium text-muted">
                Are you sure you want to {{ targetStatusRoom?.isActive ? 'close' : 'open' }}
                <strong class="text-base">{{ targetStatusRoom?.name }}</strong>?
            </p>
            <div class="d-flex gap-2">
                <BaseButton :variant="targetStatusRoom?.isActive ? 'outline-danger' : 'outline-success'" type="button" class="flex-grow-1"
                    @click="showStatusModal = false">
                    Cancel
                </BaseButton>
                <BaseButton :variant="targetStatusRoom?.isActive ? 'danger' : 'success'" type="button" class="flex-grow-1" 
                    @click="confirmStatusChange()" :isLoading="togglingStatusId !== null">
                    {{ togglingStatusId !== null ? 'Updating...' : (targetStatusRoom?.isActive ? 'Close Now' : 'Open Now') }}
                </BaseButton>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { useRoomStore } from '@/stores/rooms/room';
import { Pencil, Trash, Image as ImageIcon, Eye, Search, XCircle, CheckCircle, Check, X } from '@lucide/vue';
import Image from 'primevue/image';
import { onMounted, ref, computed } from 'vue';
import { useSearchAndFilter } from '@/composables/common/useSearchAndFilter';

const emit = defineEmits(['new', 'edit', 'details']);
const roomStore = useRoomStore();
const deletingRoomId = ref(null);

const handleFilterChange = async (filters) => {
    roomStore.search = filters.search;
    roomStore.activeFilter = filters.status;
    roomStore.page = 1;
    await roomStore.getAllRooms({ showLoading: true });
};

const searchAndFilter = useSearchAndFilter(
    { 
        status: roomStore.activeFilter || 'all'
    },
    handleFilterChange
);

const activeFilter = computed({
    get: () => searchAndFilter.filters.value.status,
    set: (val) => {
        searchAndFilter.filters.value.status = val;
    }
});

const hasActiveFilters = computed(() => {
    return !!searchAndFilter.searchQuery.value || 
           searchAndFilter.filters.value.status !== 'all';
});

const resetFilters = () => {
    searchAndFilter.searchQuery.value = '';
    searchAndFilter.filters.value.status = 'all';
};

const filterOptions = computed(() => [
    { label: 'All Rooms', value: 'all', badge: roomStore.roomStats?.all || 0 },
    { label: 'Occupied', value: 'occupied', badge: roomStore.roomStats?.occupied || 0 },
    { label: 'Available', value: 'available', badge: roomStore.roomStats?.available || 0 }
]);

const onCreate = () => {
    emit('new');
}

const onUpdate = (data) => {
    emit('edit', data);
}

const onViewDetails = (data) => {
    emit('details', data.id);
}

const togglingStatusId = ref(null);
const showStatusModal = ref(false);
const targetStatusRoom = ref(null);

const confirmStatusChange = async () => {
    if (!targetStatusRoom.value || togglingStatusId.value === targetStatusRoom.value.id) return;

    togglingStatusId.value = targetStatusRoom.value.id;
    const newStatus = !targetStatusRoom.value.isActive;

    const payload = {
        isActive: newStatus
    };

    const result = await roomStore.manageRoomStatus(targetStatusRoom.value.id, payload);

    if (result) {
        targetStatusRoom.value.isActive = newStatus;
        showStatusModal.value = false;
        await roomStore.getAllRooms();
    }

    togglingStatusId.value = null;
    targetStatusRoom.value = null;
};

const onDelete = (roomId) => {
    deletingRoomId.value = roomId;
    handleDelete();
}

const getActionItems = (data) => {
    return [
        {
            label: 'Details',
            icon: Eye,
            command: () => onViewDetails(data),
            iconClass: 'text-info'
        },
        {
            label: data.isActive ? 'Mark as Closed' : 'Mark as Opening',
            icon: data.isActive ? XCircle : CheckCircle,
            command: () => {
                targetStatusRoom.value = data;
                showStatusModal.value = true;
            },
            iconClass: data.isActive ? 'text-danger' : 'text-success'
        },
        {
            label: 'Edit',
            icon: Pencil,
            command: () => onUpdate(data),
            iconClass: 'text-warning'
        },
        {
            label: 'Delete',
            icon: Trash,
            command: () => onDelete(data?.id),
            iconClass: 'text-danger'
        }
    ];
};

const handleDelete = async () => {
    if (!deletingRoomId.value) return;

    await roomStore.deleteRoom(deletingRoomId.value);
    await roomStore.getAllRooms({ showLoading: true });
}

onMounted(async () => {
    roomStore.fetchRoomStats();
    await Promise.all([
        roomStore.getAllRooms({ showLoading: roomStore.rooms.length === 0 }),
        roomStore.getRoomTypes()
    ]);
})

const colDefs = [
    { field: 'images', header: 'Images', sortable: false },
    { field: 'name', header: 'Name' },
    { field: 'building', header: 'Location', sortable: false },
    { field: 'isActive', header: 'Status' },
    { field: 'facilities', header: 'facilities', sortable: false },
    { field: 'type', header: 'type' },
    { field: '_count', header: 'Activity', sortable: false },
    { field: 'action', header: 'Action', sortable: false },
]
</script>
