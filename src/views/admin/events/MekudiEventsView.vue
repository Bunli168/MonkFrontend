<template>
	<div class="card border-0" style="background-color: var(--surface-ground);">

			<BaseTable 
				:columns="colDefs" 
				:rows="paginatedTargets" 
				:totalRecords="pendingTargets?.length || 0"
				:loading="loading"
				:show-index="true"
				:page="currentPage"
				:perPage="perPage"
				@update:page="currentPage = $event"
				@update:perPage="perPage = $event"
			>
				<template #event_name="{ data: row }">
					{{ row.CeremonyEvent?.title }}
				</template>
				<template #event_date="{ data: row }">
					{{ row.CeremonyEvent?.event_date }}
				</template>
				<template #requested_monks_count="{ data: row }">
					{{ row.requested_monks_count }}
				</template>
				<template #status="{ data: row }">
					<Badge :value="row.status" :severity="row.status === 'PENDING_MEKUDI' ? 'warning' : 'success'"></Badge>
				</template>
				<template #actions="{ data: row }">
					<BaseActionMenu :items="getActionItems(row)" />
				</template>
			</BaseTable>

		<!-- Assign Monks Modal -->
		<Dialog v-model:visible="showAssignModal" header="Assign Monks for Event" :style="{width: '90vw', maxWidth: '600px'}" :modal="true">
			<div v-if="selectedTarget" class="d-flex flex-column gap-3">
				<div class="alert alert-info">
					You need to assign exactly <strong>{{ selectedTarget.requested_monks_count }}</strong> monk(s) for the event <strong>{{ selectedTarget.CeremonyEvent?.title }}</strong>.
				</div>

				<div class="field">
					<label class="fw-bold">Select Monks from your Kudi</label>
					<div class="d-flex flex-wrap gap-2 mt-2" style="max-height: 300px; overflow-y: auto;">
						<div v-for="user in sortedKudiMembers" :key="user.id" class="d-flex align-items-center w-100 p-2 rounded" style="background-color: var(--surface-card); border: 1px solid var(--border-color, rgba(0,0,0,0.1));">
							<Checkbox 
								v-model="selectedUserIds" 
								:inputId="'user-'+user.id" 
								name="user" 
								:value="user.id"
								:disabled="(selectedUserIds?.length || 0) >= selectedTarget.requested_monks_count && !selectedUserIds.includes(user.id)"
							/>
							<label :for="'user-'+user.id" class="ms-2 mb-0 flex-grow-1 cursor-pointer">
								{{ user.firstName }} {{ user.lastName }} 
								<span class="text-muted" style="font-size: 0.85em;">({{ getRoleLabel(user.role?.name) }})</span>
							</label>
						</div>
						<div v-if="(kudiMembers?.length || 0) === 0 && !loading" class="text-muted fst-italic">
							No monks found in this Kudi. 
							<span v-if="authStore.hasRole(['SuperAdmin'])">Please assign monks to this Kudi first.</span>
							<span v-else>If you believe this is an error, please ensure your account is assigned to a Kudi.</span>
						</div>
					</div>
				</div>
			</div>
			<template #footer>
				<Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showAssignModal = false" />
				<Button 
					label="Submit Assignment" 
					icon="pi pi-check" 
					@click="submitAssignment" 
					:loading="loading" 
					:disabled="(selectedUserIds?.length || 0) !== selectedTarget?.requested_monks_count" 
				/>
			</template>
		</Dialog>

		<!-- Confirmation Dialog for Reject -->
		<ConfirmDialog></ConfirmDialog>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import CeremonyEventService from '@/services/ceremonyEvent.service'
import { socket } from '@/utils/socket'
import api from '@/api/api'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'

// Base components
import BaseTable from '@/components/base/BaseTable.vue'
import BaseActionMenu from '@/components/base/BaseActionMenu.vue'

// PrimeVue components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Badge from 'primevue/badge'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import { Search, RefreshCw } from '@lucide/vue'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import { Users, X, Pencil } from '@lucide/vue'

const props = defineProps({
	selectedMonth: {
		type: Date,
		default: null
	}
})

const emit = defineEmits(['update-count'])

const searchQuery = ref('')

const toast = useToastStore()
const authStore = useAuthStore()
const confirm = useConfirm()

const pendingTargets = ref([])
watch(pendingTargets, (newVal) => {
	const count = (newVal || []).filter(t => t.status === 'PENDING_MEKUDI').length
	emit('update-count', count)
}, { deep: true })
const loading = ref(false)

const kudiMembers = ref([])
const selectedUserIds = ref([])
const showAssignModal = ref(false)
const selectedTarget = ref(null)

// Table setup
const colDefs = computed(() => [
	{ field: 'event_name', header: 'Event Name', sortable: true },
	{ field: 'event_date', header: 'Date', sortable: true },
	{ field: 'requested_monks_count', header: 'Monks Needed', sortable: true },
	{ field: 'status', header: 'Status', sortable: false },
	{ field: 'actions', header: 'Actions', sortable: false }
])

const currentPage = ref(1)
const perPage = ref(10)

const filteredTargets = computed(() => {
	let result = pendingTargets.value
	
	if (searchQuery.value) {
		const q = searchQuery.value.toLowerCase()
		result = result.filter(target => 
			(target.CeremonyEvent?.title && target.CeremonyEvent.title.toLowerCase().includes(q))
		)
	}
	
	return result
})

