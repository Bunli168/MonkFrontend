<template>
	<div class="card border-0" style="background-color: var(--surface-ground);">
		<Teleport to="#tab-actions-container" v-if="isMounted">
			<Button label="Create Event" icon="pi pi-plus" @click="openCreateModal" style="white-space: nowrap; color: white !important;" />
		</Teleport>
		
		<div class="mb-3 d-flex flex-wrap flex-lg-nowrap align-items-center justify-content-between gap-2 w-100" v-if="isSuperAdmin">
			<!-- Left Side: Filters -->
			<div class="d-flex align-items-center w-100 w-lg-auto">
				<BaseFilter v-model="filterStatus" :options="filterOptions" :wrap="true" />
			</div>
			
			<!-- Right Side: Search & Buttons -->
			<div class="d-flex flex-wrap flex-md-nowrap align-items-center gap-2 justify-content-end w-100 w-lg-auto">
				<div class="search-input">
					<BaseInput v-model="searchQuery" placeholder="Search events..." :prefixIcon="Search" clearable />
				</div>
				<Button @click="loadEvents" class="p-button-rounded p-button-text p-button-secondary flex-shrink-0" title="Refresh" style="width: 40px; height: 40px; padding: 0;">
					<RefreshCw :size="18" />
				</Button>
			</div>
		</div>
			<BaseTable 
				:columns="colDefs" 
				:rows="paginatedEvents" 
				:totalRecords="filteredEvents.length"
				:loading="loading"
				:show-index="true"
				:page="currentPage"
				:perPage="perPage"
				@update:page="currentPage = $event"
				@update:perPage="perPage = $event"
			>
				<template #title="{ data: row }">
					{{ row.title }}
				</template>
				<template #event_date="{ data: row }">
					{{ row.event_date }}
				</template>
				<template #event_time="{ data: row }">
					{{ row.event_time }}
				</template>
				<template #status="{ data: row }">
					<Badge :value="row.KutTargets?.length > 0 ? 'Targeted' : 'Internal'" severity="info"></Badge>
				</template>
				<template #actions="{ data: row }">
					<BaseActionMenu :items="getActionItems(row)" />
				</template>
			</BaseTable>

		<!-- Create/Edit Event Modal -->
		<Dialog v-model:visible="showCreateModal" :header="editingEventId ? 'Edit Ceremony Event' : 'Create Ceremony Event'" :style="{width: '90vw', maxWidth: '600px'}" :modal="true">
			<div class="d-flex flex-column gap-3">
				<div class="field">
					<label for="title" class="fw-bold">Title (ឈ្មោះកម្មវិធី)</label>
					<InputText id="title" v-model="form.title" class="w-100" />
				</div>
				<div class="field">
					<label for="description" class="fw-bold">Description</label>
					<Textarea id="description" v-model="form.description" rows="3" class="w-100" />
				</div>
				<div class="d-flex gap-3">
					<div class="field flex-grow-1">
						<BaseDatePicker id="date" v-model="form.event_date" label="Date (ថ្ងៃខែឆ្នាំ)" class="w-100" />
					</div>
					<div class="field flex-grow-1">
						<BaseDatePicker id="time" v-model="form.event_time" timeOnly label="Time (ម៉ោង)" class="w-100" />
					</div>
				</div>

				<div class="field mt-3" v-if="isSuperAdmin">
					<label class="fw-bold">Target Kudis (កុដិដែលត្រូវនិមន្ត)</label>
					<MultiSelect 
						v-model="form.selectedKuts" 
						:options="kuts" 
						optionLabel="name" 
						optionValue="id" 
						placeholder="Select Kudis to invite" 
						:filter="true" 
						display="chip" 
						class="w-100 mt-2"
						@change="onSelectedKutsChange"
					/>
				</div>

				<!-- Editable Targets Table -->
				<div class="mt-2" v-if="isSuperAdmin">
					<DataTable :value="form.targets" class="p-datatable-sm shadow-sm rounded" style="border: 1px solid var(--border-color, rgba(0,0,0,0.1));">
						<Column header="Kudi">
							<template #body="{ data }">
								<span class="fw-medium">Kudi {{ data.name }}</span>
							</template>
						</Column>
						<Column header="Requested Monks">
							<template #body="{ data }">
								<InputNumber v-model="data.count" :min="1" :max="50" class="p-inputtext-sm w-100" style="max-width: 120px;" />
							</template>
						</Column>
						<Column header="Status" v-if="editingEventId">
							<template #body="{ data }">
								<Badge v-if="data.status !== 'NEW'" :value="data.status" :severity="data.status === 'FULFILLED' ? 'success' : 'warning'" />
								<Badge v-else value="NEW" severity="info" />
							</template>
						</Column>
						<Column header="" bodyStyle="text-align: right">
							<template #body="{ data }">
								<Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger p-button-sm" @click="removeTarget(data.kut_id)" />
							</template>
						</Column>
					</DataTable>
				</div>

				<div class="field mt-3" v-if="!isSuperAdmin">
					<label class="fw-bold">Select Monks from your Kudi</label>
					<MultiSelect 
						v-model="form.selected_monk_ids" 
						:options="sortedKudiMembers" 
						optionLabel="fullName" 
						optionValue="id" 
						dataKey="id"
						placeholder="Select Monks" 
						class="w-100 mt-2" 
						display="chip" 
						filter 
						filterPlaceholder="Search by name..."
						:filterFields="['fullName']"
					>
						<template #option="slotProps">
							<div class="d-flex align-items-center">
								<span>{{ slotProps.option.firstName }} {{ slotProps.option.lastName }}</span>
								<span class="text-muted ms-2" style="font-size: 0.85em;">({{ getRoleLabel(slotProps.option.role?.name) }})</span>
							</div>
						</template>
					</MultiSelect>
					<div v-if="kudiMembers.length === 0" class="text-muted fst-italic mt-2">No monks found in your Kudi.</div>
				</div>



			</div>
			<template #footer>
				<Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showCreateModal = false" />
				<Button :label="editingEventId ? 'Update Event' : 'Save Event'" icon="pi pi-check" @click="submitEvent" :loading="loading" />
			</template>
		</Dialog>

	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import CeremonyEventService from '@/services/ceremonyEvent.service'
