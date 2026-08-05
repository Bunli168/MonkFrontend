<template>
	<div class="card p-3" style="background-color: var(--surface-card); border-radius: 8px;">
		<div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
			<h5 class="m-0">Monk Event Statistics</h5>
			<div class="d-flex align-items-center gap-2" style="flex: 1; min-width: 200px; max-width: 100%;">
				<BaseInput v-model="searchQuery" placeholder="Search monks..." :prefixIcon="Search" clearable style="width: 100%; max-width: 300px; margin-left: auto;" />
				<Button @click="loadStats" class="p-button-rounded p-button-text p-button-secondary" title="Refresh" style="width: 40px; height: 40px; padding: 0;">
					<RefreshCw :size="18" />
				</Button>
			</div>
		</div>

		<BaseTable 
			:columns="colDefs" 
			:rows="paginatedStats" 
			:totalRecords="filteredStats.length"
			:loading="loading"
			:show-index="true"
			:page="currentPage"
			:perPage="perPage"
			@update:page="currentPage = $event"
			@update:perPage="perPage = $event"
		>
			<!-- Custom slots if needed -->
			<template #role="{ data: row }">
				<Badge :value="getRoleLabel(row.role)" :severity="row.role === 'Bhikkhu' ? 'success' : 'info'"></Badge>
			</template>
			
			<template #eventCount="{ data: row }">
				<Badge :value="row.eventCount" :severity="row.eventCount > 0 ? 'primary' : 'secondary'" size="large"></Badge>
			</template>
		</BaseTable>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import CeremonyEventService from '@/services/ceremonyEvent.service'
import { socket } from '@/utils/socket'
import { useToastStore } from '@/stores/toast'

import BaseTable from '@/components/base/BaseTable.vue'
import Badge from 'primevue/badge'
import Button from 'primevue/button'

const toast = useToastStore()
const loading = ref(false)
const stats = ref([])
const currentPage = ref(1)

import InputText from 'primevue/inputtext'
import { Search, RefreshCw } from '@lucide/vue'

const props = defineProps({
	selectedMonth: {
		type: Date,
		default: null
	}
})

const searchQuery = ref('')
const perPage = ref(10)

const filteredStats = computed(() => {
	let result = stats.value

	if (searchQuery.value) {
		const q = searchQuery.value.toLowerCase()
		result = result.filter(stat => 
			stat.monk_name?.toLowerCase().includes(q)
		)
	}
	
	return result
})

const paginatedStats = computed(() => {
	const start = (currentPage.value - 1) * perPage.value
	return filteredStats.value.slice(start, start + perPage.value)
})

const colDefs = computed(() => [
	{ field: 'firstName', header: 'First Name', sortable: true },
	{ field: 'lastName', header: 'Last Name', sortable: true },
	{ field: 'role', header: 'Role', sortable: true },
	{ field: 'eventCount', header: 'Events Joined', sortable: true }
])

const getRoleLabel = (roleName) => {
	if (!roleName) return ''
	const lower = roleName.toLowerCase()
	if (lower === 'bhikkhu') return 'ភិក្ខុ'
	if (lower === 'monk') return 'សាមណេរ'
	return roleName
}

const loadStats = async () => {
	loading.value = true
	try {
		const params = {}
		if (props.selectedMonth) {
			params.month = props.selectedMonth.getMonth() + 1
			params.year = props.selectedMonth.getFullYear()
		}
		const res = await CeremonyEventService.getMonkStats(params)
		stats.value = res.data.data
	} catch (error) {
		toast.showToast(error.response?.data?.message || 'Failed to load monk statistics', 'error')
	} finally {
		loading.value = false
	}
}

watch(() => props.selectedMonth, () => {
	loadStats()
})

onMounted(() => {
	loadStats()
	socket.on('ceremony_assignment_updated', loadStats)
})

onUnmounted(() => {
	socket.off('ceremony_assignment_updated', loadStats)
})
</script>

<style scoped>
/* Add any custom styles here */
</style>
