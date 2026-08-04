<template>
	<div class="room-view pb-5">
		<div class="row g-3 flex-grow-1">
			<!-- Left Aside: Filters & Actions (col-4) -->
			<div class="col-12 col-md-4 col-lg-4">
				<div class="card p-3 d-flex flex-column gap-3" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06)); position: sticky; top: 1rem;">
					<div class="d-flex align-items-center justify-content-between">
						<h6 class="fw-semibold mb-0 d-flex align-items-center gap-2" style="color: var(--text-base); font-size: 1rem;">
							<Filter :size="16" />
							<span>Filters & Actions</span>
						</h6>
					</div>
					<div class="main-divider my-0"></div>

					<!-- Search -->
					<div>
						<BaseInput 
							label="Search Rooms"
							v-model="searchQuery" 
							placeholder="Search by name, code or building..." 
							:prefixIcon="Search"
							clearable
						/>
					</div>

					<!-- Category Select Dropdown -->
					<div>
						<label class="form-label mb-2">Category</label>
						<BaseSelect v-model="selectedRoomType" :options="roomTypeOptions" placeholder="All Categories" clearable />
					</div>
				</div>
			</div>

			<!-- Right List: Room Cards (col-8) -->
			<div class="col-12 col-md-8 col-lg-8 d-flex flex-column">
				<!-- Loading State -->
				<div v-if="roomStore.isLoading" class="flex-grow-1 d-flex align-items-center justify-content-center">
					<div class="spinner-border text-primary" role="status"></div>
				</div>

				<!-- Empty State -->
				<div v-else-if="!filteredRooms.length" class="flex-grow-1 card d-flex flex-column align-items-center justify-content-center text-muted p-5" style="background-color: var(--body-bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color, rgba(0,0,0,0.06)); min-height: 300px;">
					<DoorOpen :size="64" class="mb-3 opacity-25" />
					<h5 class="fw-bold mb-2">No rooms found</h5>
					<p class="mb-0">No rooms match your search criteria.</p>
				</div>

				<!-- Room Cards Grid -->
				<div v-else>
					<div class="row g-3">
						<div class="col-12 col-md-6" v-for="room in filteredRooms" :key="room.id">
							<div class="card border-0 room-card overflow-hidden d-flex flex-column position-relative shadow-sm" @click="goToRoom(room.id)" style="min-height: 260px;">

								<!-- Full Background Image -->
								<img :src="room.images?.length > 0 ? $authImg(room.images[0].imageUrl) : coverImg" class="position-absolute w-100 h-100 object-fit-cover" style="top: 0; left: 0; z-index: 0;" />

								<!-- Dark Gradient Overlay -->
								<div class="position-absolute w-100 h-100" style="top: 0; left: 0; z-index: 1; background: linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.85) 100%);"></div>

								<!-- Content Overlay -->
								<div class="card-body p-4 d-flex flex-column position-relative text-white" style="z-index: 2;">

									<!-- Top Active Status Badge (Exactly ONE simple Badge) -->
									<div class="d-flex justify-content-between align-items-start mb-auto">
										<span class="badge rounded-pill px-3 py-2 mb-2 fw-medium" :class="room.isActive ? 'bg-success' : 'bg-danger'">
											{{ room.isActive ? 'Available' : 'Closed' }}
										</span>
									</div>

									<!-- Bottom Info -->
									<div class="mt-auto">
										<h4 class="fw-bold mb-1 text-truncate text-white">{{ room.name }}</h4>
										<p class="text-light small mb-2">{{ formatType(room.type) }}</p>

										<div class="d-flex align-items-end justify-content-between mb-2 pb-2 border-bottom border-light border-opacity-25">
											<div class="d-flex align-items-baseline gap-1">
												<h3 class="fw-bold mb-0 text-white">{{ room.capacity }}</h3>
												<span class="text-light small fw-medium">max seats</span>
											</div>
											<div class="d-flex align-items-center fw-medium gap-1 small text-light opacity-75">
												<Hash :size="16" />
												<span>{{ room.code }}</span>
											</div>
										</div>

										<div class="d-flex align-items-center gap-4 text-light small mb-3 fw-medium">
											<div class="d-flex align-items-center gap-1">
												<Building2 :size="16" />
												<span>{{ room.building }}</span>
											</div>
											<div class="d-flex align-items-center gap-1">
												<Layers :size="16" />
												<span>Floor {{ room.floor }}</span>
											</div>
										</div>

										<BaseButton class="w-100 fw-bold action-btn" variant="primary">
											View Details <ArrowRight :size="16" />
										</BaseButton>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRoomStore } from '@/stores/rooms/room'
import {
	Building2, Layers, DoorOpen, Hash, ArrowRight, Search, Filter
} from '@lucide/vue'
const coverImg = 'https://placehold.co/600x400'

const router = useRouter()
const roomStore = useRoomStore()

// ─── Filter State ─────────────────────────────────────────────────────────────
const searchQuery      = ref('')
const selectedRoomType = ref('')

// ─── Helpers ──────────────────────────────────────────────────────────────────
function goToRoom(id) {
	router.push({ name: 'pagoda-room-detail', params: { id } })
}

function formatType(type) {
	if (!type) return '—'
	return type.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
}

const roomTypeOptions = computed(() => {
	const seen = new Set()
	const opts = [{ label: 'All Categories', value: '' }]
	const types = roomStore.roomTypes.length
		? roomStore.roomTypes
		: ['CLASSROOM', 'LAB', 'OFFICE', 'MEETING_ROOM', 'HALL', 'OTHER']
	types.forEach(t => {
		const val = typeof t === 'string' ? t : (t.value || t.name || '')
		if (val && !seen.has(val)) {
			seen.add(val)
			opts.push({ label: formatType(val), value: val })
		}
	})
	return opts
})

// ─── Filtered List ────────────────────────────────────────────────────────────
const filteredRooms = computed(() => {
	return roomStore.rooms.filter(room => {
		if (selectedRoomType.value && room.type !== selectedRoomType.value) return false
		if (searchQuery.value) {
			const q = searchQuery.value.toLowerCase()
			const match = room.name?.toLowerCase().includes(q)
				|| room.code?.toLowerCase().includes(q)
				|| room.building?.toLowerCase().includes(q)
			if (!match) return false
		}
		return true
	})
})

// ─── Mount ────────────────────────────────────────────────────────────────────
onMounted(async () => {
	await Promise.all([
		roomStore.getRoomTypes(),
		roomStore.getAllRooms({ forceRefresh: true })
	])
})
</script>

<style scoped>
/* ── Room Card ───────────────────────────────────────────────────── */
.room-card {
	cursor: pointer;
	transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	background: var(--body-bg-color);
}

.room-card:hover .action-btn {
	transform: scale(1.02);
}

.action-btn {
	transition: all 0.2s ease;
}

/* Loading & Empty States */
.page-loading,
.empty-state {
	text-align: center;
	padding: 60px 20px;
	color: var(--sidebar-text-muted);
}

.load-spinner {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	border: 3px solid var(--border-clr);
	border-top-color: var(--primary-color);
	animation: spin 0.7s linear infinite;
	margin: 0 auto 12px;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}
</style>
