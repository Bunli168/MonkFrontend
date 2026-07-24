<template>
    <div class="card" style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius)">
        <div class="row g-0">
            <div class="col-12 d-flex align-items-center justify-content-center p-4" style="max-height: 300px;">
                <img class="object-fit-cover w-100 h-100"
                    :src="avatarUrl"
                    alt="User Avatar">
            </div>

            <div class="col-12">
                <div class="card-body">
                    <div class="d-flex flex-wrap justify-content-between align-items-start">
                        <div>
                            <h4 class="card-title mb-3">
                                {{ displayName }}
                            </h4>
                            <h6 class="card-subtitle text-muted text-capitalize">
                                {{ displayRole || 'No Role Assigned' }}
                            </h6>
                        </div>
                        <span class="badge rounded-pill" :class="user?.isActive ? 'bg-success' : 'bg-secondary'">
                            {{ user?.isActive ? 'Active' : 'Inactive' }}
                        </span>
                    </div>

                    <hr>

                    <ul class="ps-0">
                        <li class="list-group-item px-0 py-1 border-0">
                            <strong class="text-secondary me-2">Email:</strong>
                            <a :href="`mailto:${user?.email}`" class="text-decoration-none text-primary">{{ user?.email }}</a>
                        </li>

                        <template v-if="user?.UserProfile || user?.profile">
                            <li class="list-group-item px-0 py-1 border-0">
                                <strong class="text-secondary me-2">Phone:</strong> {{ user?.UserProfile?.phone_number || user?.profile?.phone || 'N/A' }}
                            </li>
                            <li class="list-group-item px-0 py-1 border-0 text-capitalize">
                                <strong class="text-secondary me-2">Gender:</strong> {{ user?.UserProfile?.gender || user?.profile?.gender || 'N/A' }}
                            </li>
                            <li class="list-group-item px-0 py-1 border-0">
                                <strong class="text-secondary me-2">DOB:</strong> {{ formatDate(user?.UserProfile?.date_of_birth || user?.dob || user?.profile?.dateOfBirth) || 'N/A' }}
                            </li>
                            <li class="list-group-item px-0 py-1 border-0">
                                <strong class="text-secondary me-2">Chhaya ID:</strong> {{ user?.UserProfile?.chhaya_number || 'N/A' }}
                            </li>
                            <li class="list-group-item px-0 py-1 border-0">
                                <strong class="text-secondary me-2">School / University:</strong> {{ user?.UserProfile?.university_name || user?.profile?.university_name || 'N/A' }}
                            </li>
                            <li class="list-group-item px-0 py-1 border-0">
                                <strong class="text-secondary me-2">Year:</strong> {{ user?.UserProfile?.university_year ? 'Year ' + user?.UserProfile?.university_year : (user?.profile?.university_year ? 'Year ' + user?.profile?.university_year : 'N/A') }}
                            </li>
                            <li class="list-group-item px-0 py-1 border-0">
                                <strong class="text-secondary d-block mb-1">Wat Origin / មកពិវត្តណា:</strong>
                                <div class="ps-3 text-muted" style="font-size: 0.9rem;">
                                    <div><strong class="text-secondary">From Wat:</strong> {{ user?.UserProfile?.from_wat || user?.profile?.from_wat || 'N/A' }}</div>
                                    <div><strong class="text-secondary">Village:</strong> {{ getBirthAddressField(user, 'village') || 'N/A' }}</div>
                                    <div><strong class="text-secondary">Commune:</strong> {{ getBirthAddressField(user, 'commune') || 'N/A' }}</div>
                                    <div><strong class="text-secondary">District:</strong> {{ getBirthAddressField(user, 'district') || 'N/A' }}</div>
                                    <div><strong class="text-secondary">Province:</strong> {{ getBirthAddressField(user, 'province') || 'N/A' }}</div>
                                </div>
                            </li>
                            <li class="list-group-item px-0 py-1 border-0">
                                <strong class="text-secondary d-block mb-1">Bio:</strong>
                                <p class="mb-0 text-muted small">{{ user?.UserProfile?.bio || user?.profile?.bio || 'No biography provided.' }}
                                </p>
                            </li>
                        </template>

                        <li v-else class="list-group-item px-0 py-2 border-0 text-muted fst-italic small">
                            Detailed profile data is currently unavailable.
                        </li>
                    </ul>


                </div>
            </div>
        </div>
    </div>


</template>

<script setup>
import { ref, computed } from 'vue';
import { formatDate } from '@/utils/dateFormat.js';
import { getAuthImageUrl } from '@/utils/imageUrl.js';
import { BookOpen } from '@lucide/vue';
import BaseButton from '@/components/base/BaseButton.vue';


const props = defineProps({
    user: {
        type: Object,
        required: true,
        default: () => ({})
    }
});

const showBiographySurveyModal = ref(false);

const displayName = computed(() => {
    if (!props.user) return '';
    const profile = props.user.UserProfile || props.user.profile;
    if (profile) {
        const khName = `${profile.last_name_kh || ''} ${profile.first_name_kh || ''}`.trim();
        if (khName) return khName;
        const enName = `${profile.first_name_en || ''} ${profile.last_name_en || ''}`.trim();
        if (enName) return enName;
    }
    if (props.user.firstName || props.user.lastName) {
        return `${props.user.lastName || ''} ${props.user.firstName || ''}`.trim();
    }
    return props.user.email || '';
});

const displayRole = computed(() => {
    if (!props.user) return '';
    return props.user.Role?.name || props.user.role?.name || '';
});

const avatarUrl = computed(() => {
    if (!props.user) return '';
    const profile = props.user.UserProfile || props.user.profile;
    const url = profile?.avatar_url || profile?.avatarUrl;
    if (url) return getAuthImageUrl(url);
    const initials = displayName.value ? displayName.value.split(/\s+/).map(n => n[0]).join('+') : 'U';
    return `https://ui-avatars.com/api/?name=${initials}&background=random`;
});

const getBirthAddressField = (user, field) => {
    if (!user || !user.Addresses) return '';
    const addr = user.Addresses.find(a => a.address_type === 'birth_place');
    return addr ? addr[field] : '';
};
</script>