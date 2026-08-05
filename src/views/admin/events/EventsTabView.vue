<template>
	<div>
		<Tabs v-model:value="activeTab" scrollable class="card gap-2 p-2" style="background-color: var(--surface-ground);">
			<div class="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between border-bottom w-100 gap-3 pb-2">
				<div class="flex-grow-1 overflow-hidden w-100" style="max-width: 100%;">
					<TabList class="border-0">
					<Tab value="ceremony">
						<div class="d-flex align-items-center gap-2">
							<CalendarCheck style="color: var(--success-color);" :size="16" />
							<span :class="{'d-none d-md-inline': activeTab !== 'ceremony'}">Ceremony Events</span>
						</div>
					</Tab>
					<Tab value="assignments" v-if="!isSuperAdmin">
						<div class="d-flex align-items-center gap-2">
							<Users style="color: var(--success-color);" :size="16" />
							<span :class="{'d-none d-md-inline': activeTab !== 'assignments'}">កម្មវិធិបុណ្យធំ</span>
							<Badge v-if="mekudiPendingCount > 0" :value="mekudiPendingCount" severity="danger" size="small" />
						</div>
					</Tab>
					<Tab value="member-responses" v-if="!isSuperAdmin">
						<div class="d-flex align-items-center gap-2">
							<CheckCircle style="color: var(--success-color);" :size="16" />
							<span :class="{'d-none d-md-inline': activeTab !== 'member-responses'}">Member Responses</span>
						</div>
					</Tab>
					<Tab value="stats">
						<div class="d-flex align-items-center gap-2">
							<BarChart style="color: var(--success-color);" :size="16" />
							<span :class="{'d-none d-md-inline': activeTab !== 'stats'}">Monk Stats</span>
						</div>
					</Tab>
					</TabList>
				</div>
				<!-- Teleport target for tab-specific actions (e.g. Create Event) -->
				<div class="d-flex align-items-center flex-wrap gap-2 pe-2 flex-shrink-0 justify-content-start justify-content-lg-end">
					<Calendar 
						v-model="selectedMonth" 
						view="month" 
						dateFormat="mm/yy" 
						placeholder="Filter by Month" 
						showClear 
						style="flex: 1; min-width: 150px; max-width: 200px;"
					/>
					<div id="tab-actions-container" class="d-flex align-items-center gap-2" style="flex: 1; min-width: 120px;"></div>
				</div>
			</div>
			
			<TabPanels class="p-0">
				<TabPanel value="ceremony">
					<CeremonyEventsView :selectedMonth="selectedMonth" />
				</TabPanel>
				<TabPanel value="assignments" v-if="!isSuperAdmin">
					<MekudiEventsView :selectedMonth="selectedMonth" @update-count="mekudiPendingCount = $event" />
				</TabPanel>
				<TabPanel value="member-responses" v-if="!isSuperAdmin">
					<MemberResponsesView :selectedMonth="selectedMonth" />
				</TabPanel>
				<TabPanel value="stats">
					<MonkEventStatsView :selectedMonth="selectedMonth" />
				</TabPanel>
			</TabPanels>
		</Tabs>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import Badge from 'primevue/badge'
import Calendar from 'primevue/calendar'
import { CalendarCheck, Users, BarChart, CheckCircle } from '@lucide/vue'
import CeremonyEventsView from './CeremonyEventsView.vue'
import MekudiEventsView from './MekudiEventsView.vue'
import MemberResponsesView from './MemberResponsesView.vue'
import MonkEventStatsView from './MonkEventStatsView.vue'

const authStore = useAuthStore()
const isSuperAdmin = computed(() => authStore.hasRole(['SuperAdmin', 'SUPERADMIN', 'SUPER_ADMIN']))

// Global filter state for events
const selectedMonth = ref(new Date())
const mekudiPendingCount = ref(0)

// Initialize to the correct tab based on roles
const activeTab = ref(authStore.hasRole(['SuperAdmin', 'ADMIN', 'MEKUDI']) ? 'ceremony' : 'member-responses')
</script>

<style scoped>
/* Inherit standard tab styles */
</style>
