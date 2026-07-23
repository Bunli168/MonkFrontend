<template>
    <form>
        <div class="row g-3 mb-3" v-if="authStore.isTeacher">
            <div class="col-12">
                <BaseSelect v-model="form.teacherId" label="Select Monk for Event" required :options="memberOptions"
                    placeholder="Choose a monk to assign this event to" :error="errors.teacherId" />
            </div>
        </div>
        <div class="row g-3 mb-3">
            <div class="col-md-6">
                <BaseInput v-model="form.title" label="Title" required placeholder="Enter booking title"
                    :error="errors.title" />
            </div>
            <div class="col-md-6">
                <BaseInput v-model="form.subject" label="Subject" required placeholder="Enter subject name"
                    :error="errors.subject" />
            </div>
        </div>

        <div class="row g-3 mb-3">
            <div class="col-md-6">
                <BaseInput v-model="form.className" label="Class / Group" placeholder="Enter class or group name"
                    :error="errors.className" />
            </div>
            <div class="col-md-6">
                <BaseSelect v-model="form.session" label="Session" required :options="sessionOptions"
                    placeholder="Select session" :disabled="!!minTimeLimit" :error="errors.session" />
            </div>
        </div>

        <div class="mb-4">
            <label class="form-label mb-2">Booking Date <span style="color: var(--danger-color)">*</span></label>
            <div class="date-display-card d-flex align-items-center gap-3">
                <div class="date-icon-wrap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                </div>
                <div v-if="form.dates?.length" class="date-display-list">
                    <span v-for="d in form.dates" :key="d" class="date-display-item">{{ formatDisplayDate(d) }}</span>
                </div>
                <span v-else class="text-muted small">No date selected. Click a time slot on the schedule to book.</span>
            </div>
            <small v-if="dateErrors" class="text-danger mt-1 d-block fw-semibold">{{ dateErrors }}</small>
        </div>

        <div class="row g-3 mb-3">
            <div class="col-md-6">
                <BaseSelect class="w-100" label="Start Time" required placeholder="Select start time" v-model="form.startTime"
                    :options="startTimeOptions" :error="errors.startTime" />
            </div>
            <div class="col-md-6">
                <BaseSelect class="w-100" label="End Time" required placeholder="Select end time" v-model="form.endTime"
                    :options="endTimeOptions" :error="errors.endTime" />
            </div>
        </div>

        <div>
            <BaseInput type="textarea" :rows="3" label="Note" placeholder="Enter any additional details (optional)"
                v-model="form.note" :error="errors.note" />
        </div>
    </form>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseSelect from '@/components/base/BaseSelect.vue';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/users/user';

const authStore = useAuthStore();
const userStore = useUserStore();
const memberOptions = ref([]);

onMounted(async () => {
    if (authStore.isTeacher) {
        await userStore.getAllUsers({ roleId: 3 }); // Fetch Monks (Students)
        memberOptions.value = userStore.users.map(u => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }));
    }
});

const dateErrors = ref('');
const minTimeLimit = ref(null);
const maxTimeLimit = ref(null);
let isPreselecting = false;

const defaultForm = () => ({
    title: '',
    subject: '',
    className: '',
    session: '',
    dates: [],
    startTime: null,
    endTime: null,
    note: '',
    teacherId: null,
});

const form = reactive(defaultForm());
const errors = reactive({});

const sessionOptions = [
    { label: 'Morning', value: 'MORNING' },
    { label: 'Afternoon', value: 'AFTERNOON' },
    { label: 'Evening', value: 'EVENING' },
];

const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0
    const [h, m] = timeStr.split(':').map(Number)
    return h * 60 + m
}

