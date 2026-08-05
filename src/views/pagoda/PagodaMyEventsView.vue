<template>
	<div class="card border-0" style="background-color: var(--surface-ground);">
		<div class="d-flex align-items-center mb-3 px-2 px-md-0 pt-3 pt-md-0">
			<h4 class="mb-0 fw-bold">ការនិមន្តរបស់ខ្ញុំ (My Events)</h4>
		</div>

		<BaseTable 
					:columns="colDefs" 
					:rows="events" 
					:loading="loading"
					:show-index="true"
					:paginator="true"
					:rowsPerPage="10"
				>
					<template #CeremonyEvent.title="{ data: row }">
						<span class="fw-medium">{{ row.CeremonyEvent?.title }}</span>
					</template>
					<template #CeremonyEvent.event_date="{ data: row }">
						{{ row.CeremonyEvent?.event_date }}
					</template>
					<template #CeremonyEvent.event_time="{ data: row }">
						{{ row.CeremonyEvent?.event_time }}
					</template>
					<template #status="{ data: row }">
						<Tag 
							:value="row.status" 
							:severity="getStatusSeverity(row.status)" 
							style="font-size: 0.75rem;" 
						/>
					</template>
					<template #actions="{ data: row }">
						<div class="d-flex gap-2" v-if="row.status === 'ASSIGNED'">
							<Button 
								label="Approve" 
								icon="pi pi-check" 
								class="p-button-sm p-button-success" 
								@click="updateStatus(row.event_id, 'ACCEPTED')" 
							/>
							<Button 
								label="Reject" 
								icon="pi pi-times" 
								class="p-button-sm p-button-danger" 
								@click="updateStatus(row.event_id, 'REJECTED')" 
							/>
						</div>
					</template>
		</BaseTable>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import api from '@/api/api';
import { socket } from '@/utils/socket';
import { useToastStore } from '@/stores/toast';
import BaseTable from '@/components/base/BaseTable.vue';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import { useConfirm } from 'primevue/useconfirm';


const toast = useToastStore();
const confirm = useConfirm();

const loading = ref(false);
const events = ref([]);

const colDefs = computed(() => [
	{ field: 'CeremonyEvent.title', header: 'Event Name', sortable: true },
	{ field: 'CeremonyEvent.event_date', header: 'Date', sortable: true },
	{ field: 'CeremonyEvent.event_time', header: 'Time', sortable: true },
	{ field: 'status', header: 'Status', sortable: true },
	{ field: 'actions', header: 'Actions', sortable: false }
]);

const getStatusSeverity = (status) => {
	switch (status?.toUpperCase()) {
		case 'ACCEPTED':
			return 'success';
		case 'REJECTED':
			return 'danger';
		case 'ASSIGNED':
			return 'warning';
		default:
			return 'info';
	}
};

const fetchMyEvents = async () => {
	loading.value = true;
	try {
		const res = await api.get('/ceremony-events/my-assignments');
		events.value = res.data?.data || [];
	} catch (error) {
		toast.showToast(error.response?.data?.message || 'Error fetching events', 'error');
	} finally {
		loading.value = false;
	}
};

const updateStatus = async (eventId, status) => {
	const performUpdate = async () => {
		try {
			const res = await api.put(`/ceremony-events/my-assignments/${eventId}/status`, { status });
			if (res.data?.success) {
				toast.showToast('Status updated successfully', 'success');
				fetchMyEvents();
			}
		} catch (error) {
			toast.showToast(error.response?.data?.message || 'Error updating status', 'error');
		}
	};

	if (status === 'ACCEPTED') {
		performUpdate();
	} else {
		confirm.require({
			message: `Are you sure you want to ${status.toLowerCase()} this assignment?`,
			header: 'Confirmation',
			icon: 'pi pi-exclamation-triangle',
			acceptClass: 'p-button-danger',
			accept: performUpdate
		});
	}
};

onMounted(() => {
	fetchMyEvents();
	socket.on('ceremony_event_created', fetchMyEvents);
	socket.on('ceremony_event_updated', fetchMyEvents);
	socket.on('ceremony_assignment_updated', fetchMyEvents);
});

onUnmounted(() => {
	socket.off('ceremony_event_created', fetchMyEvents);
	socket.off('ceremony_event_updated', fetchMyEvents);
	socket.off('ceremony_assignment_updated', fetchMyEvents);
});
</script>

<style scoped>
</style>
