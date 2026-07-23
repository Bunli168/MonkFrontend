<template>
  <div class="infinite-scroll-container w-100" ref="sentinel">
    <div v-if="isLoading" class="w-100">
      <slot name="loader">
        <div class="d-flex align-items-center justify-content-center text-muted py-3">
          <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
          <span class="fw-medium small">Loading more...</span>
        </div>
      </slot>
    </div>
    <div v-else-if="!hasMore" class="text-muted small fw-medium text-center">
      <slot name="no-more"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: false
  },
  rootMargin: {
    type: String,
    default: '0px 0px 400px 0px'
  }
});

const emit = defineEmits(['load-more']);

const sentinel = ref(null);
let observer = null;

const checkIntersection = () => {
  if (!props.isLoading && props.hasMore && sentinel.value) {
    const rect = sentinel.value.getBoundingClientRect();
    if (rect.top <= window.innerHeight + 400) {
      emit('load-more');
    }
  }
};

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry.isIntersecting && !props.isLoading && props.hasMore) {
      emit('load-more');
    }
  }, {
    rootMargin: props.rootMargin
  });

  if (sentinel.value) {
    observer.observe(sentinel.value);
  }

  window.addEventListener('scroll', checkIntersection, { passive: true });
  window.addEventListener('resize', checkIntersection, { passive: true });

  setTimeout(() => {
    checkIntersection();
  }, 200);
});

watch(() => props.hasMore, (newVal) => {
  if (newVal && !props.isLoading) {
    setTimeout(() => {
      checkIntersection();
    }, 150);
  }
});

watch(() => props.isLoading, (newLoading, oldLoading) => {
  if (oldLoading && !newLoading && props.hasMore) {
    setTimeout(() => {
      checkIntersection();
    }, 150);
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  window.removeEventListener('scroll', checkIntersection);
  window.removeEventListener('resize', checkIntersection);
});
</script>
