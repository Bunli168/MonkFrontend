<template>
	<div class="card border-0" style="background-color: var(--surface-ground);">
		<div class="mb-3 d-flex flex-wrap justify-content-between gap-3 align-items-center">
			<BaseFilter v-model="filterStatus" :options="filterOptions" :wrap="true" style="flex: 1; min-width: 250px;" />
			<div class="d-flex align-items-center gap-2" style="flex: 1; min-width: 200px; max-width: 100%;">
				<BaseInput v-model="searchQuery" placeholder="Search by name..." :prefixIcon="Search" clearable style="width: 100%; max-width: 300px; margin-left: auto;" />
				<Button @click="loadResponses" class="p-button-rounded p-button-text p-button-secondary" title="Refresh" style="width: 40px; height: 40px; padding: 0;">
					<RefreshCw :size="18" />
				</Button>
			</div>
		</div>
			<BaseTable 
				:columns="colDefs" 
				:rows="paginatedResponses" 
				:totalRecords="filteredResponses.length"
				:loading="loading"
				:show-index="true"
				:page="currentPage"
				:perPage="perPage"
				@update:page="currentPage = $event"
				@update:perPage="perPage = $event"
			>
				<template #monk_name="{ data: row }">
					<div class="d-flex align-items-center">
						<div class="avatar-circle d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 text-white me-2" style="width: 32px; height: 32px; background-color: var(--primary-color);">
							<img v-if="row.User?.UserProfile?.avatar_url" :src="$authImg(row.User.UserProfile.avatar_url)" class="rounded-circle w-100 h-100 object-fit-cover" />
							<i v-else class="pi pi-user" style="font-size: 0.9rem"></i>
						</div>
						<span class="fw-medium">{{ row.User?.UserProfile?.first_name_kh }} {{ row.User?.UserProfile?.last_name_kh }}</span>
					</div>
				</template>
				<template #event_name="{ data: row }">
					{{ row.CeremonyEvent?.title }}
				</template>
				<template #event_date="{ data: row }">
					{{ row.CeremonyEvent?.event_date }}
				</template>
				<template #event_time="{ data: row }">
					{{ row.CeremonyEvent?.event_time }}
				</template>
				<template #status="{ data: row }">
					<Badge 
						:value="row.status || 'ASSIGNED'" 
						:severity="getStatusSeverity(row.status)" 
					/>
				</template>
			</BaseTable>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import CeremonyEventService from '@/services/ceremonyEvent.service'
import { socket } from '@/utils/socket'
import { useToastStore } from '@/stores/toast'

// Base components
import BaseTable from '@/components/base/BaseTable.vue'
import BaseFilter from '@/components/base/BaseFilter.vue'

// PrimeVue components
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import { Search, RefreshCw } from '@lucide/vue'

const props = defineProps({
	selectedMonth: {
		type: Date,
		default: null
	}
})

const searchQuery = ref('')

const toast = useToastStore()

const responses = ref([])
const loading = ref(false)
const isMounted = ref(false)
const filterStatus = ref('ALL')

const filterOptions = computed(() => [
	{ label: 'All', value: 'ALL' },
	{ label: 'Pending', value: 'ASSIGNED' },
	{ label: 'Accepted', value: 'ACCEPTED' },
	{ label: 'Rejected', value: 'REJECTED' }
])

// Table setup
const colDefs = computed(() => [
	{ field: 'monk_name', header: 'Monk Name', sortable: true },
	{ field: 'event_name', header: 'Event Name', sortable: true },
	{ field: 'event_date', header: 'Date', sortable: true },
	{ field: 'event_time', header: 'Time', sortable: true },
	{ field: 'status', header: 'Status', sortable: false }
])

const currentPage = ref(1)
const perPage = ref(10)

const filteredResponses = computed(() => {
	let result = responses.value
	
	if (searchQuery.value) {
		const q = searchQuery.value.toLowerCase()
		result = result.filter(r => 
			(r.monk_name && r.monk_name.toLowerCase().includes(q)) ||
			(r.event_name && r.event_name.toLowerCase().includes(q))
		)
	}

	if (filterStatus.value !== 'ALL') {
		result = result.filter(r => (r.status || 'ASSIGNED') === filterStatus.value)
	}
	
	return result
})

const paginatedResponses = computed(() => {
	const start = (currentPage.value - 1) * perPage.value
	return filteredResponses.value.slice(start, start + perPage.value)
})

const getStatusSeverity = (status) => {
	switch(status) {
		case 'ACCEPTED':
		case 'ATTENDED':
			return 'success'
		case 'REJECTED':
		case 'ABSENT':
			return 'danger'
		default:
			return 'warning' // ASSIGNED
	}
}

const loadResponses = async () => {
	loading.value = true
	try {
		const params = {}
		if (props.selectedMonth) {
			params.month = props.selectedMonth.getMonth() + 1
			params.year = props.selectedMonth.getFullYear()
		}
		const res = await CeremonyEventService.getMemberResponses(params)
		responses.value = res.data.data || []
	} catch (error) {
		toast.showToast('Failed to load member responses', 'error')
	} finally {
		loading.value = false
	}
}

watch(() => props.selectedMonth, () => {
	loadResponses()
})

onMounted(() => {
	isMounted.value = true
	loadResponses()
	socket.on('ceremony_assignment_updated', loadResponses)
})

onUnmounted(() => {
	socket.off('ceremony_assignment_updated', loadResponses)
})
</script>

<style scoped>
.avatar-circle {
	overflow: hidden;
}
</style>