import { socket } from '@/utils/socket'
import api from '@/api/api'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'
import Checkbox from 'primevue/checkbox'

// Base components
import BaseTable from '@/components/base/BaseTable.vue'
import BaseActionMenu from '@/components/base/BaseActionMenu.vue'
import BaseDatePicker from '@/components/base/BaseDatePicker.vue'
import BaseFilter from '@/components/base/BaseFilter.vue'

// Icons
import { Pencil, Trash2, Search, RefreshCw } from '@lucide/vue'

// PrimeVue components
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Badge from 'primevue/badge'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import MultiSelect from 'primevue/multiselect'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'

const isMounted = ref(false)

const props = defineProps({
	selectedMonth: {
		type: Date,
		default: null
	}
})

const searchQuery = ref('')

const toast = useToastStore()
const authStore = useAuthStore()
const events = ref([])
const kuts = ref([])
const kudiMembers = ref([])
const showCreateModal = ref(false)
const selectedEvent = ref(null)
const loading = ref(false)
const isSuperAdmin = computed(() => authStore.hasRole(['SuperAdmin']))

const colDefs = computed(() => {
	const cols = [
		{ field: 'title', header: 'Event Name', sortable: true },
		{ field: 'event_date', header: 'Date', sortable: true },
		{ field: 'event_time', header: 'Time', sortable: true },
		{ field: 'status', header: 'Type', sortable: false },
		{ field: 'actions', header: 'Actions', sortable: false }
	]
	
	return cols
})

const targetKudiColDefs = computed(() => [
	{ field: 'kudi', header: 'Kudi', sortable: false },
	{ field: 'requested_monks_count', header: 'Requested Monks', sortable: false },
	{ field: 'status', header: 'Status', sortable: false }
])

const currentPage = ref(1)
const perPage = ref(10)
const filterStatus = ref('ALL')

const filterOptions = computed(() => [
	{ label: 'All', value: 'ALL' },
	{ label: 'Pending', value: 'PENDING' },
	{ label: 'Assigned', value: 'ASSIGNED' },
	{ label: 'Rejected', value: 'REJECTED' }
])

