<template>
    <div>
        <Tabs v-model:value="activeTab" scrollable class="card gap-2 p-2"
            style="background-color: var(--surface-ground);">
            <div>
            <TabList>
                    <Tab value="room"
                        :disabled="['room-form', 'room-session-form', 'room-schedule-form'].includes(activeTab)">
                        <div class="d-flex align-items-center gap-2">
                            <School style="color: var(--success-color);" :size="16" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'room'}">All Rooms</span>
                        </div>
                    </Tab>
                    <Tab value="room-planner"
                        :disabled="['room-form', 'room-session-form', 'room-schedule-form'].includes(activeTab)">
                        <div class="d-flex align-items-center gap-2">
                            <CalendarDays style="color: var(--success-color);" :size="16" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'room-planner'}">Planner</span>
                        </div>
                    </Tab>
                    <Tab value="room-schedule"
                        :disabled="['room-form', 'room-session-form', 'room-schedule-form'].includes(activeTab)">
                        <div class="d-flex align-items-center gap-2">
                            <CalendarCheck style="color: var(--success-color);" :size="16" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'room-schedule'}">Events</span>
                        </div>
                    </Tab>
                    <Tab value="room-booking-requests"
                        :disabled="['room-form', 'room-session-form', 'room-schedule-form'].includes(activeTab)">
                        <div class="d-flex align-items-center gap-2">
                            <ClipboardList style="color: var(--warning-color);" :size="16" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'room-booking-requests'}">Booking Requests</span>
                        </div>
                    </Tab>
                    <Tab value="room-form" v-show="activeTab === 'room-form'">
                        <div class="d-flex align-items-center gap-2">
                            <FileSignature style="color: var(--primary-color);" :size="16" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'room-form'}">{{ editingRoom ? 'Edit Room' : 'New Room' }}</span>
                        </div>
                    </Tab>
                    <Tab value="room-session-form" v-show="activeTab === 'room-session-form'">
                        <div class="d-flex align-items-center gap-2">
                            <FileSignature style="color: var(--primary-color);" :size="16" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'room-session-form'}">{{ editingSession ? 'Edit Session' : 'New Session' }}</span>
                        </div>
                    </Tab>
                    <Tab value="room-schedule-form" v-show="activeTab === 'room-schedule-form'">
                        <div class="d-flex align-items-center gap-2">
                            <FileSignature style="color: var(--primary-color);" :size="16" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'room-schedule-form'}">{{ editingSchedule ? 'Edit Event' : 'New Event' }}</span>
                        </div>
                    </Tab>
                    <Tab value="room-detail" v-show="activeTab === 'pagoda-room-detail'">
                        <div class="d-flex align-items-center gap-2">
                            <FileSignature style="color: var(--success-color);" :size="16" />
                            <span :class="{'d-none d-md-inline': activeTab !== 'room-detail'}">Room Details & Images</span>
                        </div>
                    </Tab>
                </TabList>
            </div>
            <TabPanels class="p-0 bg-transparent">
                <TabPanel value="room">
                    <RoomListView v-if="activeTab === 'room'" @new="onNewRoom" @edit="onEditRoom" @details="onViewRoomDetails" />
                </TabPanel>
                <TabPanel value="room-planner">
                    <RoomPlannerView v-if="activeTab === 'room-planner'" @new-session="onNewSession"
                        @edit-session="onEditSession" @new-schedule="onNewSchedule" />
                </TabPanel>
                <TabPanel value="room-schedule">
                    <RoomScheduleView v-if="activeTab === 'room-schedule'" @new="onNewSchedule"
                        @edit="onEditSchedule" />
                </TabPanel>
                <TabPanel value="room-booking-requests">
                    <RoomBookingRequestsView v-if="activeTab === 'room-booking-requests'" />
                </TabPanel>
                <TabPanel value="room-form">
                    <RoomFormView v-if="activeTab === 'room-form'" :initialData="editingRoom"
                        @close="onCloseForm('room')" />
                </TabPanel>
                <TabPanel value="room-session-form">
                    <RoomSessionFormView v-if="activeTab === 'room-session-form'" :initialData="editingSession"
                        @close="onCloseForm('room-planner')" />
                </TabPanel>
                <TabPanel value="room-schedule-form">
                    <RoomScheduleFormView v-if="activeTab === 'room-schedule-form'" :initialData="editingSchedule"
                        @close="onCloseForm('room-planner')" />
                </TabPanel>
                <TabPanel value="room-detail">
                    <AdminRoomDetailsView v-if="activeTab === 'pagoda-room-detail' && selectedRoomId" :roomId="selectedRoomId" @close="onCloseForm('room')" />
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

import RoomListView from './RoomListView.vue';
import RoomPlannerView from './RoomPlannerView.vue';
import RoomScheduleView from './RoomScheduleView.vue';
import RoomFormView from './RoomFormView.vue';
import RoomSessionFormView from './RoomSessionFormView.vue';
import RoomScheduleFormView from './RoomScheduleFormView.vue';
import RoomBookingRequestsView from './RoomBookingRequestsView.vue';
import AdminRoomDetailsView from './AdminRoomDetailsView.vue';

import { Tab, TabList, TabPanels, TabPanel, Tabs } from 'primevue';
import { useRoute, useRouter } from 'vue-router';
import { School, CalendarCheck, FileSignature, CalendarDays, ClipboardList } from '@lucide/vue';

const route = useRoute();
const router = useRouter();

const activeTab = ref('room');
const VALID_TABS = ['room', 'room-planner', 'room-schedule', 'room-booking-requests'];

const editingRoom = ref(null);
const editingSession = ref(null);
const editingSchedule = ref(null);
const selectedRoomId = ref(null);

const onNewRoom = () => {
    editingRoom.value = null;
    activeTab.value = 'room-form';
}
const onEditRoom = (data) => {
    editingRoom.value = data;
    activeTab.value = 'room-form';
}

const onViewRoomDetails = (roomId) => {
    selectedRoomId.value = roomId;
    activeTab.value = 'pagoda-room-detail';
}

const onNewSession = () => {
    editingSession.value = null;
    activeTab.value = 'room-session-form';
}
const onEditSession = (data) => {
    editingSession.value = data;
    activeTab.value = 'room-session-form';
}

const onNewSchedule = () => {
    editingSchedule.value = null;
    activeTab.value = 'room-schedule-form';
}
const onEditSchedule = (data) => {
    editingSchedule.value = data;
    activeTab.value = 'room-schedule-form';
}

const onCloseForm = (tabName) => {
    activeTab.value = tabName;
}

onMounted(() => {
    if (route.query.tab && VALID_TABS.includes(route.query.tab)) {
        activeTab.value = route.query.tab;
    } else if (route.query.tab) {
        router.replace({ query: { ...route.query, tab: activeTab.value } });
    }
});

watch(activeTab, (newTab) => {
    router.replace({ query: { ...route.query, tab: newTab } });
});
</script>
