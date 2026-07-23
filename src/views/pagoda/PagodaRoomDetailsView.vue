<template>
  <div class="room-detail-view pb-3">

    <div v-if="roomStore.isLoading && !hasLoaded" class="page-loading">
      <div class="load-spinner"></div>
      <p>Loading room details...</p>
    </div>

    <div v-else-if="hasLoaded && !roomStore.roomDetails" class="page-error">
      <span class="err-icon">⚠</span>
      <p>Room not found.</p>
    </div>

    <div v-else-if="roomStore.roomDetails">

      <transition name="fade" mode="out-in">
        <div v-if="showBookingForm" class="row justify-content-center" key="form">
          <div class="col-12 col-md-6">
            <div class="card" style="background-color: var(--surface-ground);">
              <div class="card-body p-3"
                style="background-color: var(--body-bg-color); border-radius: var(--border-radius) !important;">

                <div class="d-flex align-items-center justify-content-between mb-3">
                  <h5 class="mb-0 fw-bold">Request Room Booking</h5>
                </div>

                <RoomBookingRequestForm
                  ref="bookingFormRef"
                  :room="roomStore.roomDetails"
                />

                <div class="d-flex gap-2 mt-3">
                  <BaseButton @click="() => { showBookingForm = false; }" type="button"
                    variant="outline-primary" class="flex-grow-1">Cancel
                  </BaseButton>
                  <BaseButton @click="handleBookingSubmit" :isLoading="isSubmittingBooking" type="button"
                    class="flex-grow-1">
                    {{ isSubmittingBooking ? 'Submitting...' : 'Submit Request' }}
                  </BaseButton>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div v-else class="d-flex flex-column gap-2" key="details">
          <div class="row g-2">
            <div class="col-12 col-lg-8">
              <RoomHeroImage 
                :room="roomStore.roomDetails" 
                @back="router.push({ name: 'pagoda-rooms' })" 
              />
            </div>

            <div class="col-12 col-lg-4">
              <div class="card p-3 h-100" style="border-radius: var(--border-radius); background-color: var(--body-bg-color);">
                <div class="datepicker-wrapper w-100 flex-grow-1 d-flex flex-column justify-content-center">
                  <BaseDatePicker inline v-model="selectedDate" class="w-100" />
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Row: Sessions -->
          <div class="row g-3">
            <div class="col-12">
              <!-- 2. Sessions Availability -->
              <div class="d-flex flex-column h-100">
                <div class="row g-2">
                  <div v-for="(sess, index) in ['MORNING', 'AFTERNOON', 'EVENING']" :key="sess" class="col-12 col-xl-4 d-flex flex-column gap-2">
                    
                    <!-- Session Title Card -->
                    <div class="card p-3" style="background-color: var(--body-bg-color);">
                      <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center gap-2">
                          <div class="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width: 34px; height: 34px; background-color: var(--surface-ground);">
                            <component :is="getSessionIcon(sess)" :size="16" style="color: var(--text-heading-color);" />
                          </div>
                          <span class="fw-bold text-truncate" style="color: var(--text-heading-color); font-size: 0.95rem;">{{ capitalizeWord(sess) }} Session</span>
                        </div>
                        <BaseBadge :status="getSessionBadgeStatus(sess)" />
                      </div>
                    </div>

                    <!-- Info Card (No flex-grow-1 or h-100) -->
                    <div v-if="isSessionEnded(sess) || getSessionBadgeStatus(sess) === 'UNAVAILABLE' || getSessionBadgeStatus(sess) === 'COMPLETED'" class="card p-4 d-flex flex-column align-items-center justify-content-center opacity-50 flex-grow-1" style="border: 1px solid var(--border-color, rgba(0,0,0,0.08)); border-radius: var(--border-radius); background-color: var(--body-bg-color);">
                        <XCircle :size="28" class="text-muted mb-2" stroke-width="1.5" />
                        <span class="text-muted fw-medium" style="font-size: 0.85rem;">Session unavailable</span>
                    </div>

                    <template v-else>
                      <div class="card p-3 d-flex flex-row gap-2" style="border: 1px solid var(--border-color, rgba(0,0,0,0.08)); border-radius: var(--border-radius); background-color: var(--body-bg-color);">
                        <div class="w-50 p-2 rounded-3 d-flex flex-column gap-1" style="background-color: var(--surface-ground);">
                          <span class="d-flex align-items-center gap-1 text-muted fw-medium" style="font-size: 0.7rem;">
                            <Clock :size="12" /> Time Range
                          </span>
                          <span class="text-dark fw-bold text-truncate" style="font-size: 0.85rem;">{{ getSessionTimeBounds(sess).label }}</span>
                        </div>
                        <div class="w-50 p-2 rounded-3 d-flex flex-column gap-1" style="background-color: var(--surface-ground);">
                          <span class="d-flex align-items-center gap-1 text-muted fw-medium" style="font-size: 0.7rem;">
                            <CalendarDays :size="12" /> Date
                          </span>
                          <span class="text-dark fw-bold text-truncate" style="font-size: 0.85rem;">{{ formatFriendlyDateShort(selectedDate) }}</span>
                        </div>
                      </div>

                      <!-- Slots Container (Outside parent card) -->
                      <div class="d-flex flex-column gap-2 flex-grow-1">
                        <template v-for="(seg, idx) in getTimelineSegments(sess, getSessionNote(sess))" :key="'row-' + idx">
                          <div
                            v-if="seg.type === 'booked' || seg.durationMin >= 15"
                            class="card p-3"
                            style="background-color: var(--body-bg-color);"
                          >
                            <div class="d-flex align-items-center gap-2 mb-2">
                              <CheckCircle v-if="seg.type === 'free'" :size="18" class="text-success flex-shrink-0" />
                              <XCircle v-else :size="18" class="text-danger flex-shrink-0" />
                              <span :class="{'fw-bold text-dark': seg.type === 'free', 'text-muted fw-bold text-decoration-line-through': seg.type !== 'free'}" style="font-size: 0.95rem; white-space: nowrap;">
                                {{ formatMinToTime(seg.start) }} - {{ formatMinToTime(seg.end) }}
                              </span>
                              <!-- Status on the same line -->
                              <span v-if="seg.type !== 'free'" class="badge rounded-pill fw-medium ms-auto" style="background: rgba(220, 53, 69, 0.1); color: #dc3545; padding: 4px 10px; font-size: 0.7rem;">Reserved</span>
                              <span v-else class="text-muted ms-2 text-truncate" style="font-size: 0.85rem;">Available for booking</span>
                            </div>
                            
                            <!-- Title (only for booked) -->
                            <p v-if="seg.type !== 'free'" class="text-muted text-sm mb-0 text-truncate" style="font-size: 0.85rem; padding-left: 26px;">
                              {{ seg.title }}
                            </p>

                            <!-- Footer (only for free slots now) -->
                            <template v-if="seg.type === 'free'">
                              <div class="d-flex justify-content-between align-items-center">
                                <BaseButton variant="outline-primary" class="w-100 py-2 d-flex justify-content-center align-items-center gap-2 fw-semibold" style="font-size: 0.85rem;" @click="bookSpecificTimeSlot(sess, seg.start, seg.end)">
                                  Book Slot <ArrowRight :size="16" />
                                </BaseButton>
                              </div>
                            </template>
                          </div>
                        </template>
                        <div v-if="!getTimelineSegments(sess, getSessionNote(sess)).some(seg => seg.type === 'booked' || seg.durationMin >= 15)" class="text-center py-4 text-muted text-xs">
                          No slots available
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoomStore } from '@/stores/rooms/room'
import {
	CalendarDays, CheckCircle, XCircle, Clock, Sun, Sunset, Moon, ArrowRight
} from '@lucide/vue'
import BaseButton from '@/components/base/BaseButton.vue'
import RoomBookingRequestForm from './components/RoomBookingRequestForm.vue'
import RoomHeroImage from './components/RoomHeroImage.vue'
import { useRoomScheduleStore } from '@/stores/rooms/roomSchedule'
import { useTimeFormat } from '@/composables/useTimeFormat'
import { useRoomScheduleLogic } from '@/composables/rooms/useRoomScheduleLogic'