const filteredEvents = computed(() => {
	let result = events.value
	
	if (searchQuery.value) {
		const q = searchQuery.value.toLowerCase()
		result = result.filter(row => 
			(row.title && row.title.toLowerCase().includes(q)) ||
			(row.description && row.description.toLowerCase().includes(q))
		)
	}

	if (filterStatus.value !== 'ALL') {
		result = result.filter(row => {
			if (!row.KutTargets) return false
			if (filterStatus.value === 'PENDING') return row.KutTargets.some(t => t.status === 'PENDING_MEKUDI')
			if (filterStatus.value === 'ASSIGNED') return row.KutTargets.some(t => t.status === 'FULFILLED')
			if (filterStatus.value === 'REJECTED') return row.KutTargets.some(t => t.status === 'REJECTED')
			return true
		})
	}
	
	return result
})

const paginatedEvents = computed(() => {
	const start = (currentPage.value - 1) * perPage.value
	return filteredEvents.value.slice(start, start + perPage.value)
})

const getFulfillmentStats = (row) => {
	if (!row.KutTargets) return { fulfilled: 0, rejected: 0, pending: 0 }
	return {
		fulfilled: row.KutTargets.filter(t => t.status === 'FULFILLED').length,
		rejected: row.KutTargets.filter(t => t.status === 'REJECTED').length,
		pending: row.KutTargets.filter(t => t.status === 'PENDING_MEKUDI').length,
	}
}

const getParticipantStats = (row) => {
	if (!row.Participants) return { accepted: 0, rejected: 0, pending: 0 }
	return {
		accepted: row.Participants.filter(p => p.status === 'ACCEPTED' || p.status === 'ATTENDED').length,
		rejected: row.Participants.filter(p => p.status === 'REJECTED' || p.status === 'ABSENT').length,
		pending: row.Participants.filter(p => p.status === 'ASSIGNED' || !p.status).length,
	}
}

const form = ref({
	title: '',
	description: '',
	event_date: '',
	event_time: '',
	selectedKuts: [],
	targets: [],
	selected_monk_ids: []
})

const removeTarget = (kut_id) => {
	form.value.selectedKuts = form.value.selectedKuts.filter(id => id !== kut_id)
	form.value.targets = form.value.targets.filter(t => t.kut_id !== kut_id)
}

const onSelectedKutsChange = () => {
	const newVal = form.value.selectedKuts || []
	// Add new ones
	newVal.forEach(kut_id => {
		if (!form.value.targets.find(t => t.kut_id === kut_id)) {
			const kudi = kuts.value.find(k => k.id === kut_id)
			form.value.targets.push({ kut_id, count: 1, name: kudi?.name || kut_id, status: 'NEW' })
		}
	})
	// Remove unselected ones
	form.value.targets = form.value.targets.filter(t => newVal.includes(t.kut_id))
}

const loadEvents = async () => {
	loading.value = true
	try {
		const params = {}
		if (props.selectedMonth) {
			params.month = props.selectedMonth.getMonth() + 1
			params.year = props.selectedMonth.getFullYear()
		}
		const res = await CeremonyEventService.getAllEvents(params)
		events.value = res.data.data
	} catch (error) {
		toast.showToast('Failed to load events', 'error')
	} finally {
		loading.value = false
	}
}

const loadKuts = async () => {
	try {
		const res = await api.get('/kuts')
		const loadedKuts = res.data.data || []
		// Sort naturally so 2 comes before 10
		loadedKuts.sort((a, b) => {
			const nameA = a.name || ''
			const nameB = b.name || ''
			return nameA.localeCompare(nameB, undefined, { numeric: true })
		})
		// Add "Kudi " prefix to display name if it's just a number
		kuts.value = loadedKuts.map(k => ({
			...k,
			name: (k.name && k.name.toLowerCase().startsWith('kudi')) ? k.name : `Kudi ${k.name}`
		}))
	} catch (error) {
		console.error('Failed to load kuts', error)
	}
}

const sortedKudiMembers = computed(() => {
	return [...kudiMembers.value].map(m => ({
		...m,
		fullName: `${m.firstName} ${m.lastName}`
	})).sort((a, b) => {
		// Bhikkhu (Role 7) comes before Monk (Role 3)
		const roleA = a.role?.name?.toLowerCase() === 'bhikkhu' ? 1 : 2
		const roleB = b.role?.name?.toLowerCase() === 'bhikkhu' ? 1 : 2
		return roleA - roleB
	})
})