const formatMinToTime = (totalMin) => {
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const generateTimeOptions = (startStr, endStr) => {
    if (!startStr || !endStr) return []
    const start = timeToMinutes(startStr)
    const end = timeToMinutes(endStr)
    const options = []

    let curr = start
    while (curr < end) {
        options.push(formatMinToTime(curr))
        curr += 15
    }
    const finalStr = formatMinToTime(end)
    if (!options.includes(finalStr)) {
        options.push(finalStr)
    }
    return options
}

const format12Hour = (timeStr) => {
    if (!timeStr) return ''
    const [hStr, mStr] = timeStr.split(':')
    let h = parseInt(hStr, 10)
    const m = mStr
    const ampm = h >= 12 ? 'PM' : 'AM'
    h = h % 12
    h = h ? h : 12
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`
}

const activeStartBounds = computed(() => {
    if (minTimeLimit.value && maxTimeLimit.value) {
        return { start: minTimeLimit.value, end: maxTimeLimit.value }
    }
    if (form.session === 'MORNING') return { start: '07:00', end: '12:00' }
    if (form.session === 'AFTERNOON') return { start: '13:00', end: '17:00' }
    if (form.session === 'EVENING') return { start: '17:30', end: '20:30' }
    return { start: '07:00', end: '20:30' }
})

const startTimeOptions = computed(() => {
    const bounds = activeStartBounds.value
    const allTimes = generateTimeOptions(bounds.start, bounds.end)
    return allTimes.slice(0, -1).map(t => ({ label: format12Hour(t), value: t }))
})

const endTimeOptions = computed(() => {
    const bounds = activeStartBounds.value
    const allTimes = generateTimeOptions(bounds.start, bounds.end)
    const startMin = form.startTime ? timeToMinutes(form.startTime) : timeToMinutes(bounds.start)
    return allTimes
        .filter(t => timeToMinutes(t) > startMin)
        .map(t => ({ label: format12Hour(t), value: t }))
})

watch(() => form.session, () => {
    if (isPreselecting) return;
    minTimeLimit.value = null;
    maxTimeLimit.value = null;
    form.startTime = null;
    form.endTime = null;
})

const formatDisplayDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

const formatTimeOnly = (d) => {
    if (!d) return '';
    if (typeof d === 'string') return d;
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

const validateForm = async () => {
    Object.keys(errors).forEach(k => delete errors[k]);
    dateErrors.value = '';
    let valid = true;

    if (!form.title?.trim()) { errors.title = 'Title is required'; valid = false; }
    if (!form.subject?.trim()) { errors.subject = 'Subject is required'; valid = false; }
    if (!form.session) { errors.session = 'Session is required'; valid = false; }
    if (!form.startTime) { errors.startTime = 'Start time is required'; valid = false; }
    if (!form.endTime) { errors.endTime = 'End time is required'; valid = false; }
    if (authStore.isTeacher && !form.teacherId) { errors.teacherId = 'Monk is required'; valid = false; }

    if (form.startTime && minTimeLimit.value) {
        const startStr = formatTimeOnly(form.startTime);
        if (startStr < minTimeLimit.value) {
            errors.startTime = `Start time must be at or after ${minTimeLimit.value}`;
            valid = false;
        }
    }
    if (form.endTime && maxTimeLimit.value) {
        const endStr = formatTimeOnly(form.endTime);
        if (endStr > maxTimeLimit.value) {
            errors.endTime = `End time must be at or before ${maxTimeLimit.value}`;
            valid = false;
        }
    }

    if (form.dates.length === 0) {
        dateErrors.value = 'At least one specific date must be added.';
        valid = false;
    }

    if (valid) {
        return {
            title: form.title.trim(),
            subject: form.subject.trim(),
            className: form.className.trim(),
            session: form.session,
            startTime: formatTimeOnly(form.startTime),
            endTime: formatTimeOnly(form.endTime),
            note: form.note.trim(),
            isRecurring: false,
            dates: form.dates,
            ...(authStore.isTeacher ? { teacherId: form.teacherId } : {})
        };
    }
    return false;
};

const resetForm = () => {
    Object.assign(form, defaultForm());
    Object.keys(errors).forEach(k => delete errors[k]);
    dateErrors.value = '';
    minTimeLimit.value = null;
    maxTimeLimit.value = null;
};

const setFormPreselection = (preselection) => {
    isPreselecting = true;
    resetForm();
    if (preselection) {
        if (preselection.title) form.title = preselection.title;
        if (preselection.subject) form.subject = preselection.subject;
        if (preselection.className) form.className = preselection.className;
        if (preselection.session) form.session = preselection.session;
        if (preselection.startTime) form.startTime = preselection.startTime;
        if (preselection.endTime) form.endTime = preselection.endTime;
        if (preselection.dates) form.dates = [...preselection.dates];
        if (preselection.minTime) minTimeLimit.value = preselection.minTime;
        if (preselection.maxTime) maxTimeLimit.value = preselection.maxTime;
    }
    setTimeout(() => {
        isPreselecting = false;
    }, 0);
};

defineExpose({
    validateForm,
    resetForm,
    setFormPreselection
});
</script>

<style scoped>
.date-display-card {
    background: var(--surface-ground);
    border: 1px solid var(--border-clr);
    border-radius: 10px;
    padding: 12px 16px;
    min-height: 52px;
}

.date-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: var(--primary-color-soft);
    color: var(--primary-color);
    flex-shrink: 0;
}

.date-display-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.date-display-item {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-base);
    background: var(--body-bg-color);
    border: 1px solid var(--border-clr);
    border-radius: 6px;
    padding: 4px 10px;
    letter-spacing: 0.01em;
}
</style>