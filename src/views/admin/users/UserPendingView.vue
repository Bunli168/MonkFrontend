<template>
    <div class="d-flex flex-column gap-2 h-100">
        <div class="card p-2" style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius);">
            <div class="d-flex flex-wrap align-items-center justify-content-end gap-2">
                <div class="d-flex align-items-center gap-2 flex-grow-1 search-sort-container" style="min-width: 250px;">
                    <div class="flex-grow-1 search-container">
                        <BaseInput 
                            v-model="searchAndFilter.searchQuery.value" 
                            placeholder="Search pending users..." 
                            :prefixIcon="Search"
                            clearable
                        />
                    </div>
                    <BaseButton 
                        type="button" 
                        variant="outline-primary" 
                        @click="toggleSortDir"
                        v-tooltip="searchAndFilter.filters.value.sortDir === 'desc' ? 'Sort: Newest First' : 'Sort: Oldest First'"
                        class="h-100 flex-shrink-0"
                    >
                        <ClockArrowDown v-if="searchAndFilter.filters.value.sortDir === 'desc'" :size="18" />
                        <ClockArrowUp v-else :size="18" />
                    </BaseButton>
                </div>
            </div>
        </div>

        <UserPendingSkeleton v-if="userStore.isLoading || isInitialLoad" :count="6" />
        <div v-else-if="!userStore.pendingUsers?.length">
            <DashboardEmptyData 
                title="No Pending Users" 
                description="There are currently no users waiting for email verification." 
            />
        </div>
        <div v-else class="row g-2">
            <div class="col-lg-4 col-md-6" v-for="pendingUser in userStore.pendingUsers" :key="pendingUser.id || pendingUser.email">
                <div class="card gap-2 p-2"
                    style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius) !important;">
                    <div class="card-header d-flex bg-transparent align-items-center justify-content-between">
                        <MailWarning class="d-flex" :size="18" style="color: var(--warning-color);" />
                        <span class="small">Created At : {{ formatDate(pendingUser.createdAt) }}</span>
                    </div>
                    <div class="d-flex align-items-stretch justify-content-between gap-2">
                        <div class="align-content-center text-truncate flex-fill px-3"
                            style="background-color: var(--surface-ground); border-radius: calc(var(--border-inner-radius) - 0.5rem) !important;">
                            {{ pendingUser.email }}
                        </div>
                        <BaseButton @click="toggleConfirm($event, pendingUser.email)" type="button" :variant="resendingEmail === pendingUser.email ? 'warning' : 'outline-warning'"
                            v-tooltip="'Resend Verify Email'">
                            <RefreshCcw :size="18" class="d-flex" />
                        </BaseButton>
                    </div>
                </div>
            </div>
        </div>

        <BaseInfiniteScroll
            v-if="userStore.pendingUsers?.length"
            :is-loading="isLoadingMore"
            :has-more="userStore.pendingPage < (userStore.pendingTotalPages || 1)"
            @load-more="loadMore"
        />

        <BasePopOver ref="confirmPopover">
            <div class=" text-center" style="min-width: 220px;">
                <p class="mb-3 small fw-medium text-muted">Want to resend verification to this email?</p>
                <div class="d-flex gap-2">
                    <BaseButton variant="outline-warning" type="button" class="flex-grow-1" @click="confirmPopover.hide()">
                        Cancel
                    </BaseButton>
                    <BaseButton variant="warning" type="button" class="flex-grow-1" @click="handleResend" :isLoading="isLoading">
                        {{ isLoading ? 'Resending...' : 'Resend' }}
                    </BaseButton>
                </div>
            </div>
        </BasePopOver>
    </div>
</template>

<script setup>
import { useAutoFetch } from '@/composables/useAutoFetch';
import { useUserStore } from '@/stores/users/user';
import { formatDate } from '@/utils/dateFormat';
import DashboardEmptyData from '@/components/common/DashboardEmptyData.vue';
import { MailWarning, RefreshCcw, Search, ClockArrowDown, ClockArrowUp } from '@lucide/vue';
import { ref } from 'vue';
import UserPendingSkeleton from '@/components/skeletons/UserPendingSkeleton.vue';
import BaseInfiniteScroll from '@/components/base/BaseInfiniteScroll.vue';
import { useSearchAndFilter } from '@/composables/common/useSearchAndFilter.js';

const userStore = useUserStore();
const confirmPopover = ref();
const isLoading = ref(false);
const isLoadingMore = ref(false);
const isInitialLoad = ref(true);
const resendingEmail = ref(null);

const toggleSortDir = () => {
    searchAndFilter.filters.value.sortDir = searchAndFilter.filters.value.sortDir === 'desc' ? 'asc' : 'desc';
};

const toggleConfirm = (event, email) => {
    resendingEmail.value = email;
    confirmPopover.value.toggle(event);
}

const handleResend = async () => {
    if (!resendingEmail.value) return;
    isLoading.value = true;
    await userStore.resendVerificationEmail({ email: resendingEmail.value });
    isLoading.value = false;
    resendingEmail.value = null;
    confirmPopover.value.hide();
}

const handleFilterChange = async (filters) => {
    userStore.pendingSearch = filters.search;
    userStore.pendingSortDir = filters.sortDir;
    userStore.pendingPage = 1;
    await userStore.getAllPendingUsers({ showLoading: true });
};

const searchAndFilter = useSearchAndFilter(
    { sortDir: userStore.pendingSortDir },
    handleFilterChange
);

const loadMore = async () => {
    if (userStore.pendingPage >= (userStore.pendingTotalPages || 1) || isLoadingMore.value) return;
    isLoadingMore.value = true;
    userStore.pendingPage++;
    await userStore.getAllPendingUsers({ append: true });
    isLoadingMore.value = false;
};

useAutoFetch(async () => {
    userStore.pendingSearch = searchAndFilter.searchQuery.value;
    userStore.pendingSortDir = searchAndFilter.filters.value.sortDir;
    userStore.pendingPage = 1;
    await userStore.getAllPendingUsers({ showLoading: true });
    isInitialLoad.value = false;
});
</script>

<style scoped>
@media (min-width: 768px) {
    .search-container {
        max-width: 300px;
    }
}
</style>