const getRoleLabel = (roleName) => {
	if (!roleName) return ''
	const lower = roleName.toLowerCase()
	if (lower === 'bhikkhu') return 'ភិក្ខុ'
	if (lower === 'monk') return 'សាមណេរ'
	return roleName
}

const loadKudiMembers = async () => {
	try {
		loading.value = true
		// Pass perPage=1000 to ensure we get all members for this Kudi
		const res = await api.get(`/users?roleIds=3,7&kut_id=${authStore.user?.UserProfile?.kut_id}&perPage=1000`) 
		kudiMembers.value = res.data.data || res.data || []
	} catch (error) {
		console.error('Failed to load kudi members', error)
	} finally {
		loading.value = false
	}
}

const editingEventId = ref(null)

const openCreateModal = () => {
	editingEventId.value = null
	form.value = {
		title: '',
		description: '',
		event_date: '',
		event_time: '',
		selectedKuts: [],
		targets: [],
		selected_monk_ids: []
	}
	showCreateModal.value = true
}

const submitEvent = async () => {
	if (!form.value.title || !form.value.event_date) {
		toast.showToast('Title and Date are required', 'error')
		return
	}
	loading.value = true
	try {
		const target_kuts = form.value.targets.map(t => ({
			kut_id: t.kut_id,
			count: t.count
		}))

		if (editingEventId.value) {
			await CeremonyEventService.updateEvent(editingEventId.value, {
				title: form.value.title,
				description: form.value.description,
				event_date: form.value.event_date,
				event_time: form.value.event_time,
				target_kuts,
				user_ids: form.value.selected_monk_ids
			})
			toast.showToast('Event updated successfully!', 'success')
		} else {
			if (isSuperAdmin.value) {
				await CeremonyEventService.createEvent({
					...form.value,
					target_kuts
				})
			} else {
				await CeremonyEventService.createInternalEvent({
					...form.value,
					user_ids: form.value.selected_monk_ids
				})
			}
			toast.showToast('Event created successfully!', 'success')
		}
		showCreateModal.value = false
		loadEvents()
	} catch (error) {
		toast.showToast(error.response?.data?.message || 'Failed to save event', 'error')
	} finally {
		loading.value = false
	}
}

const editEvent = (row) => {
	editingEventId.value = row.id
	selectedEvent.value = row // Load event details to display the targets and participants in the edit modal

	const targetKutIds = row.KutTargets ? row.KutTargets.map(t => t.kut_id) : []
	const targets = row.KutTargets ? row.KutTargets.map(t => ({
		kut_id: t.kut_id,
		count: t.requested_monks_count,
		status: t.status,
		name: t.Kut?.name || t.kut_id
	})) : []

	form.value = {
		title: row.title,
		description: row.description,
		event_date: row.event_date,
		event_time: row.event_time,
		selectedKuts: targetKutIds,
		targets: targets,
		selected_monk_ids: row.Participants ? row.Participants.map(p => p.user_id) : []
	}
	showCreateModal.value = true
}

const deleteEvent = async (row) => {
	if (window.confirm(`Are you sure you want to delete the event "${row.title}"? This will also remove any Kudi assignments for this event.`)) {
		loading.value = true
		try {
			await CeremonyEventService.deleteEvent(row.id)
			toast.showToast('Event deleted successfully!', 'success')
			loadEvents()
		} catch (error) {
			toast.showToast(error.response?.data?.message || 'Failed to delete event', 'error')
		} finally {
			loading.value = false
		}
	}
}

const getActionItems = (row) => {
	return [
		{
			label: 'Edit',
			icon: Pencil,
			command: () => editEvent(row)
		},
		{
			label: 'Delete',
			icon: Trash2,
			iconClass: 'text-danger',
			textClass: 'text-danger',
			command: () => deleteEvent(row)
		}
	]
}

watch(() => props.selectedMonth, () => {
	loadEvents()
})

onMounted(() => {
	isMounted.value = true
	loadEvents()
	if (isSuperAdmin.value) {
		loadKuts()
	} else {
		loadKudiMembers()
	}

	socket.on('ceremony_event_created', loadEvents)
	socket.on('ceremony_event_updated', loadEvents)
	socket.on('ceremony_event_deleted', loadEvents)
})

onUnmounted(() => {
	socket.off('ceremony_event_created', loadEvents)
	socket.off('ceremony_event_updated', loadEvents)
	socket.off('ceremony_event_deleted', loadEvents)
})
</script>
