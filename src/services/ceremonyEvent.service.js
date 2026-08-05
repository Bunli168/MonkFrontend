import api from '@/api/api.js'

class CeremonyEventService {
	getAllEvents(params = {}) {
		return api.get('/ceremony-events', { params })
	}

	createEvent(eventData) {
		return api.post('/ceremony-events', eventData)
	}

	getPendingAssignments(params = {}) {
		return api.get('/ceremony-events/pending-assignments', { params })
	}

	getMemberResponses(params = {}) {
		return api.get('/ceremony-events/member-responses', { params })
	}

	assignMonks(targetId, userIds) {
		return api.post(`/ceremony-events/target/${targetId}/assign`, { user_ids: userIds })
	}

	rejectAssignment(targetId) {
		return api.post(`/ceremony-events/target/${targetId}/reject`)
	}

	createInternalEvent(eventData) {
		return api.post('/ceremony-events/internal', eventData)
	}

	getMonkStats(params) {
		return api.get('/ceremony-events/monk-stats', { params })
	}

	updateEvent(id, eventData) {
		return api.put(`/ceremony-events/${id}`, eventData)
	}

	deleteEvent(id) {
		return api.delete(`/ceremony-events/${id}`)
	}
}

export default new CeremonyEventService()
