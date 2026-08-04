<template>
  <div>
    <h5 class="mb-3">Telegram Notifications</h5>
    <div class="card bg-transparent" style=" border-radius: calc(var(--border-radius) - 1rem);">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div class="d-flex align-items-center gap-2">
          <div class="rounded-circle d-flex align-items-center justify-content-center"
            style="width: 48px; height: 48px; background-color: #229ED9; color: white;">
            <BotMessageSquare size="24" class="d-flex justify-content-center" />
          </div>
          <div>
            <p class="mb-0 small" style="color: var(--success-color);" v-if="isLinked">
              <span class="fw-semibold text-heading">Connected</span>
            </p>
            <p class="mb-0 small" style="color: var(--danger-color);" v-else>
              Not connected
            </p>
            <span class="small">Receive leave requests and system alerts via Telegram.</span>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <BaseButton v-if="isLinked" v-tooltip="'Disconnect bot'" variant="outline-danger" @click="handleUnlink"
            :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-1" role="status"
              aria-hidden="true"></span>
            <div v-else class="d-flex justify-content-center align-items-center">
              <Link2Off :size="18" />
            </div>
          </BaseButton>
          <BaseButton v-tooltip="'Connect bot'" v-else variant="outline-primary" @click="handleLink"
            :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true">
            </span>
            <div v-else class="d-flex justify-content-center align-items-center">
              <Link2 :size="18" />
            </div>
          </BaseButton>
        </div>
      </div>

      <div class="main-divider my-3" v-if="false"></div>

      <BaseModal v-model="showLinkModal" title="Connect Telegram" size="sm">
        <div v-if="!isLinked" class="text-center">
          <div class="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none"
              stroke="#229ED9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
              class="lucide lucide-send">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </div>
          <h5 class="mb-3">Link Your Account</h5>
          <p class="text-muted mb-4">
            Click the button below to securely open Telegram and start a conversation with our bot.
          </p>
          <p class="small text-muted mb-3 p-2 rounded" style="background-color: var(--body-bg-color)">
            Link expires at: <span class="fw-semibold text-primary">{{ formatExpiryDate(telegramExpiry) }}</span>
          </p>
          <div class="mb-3">
            <BaseInput v-model="telegramLink" type="textarea" :rows="1" disabled class="w-100" />
          </div>
          <div class="d-flex gap-2">
            <BaseButton variant="primary" class="flex-grow-1" @click="handleTelegramClick">
              Open Telegram App
            </BaseButton>
            <BaseButton v-tooltip="'Copy link'" variant="outline-primary" @click="copyLink">
              <Copy :size="18" />
            </BaseButton>
          </div>
        </div>
        <div v-else class="text-center">
          <div class="mb-3 d-flex justify-content-center">
            <div class="rounded-circle d-flex align-items-center justify-content-center bg-success-subtle"
              style="width: 64px; height: 64px; color: var(--success-color);">
              <CheckCircle :size="32" />
            </div>
          </div>
          <h5 class="mb-3 text-success">Successfully Linked!</h5>
          <p class="text-muted mb-3">
            Your Telegram account has been successfully connected to your profile.
          </p>
          <BaseButton variant="primary" class="w-100" @click="showLinkModal = false">
            Done
          </BaseButton>
        </div>
      </BaseModal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/users/user';
import { useToastStore } from '@/stores/toast';
import BaseModal from '@/components/base/BaseModal.vue';
import { Copy, CheckCircle, BotMessageSquare, Link2, Link2Off } from '@lucide/vue';

const authStore = useAuthStore();
const userStore = useUserStore();
const toastStore = useToastStore();

const isLoading = ref(false);
const telegramLink = ref(null);
const telegramExpiry = ref(null);
const showLinkModal = ref(false);

const isLinked = computed(() => {
  if (authStore.user?.isTelegramLinked) {
    return true;
  }
  return false;
});

const handleLink = async () => {
  isLoading.value = true;
  telegramLink.value = null;
  telegramExpiry.value = null;

  const data = await userStore.requestTelegramLink();
  if (data?.telegramLink) {
    telegramLink.value = data.telegramLink;
    telegramExpiry.value = data.expiresAt;
    showLinkModal.value = true;

    const pollInterval = setInterval(async () => {
      if (!showLinkModal.value) {
        clearInterval(pollInterval);
        return;
      }
      await authStore.getProfile();
      if (authStore.user?.isTelegramLinked) {
        telegramLink.value = null;
        clearInterval(pollInterval);
      }
    }, 3000);
  }
  isLoading.value = false;
};

const handleUnlink = async () => {
  isLoading.value = true;
  const success = await userStore.unlinkTelegram();
  if (success) {
    await authStore.getProfile();
  }
  isLoading.value = false;
};

const handleTelegramClick = () => {
  if (telegramLink.value) {
    window.open(telegramLink.value, '_blank');
  }
};

const formatExpiryDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const copyLink = () => {
  if (telegramLink.value) {
    navigator.clipboard.writeText(telegramLink.value);
    toastStore.showToast('Link copied to clipboard!', 'success');
  }
};
</script>