const roomStore = useRoomStore()
const roomScheduleStore = useRoomScheduleStore()
const route = useRoute()
const router = useRouter()

const hasLoaded = ref(false)
const showBookingForm = ref(false)
const bookingFormRef = ref(null)
const isSubmittingBooking = ref(false)
const pendingPreselection = ref(null)

// Utilities & Logic
const { toYMD, formatFriendlyDateShort, capitalizeWord, formatMinToTime } = useTimeFormat()
const selectedDate = ref(new Date())
const { 
  getSessionBadgeStatus, 
  getSessionTimeBounds, 
  isSessionEnded, 
  getTimelineSegments 
} = useRoomScheduleLogic(roomStore, selectedDate)

// ─── Watchers ─────────────────────────────────────────────────────────────────
watch(bookingFormRef, (newRef) => {
	if (newRef && pendingPreselection.value) {
		newRef.setFormPreselection(pendingPreselection.value)
		pendingPreselection.value = null
	}
})

watch(selectedDate, async (newDate) => {
	if (newDate && roomStore.roomDetails) {
		await roomStore.getRoomAvailability({ date: toYMD(newDate) })
	}
})

// ─── UI Helpers ───────────────────────────────────────────────────────────────
const getSessionIcon = (session) => {
	const map = { MORNING: Sun, AFTERNOON: Sunset, EVENING: Moon }
	return map[session] || Clock
}

const getSessionNote = (session) => {
	const details = roomStore.roomDetails
	if (!details) return ''
	const found = roomStore.rooms.find(r => r.id === details.id)
	if (found && Array.isArray(found.availability)) {
		const sessRecord = found.availability.find(s => s.session === session)
		return sessRecord ? sessRecord.note : ''
	}
	return ''
}

// ─── Actions ──────────────────────────────────────────────────────────────────
const handleBookingSubmit = async () => {
	const formRef = bookingFormRef.value
	if (!formRef) return

	const payload = await formRef.validateForm()
	if (!payload) return

	isSubmittingBooking.value = true
	const ok = await roomScheduleStore.requestRoomBooking(roomStore.roomDetails.id, payload)
	if (ok) {
		showBookingForm.value = false
		router.push({ name: 'pagoda-my-bookings' })
	}
	isSubmittingBooking.value = false
}

const bookSpecificTimeSlot = (session, startMin, endMin) => {
	const dateStr = toYMD(selectedDate.value)
	const startTimeStr = formatMinToTime(startMin)
	const endTimeStr = formatMinToTime(endMin)
	
	pendingPreselection.value = {
		session: session,
		startTime: startTimeStr,
		endTime: endTimeStr,
		dates: [dateStr],
		minTime: startTimeStr,
		maxTime: endTimeStr
	}
	
	showBookingForm.value = true
}

onMounted(async () => {
	const id = route.params.id
	if (id) {
		await roomStore.getRoomById(id)
		await roomStore.getRoomAvailability({ date: toYMD(selectedDate.value) })
	}
	hasLoaded.value = true
})
</script>

<style scoped>
.page-loading {
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

.page-error {
  text-align: center;
  padding: 40px 20px;
  color: var(--sidebar-text-muted);
}

.err-icon {
  font-size: 2rem;
  color: var(--danger-color);
}
</style>