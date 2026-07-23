import { useTimeFormat } from '@/composables/useTimeFormat'

/**
 * Composable that encapsulates all the business logic for calculating room schedules,
 * session availability, and timeline segments.
 * 
 * @param {Object} roomStore - The Pinia room store instance
 * @param {Ref<Date>} selectedDate - Vue ref containing the currently selected date
 */
export function useRoomScheduleLogic(roomStore, selectedDate) {
  const { timeToMinutes } = useTimeFormat()

  const getRoomSessionStatus = (session) => {
    const details = roomStore.roomDetails
    if (!details || !details.isActive) return 'CLOSED'

    const found = roomStore.rooms.find(r => r.id === details.id)
    if (found) {
      if (typeof found.availability === 'string') return found.availability
      if (Array.isArray(found.availability)) {
        const sessRecord = found.availability.find(s => s.session === session)
        return sessRecord ? (sessRecord.scheduleStatus || sessRecord.status) : 'AVAILABLE'
      }
    }
    return 'AVAILABLE'
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

  const getSessionBadgeStatus = (session) => {
    const status = getRoomSessionStatus(session)
    if (status === 'AVAILABLE' || status === 'REJECTED' || status === 'CANCELLED') return 'AVAILABLE'
    if (status === 'CLOSED' || status === 'UNAVAILABLE') return 'UNAVAILABLE'
    if (status === 'COMPLETED') return 'COMPLETED'
    return 'BOOKED'
  }

  const getSessionTimeBounds = (session) => {
    if (session === 'MORNING') return { start: 8 * 60, end: 12 * 60, label: '08:00 - 12:00' }
    if (session === 'AFTERNOON') return { start: 13 * 60, end: 17 * 60, label: '13:00 - 17:00' }
    return { start: 17.5 * 60, end: 20.5 * 60, label: '17:30 - 20:30' } // EVENING
  }

  const isSessionEnded = (sess) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const sel = new Date(selectedDate.value)
    sel.setHours(0, 0, 0, 0)

    if (sel < today) return true

    if (sel.getTime() === today.getTime()) {
      const now = new Date()
      const currentMin = now.getHours() * 60 + now.getMinutes()
      const bounds = getSessionTimeBounds(sess)
      if (currentMin > bounds.end) return true
    }
    return false
  }

  const parseBookedIntervals = (session, note) => {
    if (!note || !note.includes('Booked:')) return []
    const intervals = []
    const regex = /\[(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\]\s*([^,\]]*)/g
    let match
    while ((match = regex.exec(note)) !== null) {
      intervals.push({
        start: match[1],
        end: match[2],
        title: match[3] ? match[3].trim() : 'Booked'
      })
    }
    return intervals
  }

  const getTimelineSegments = (session, note) => {
    const bounds = getSessionTimeBounds(session)
    const totalMinutes = bounds.end - bounds.start
    const intervals = parseBookedIntervals(session, note)

    intervals.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))

    const segments = []
    let currentMin = bounds.start

    for (const interval of intervals) {
      const startMin = timeToMinutes(interval.start)
      const endMin = timeToMinutes(interval.end)

      if (startMin > currentMin) {
        const freeDuration = startMin - currentMin
        segments.push({
          type: 'free',
          start: currentMin,
          end: startMin,
          widthPct: (freeDuration / totalMinutes) * 100,
          durationMin: freeDuration
        })
      }

      const bookedDuration = Math.min(endMin, bounds.end) - Math.max(startMin, bounds.start)
      if (bookedDuration > 0) {
        segments.push({
          type: 'booked',
          start: Math.max(startMin, bounds.start),
          end: Math.min(endMin, bounds.end),
          widthPct: (bookedDuration / totalMinutes) * 100,
          durationMin: bookedDuration,
          title: interval.title,
          timeLabel: `${interval.start} - ${interval.end}`
        })
      }

      currentMin = Math.min(endMin, bounds.end)
    }

    if (currentMin < bounds.end) {
      const freeDuration = bounds.end - currentMin
      segments.push({
        type: 'free',
        start: currentMin,
        end: bounds.end,
        widthPct: (freeDuration / totalMinutes) * 100,
        durationMin: freeDuration
      })
    }

    return segments
  }

  return {
    getRoomSessionStatus,
    getSessionNote,
    getSessionBadgeStatus,
    getSessionTimeBounds,
    isSessionEnded,
    getTimelineSegments
  }
}