const paginatedTargets = computed(() => {
	const start = (currentPage.value - 1) * perPage.value
	return filteredTargets.value.slice(start, start + perPage.value)
})

const loadPendingAssignments = async () => {
	loading.value = true
	try {
		const params = {}
		if (props.selectedMonth) {
			params.month = props.selectedMonth.getMonth() + 1
			params.year = props.selectedMonth.getFullYear()
		}
		const res = await CeremonyEventService.getPendingAssignments(params)
		pendingTargets.value = res.data.data || []
	} catch (error) {
		toast.showToast(error.response?.data?.message || 'Failed to load pending assignments', 'error')
	} finally {
		loading.value = false
	}
}

const sortedKudiMembers = computed(() => {
	return [...kudiMembers.value].sort((a, b) => {
		const getRoleWeight = (roleName) => {
			const lower = roleName?.toLowerCase()
			if (lower === 'admin') return 1
			if (lower === 'bhikkhu') return 2
			if (lower === 'monk') return 3
			return 4
		}
		return getRoleWeight(a.role?.name) - getRoleWeight(b.role?.name)
	})
})

const getRoleLabel = (roleName) => {
	if (!roleName) return ''
	const lower = roleName.toLowerCase()
	if (lower === 'admin') return 'មេកុដិ'
	if (lower === 'bhikkhu') return 'ភិក្ខុ'
	if (lower === 'monk') return 'សាមណេរ'
	return roleName
}

// We no longer load Kudi members on mount, we load them when opening the modal.
const loadKudiMembers = async (kutId) => {
	try {
		loading.value = true
		// Pass perPage=1000 to ensure we get all members for this Kudi
		const res = await api.get(`/users?kut_id=${kutId}&roleIds=2,3,7&perPage=1000`) 
		kudiMembers.value = res.data.data || res.data || []
	} catch (error) {
		console.error('Failed to load kudi members', error)
	} finally {
		loading.value = false
	}
}

const openAssignModal = async (target) => {
	selectedTarget.value = target
	selectedUserIds.value = []
	
	// Pre-fill existing participants if editing
	if (target.CeremonyEvent?.Participants) {
		selectedUserIds.value = target.CeremonyEvent.Participants.map(p => p.user_id)
	}

	kudiMembers.value = []
	showAssignModal.value = true
	await loadKudiMembers(target.kut_id)
}

const confirmReject = (target) => {
	confirm.require({
		message: `Are you sure you want to reject the assignment for ${target.CeremonyEvent?.title}?`,
		header: 'Confirm Rejection',
		icon: 'pi pi-exclamation-triangle',
		acceptClass: 'p-button-danger',
		accept: async () => {
			try {
				loading.value = true
				await CeremonyEventService.rejectAssignment(target.id)
				toast.showToast('Assignment rejected.', 'success')
				loadPendingAssignments()
			} catch (error) {
				toast.showToast(error.response?.data?.message || 'Failed to reject assignment', 'error')
			} finally {
				loading.value = false
			}
		}
	})
}

const submitAssignment = async () => {
	if ((selectedUserIds.value?.length || 0) !== selectedTarget.value.requested_monks_count) {
		toast.showToast(`Please select exactly ${selectedTarget.value.requested_monks_count} monk(s).`, 'error')
		return
	}
	
	loading.value = true
	try {
		await CeremonyEventService.assignMonks(selectedTarget.value.id, selectedUserIds.value)
		toast.showToast('Monks assigned successfully!', 'success')
		showAssignModal.value = false
		loadPendingAssignments() // Refresh list
	} catch (error) {
		toast.showToast(error.response?.data?.message || 'Failed to assign monks', 'error')
	} finally {
		loading.value = false
	}
}

const getActionItems = (row) => {
	const items = []

	if (row.status === 'PENDING_MEKUDI') {
		items.push({
			label: 'Assign Monks',
			icon: Users,
			command: () => openAssignModal(row)
		})
		items.push({
			label: 'Reject Assignment',
			icon: X,
			iconClass: 'text-danger',
			textClass: 'text-danger',
			command: () => confirmReject(row)
		})
	}

	if (row.status === 'FULFILLED') {
		items.push({
			label: 'Edit Assignment',
			icon: Pencil,
			command: () => openAssignModal(row)
		})
	}

	// Always allow Admin/SuperAdmin to reject an assignment even if fulfilled
	if (row.status === 'FULFILLED' && authStore.hasRole(['SuperAdmin', 'Admin'])) {
		items.push({
			label: 'Reject Assignment (Admin)',
			icon: X,
			iconClass: 'text-danger',
			textClass: 'text-danger',
			command: () => confirmReject(row)
		})
	}

	return items
}

watch(() => props.selectedMonth, () => {
	loadPendingAssignments()
})

onMounted(() => {
	loadPendingAssignments()
	socket.on('ceremony_event_created', loadPendingAssignments)
	socket.on('ceremony_event_updated', loadPendingAssignments)
	socket.on('ceremony_assignment_updated', loadPendingAssignments)
})

onUnmounted(() => {
	socket.off('ceremony_event_created', loadPendingAssignments)
	socket.off('ceremony_event_updated', loadPendingAssignments)
	socket.off('ceremony_assignment_updated', loadPendingAssignments)
})
</script>
