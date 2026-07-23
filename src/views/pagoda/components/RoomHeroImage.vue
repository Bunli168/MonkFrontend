<template>
  <div class="position-relative overflow-hidden room-swiper-container h-100" style="min-height: 320px;border-radius: var(--border-radius);">
    
    <!-- Floating Back Button -->
    <div class="position-absolute top-0 start-0 p-3" style="z-index: 10;">
      <button @click="$emit('back')" class="btn btn-light shadow-sm rounded-pill px-3 py-2 fw-medium d-flex align-items-center gap-2" style="background: rgba(255,255,255,0.9) !important; backdrop-filter: blur(4px); border: none; font-size: 0.85rem;">
        <ArrowLeft :size="16" class="text-dark" /> Back
      </button>
    </div>

    <Swiper
      v-if="room.images?.length > 0"
      :modules="[SwiperNavigation, SwiperPagination, SwiperAutoplay]"
      :slides-per-view="1"
      :loop="room.images.length > 1"
      :pagination="{ clickable: true }"
      :navigation="{
        prevEl: '.swiper-button-custom-prev',
        nextEl: '.swiper-button-custom-next'
      }"
      :autoplay="{ delay: 4500, disableOnInteraction: false }"
      :speed="800"
      class="w-100 h-100 position-absolute room-swiper"
      style="top:0; left:0;"
    >
       <SwiperSlide v-for="img in room.images" :key="img.id" class="w-100 h-100">
        <img :src="$authImg(img.imageUrl)" class="w-100 h-100 object-fit-cover" />
      </SwiperSlide>
    </Swiper>

    <!-- Custom Lucide Prev/Next Buttons -->
    <template v-if="room.images?.length > 1">
      <button class="swiper-button-custom-prev border-0 d-flex align-items-center justify-content-center">
        <ChevronLeft :size="20" class="text-primary" />
      </button>
      <button class="swiper-button-custom-next border-0 d-flex align-items-center justify-content-center">
        <ChevronRight :size="20" class="text-primary" />
      </button>
    </template>

    <div v-else class="w-100 h-100 position-absolute" style="top:0; left:0;">
      <img :src="coverImg" class="w-100 h-100 object-fit-cover" />
    </div>

    <!-- Floating Badges -->
    <div class="position-absolute top-0 end-0 p-3 d-flex gap-2" style="z-index: 10;">
      <span class="badge rounded-pill bg-light text-dark shadow-sm px-3 py-2 fw-medium" style="background: rgba(255,255,255,0.9) !important; backdrop-filter: blur(4px);">
        <LayoutGrid :size="14" class="me-1" /> {{ formatType(room.type) }}
      </span>
      <span class="badge rounded-pill bg-light text-dark shadow-sm px-3 py-2 fw-medium" style="background: rgba(255,255,255,0.9) !important; backdrop-filter: blur(4px);">
        <Layers :size="14" class="me-1" /> Floor {{ room.floor }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { LayoutGrid, Layers, ChevronLeft, ChevronRight, ArrowLeft } from '@lucide/vue'
import coverImg from '@/assets/images/cover_img.jpg'
import { useTimeFormat } from '@/composables/useTimeFormat'

// Swiper
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation as SwiperNavigation, Pagination as SwiperPagination, Autoplay as SwiperAutoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const props = defineProps({
  room: {
    type: Object,
    required: true
  }
})

defineEmits(['back'])

const { formatType } = useTimeFormat()
</script>

<style scoped>
/* Minimalist Swiper Overrides */
.room-swiper-container :deep(.swiper-pagination-bullet) {
  background: #ffffff !important;
  opacity: 0.5;
  width: 6px;
  height: 6px;
  transition: all 0.3s ease;
}

.room-swiper-container :deep(.swiper-pagination-bullet-active) {
  background: var(--primary-color) !important;
  opacity: 1;
  width: 16px;
  border-radius: 4px;
}

.swiper-button-custom-prev,
.swiper-button-custom-next {
  position: absolute;
  top: 50%;
  color: var(--primary-color) !important;
  opacity: 0;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  width: 38px;
  height: 38px;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  z-index: 10;
  cursor: pointer;
}

.swiper-button-custom-prev {
  left: 0px;
  transform: translateY(-50%);
  transition: opacity 0.3s ease, left 0.3s ease, background-color 0.2s ease, transform 0.2s ease;
}

.swiper-button-custom-next {
  right: 0px;
  transform: translateY(-50%);
  transition: opacity 0.3s ease, right 0.3s ease, background-color 0.2s ease, transform 0.2s ease;
}

.room-swiper-container:hover .swiper-button-custom-prev {
  opacity: 1;
  left: 15px;
}

.room-swiper-container:hover .swiper-button-custom-next {
  opacity: 1;
  right: 15px;
}

.swiper-button-custom-prev:hover,
.swiper-button-custom-next:hover {
  background: #ffffff;
  transform: translateY(-50%) scale(1.08);
}

.swiper-button-custom-prev.swiper-button-disabled,
.swiper-button-custom-next.swiper-button-disabled {
  opacity: 0 !important;
  pointer-events: none;
}
</style>
