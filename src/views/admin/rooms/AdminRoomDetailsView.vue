<template>
  <div class="admin-room-details-view mx-auto w-100" style="max-width: 950px;">
    <!-- Back Header -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div class="d-flex align-items-center gap-2">
        <School class="text-success" :size="22" />
        <h4 class="fw-bold mb-0" style="color: var(--text-heading-color); letter-spacing: -0.02em;">Room Details & Images</h4>
      </div>
      <BaseButton variant="outline-primary" @click="emit('close')" class="btn btn-sm">
        Back to List
      </BaseButton>
    </div>

    <div v-if="isLoadingDetails" class="text-center py-5">
      <div class="spinner-border text-primary animate-spin" role="status"></div>
      <p class="mt-2 text-muted">Loading room details...</p>
    </div>

    <div v-else-if="room" class="row g-4">
      <!-- Left Column: Details Overview -->
      <div class="col-md-5">
        <div class="card p-4 h-100 border-0 shadow-sm" style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius);">
          <h5 class="fw-bold mb-3 pb-2 border-bottom" style="color: var(--text-heading-color);">Room Information</h5>
          
          <div class="d-flex flex-column gap-3">
            <div>
              <span class="text-muted small d-block">Room Name</span>
              <span class="fw-semibold" style="color: var(--text-heading-color);">{{ room.name }}</span>
            </div>
            <div>
              <span class="text-muted small d-block">Room Code</span>
              <span class="fw-semibold">{{ room.code }}</span>
            </div>
            <div>
              <span class="text-muted small d-block">Building & Floor</span>
              <span class="fw-semibold">{{ room.building }} · Floor {{ room.floor }}</span>
            </div>
            <div>
              <span class="text-muted small d-block">Capacity</span>
              <span class="fw-semibold">{{ room.capacity }} Seats</span>
            </div>
            <div>
              <span class="text-muted small d-block">Room Type</span>
              <span class="badge bg-secondary text-white">{{ formatType(room.type) }}</span>
            </div>
            <div>
              <span class="text-muted small d-block">Description</span>
              <p class="mb-0 text-muted lh-sm">{{ room.description || 'No description provided.' }}</p>
            </div>
            <div>
              <span class="text-muted small d-block mb-1">Facilities</span>
              <div class="d-flex flex-wrap gap-1">
                <span v-for="f in parseFacilities(room.facilities)" :key="f" class="badge bg-light text-dark border px-2 py-1">
                  {{ f }}
                </span>
                <span v-if="!parseFacilities(room.facilities).length" class="text-muted small">None</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Image Management -->
      <div class="col-md-7">
        <div class="card p-4 h-100 border-0 shadow-sm" style="background-color: var(--body-bg-color); border-radius: var(--border-inner-radius);">
          <h5 class="fw-bold mb-3 pb-2 border-bottom" style="color: var(--text-heading-color);">Manage Room Images</h5>

          <!-- Loading/Action Indicator -->
          <div v-if="isMutatingImage" class="alert alert-info py-2 d-flex align-items-center gap-2 mb-3">
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span class="small">Updating images, please wait...</span>
          </div>

          <!-- Existing Images Grid -->
          <div class="mb-4">
            <h6 class="fw-bold mb-3 text-xs text-uppercase tracking-wider text-muted">Current Images ({{ room.images?.length || 0 }} / 3)</h6>
            
            <div v-if="!room.images?.length" class="text-center py-4 border rounded-3 bg-light text-muted">
              <ImageIcon :size="32" class="opacity-50 mb-2" />
              <p class="small mb-0">No images uploaded for this room.</p>
            </div>

            <div v-else class="row g-3">
              <div v-for="img in room.images" :key="img.id" class="col-6 col-sm-4">
                <!-- Clean minimalist full image card with hover close button -->
                <div class="card overflow-hidden border-0 shadow-sm position-relative image-card" style="height: 130px; border-radius: var(--border-inner-radius);">
                  <!-- Delete button overlaid in top-right corner -->
                  <button 
                    class="btn btn-light delete-img-btn position-absolute top-0 end-0 m-2 p-0 d-flex align-items-center justify-content-center" 
                    style="z-index: 10; border-radius: 6px; width: 28px; height: 28px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); background-color: rgba(255, 255, 255, 0.7); backdrop-filter: blur(4px); border: 1px solid rgba(255, 255, 255, 0.3) !important; transition: all 0.2s;"
                    title="Delete Image" 
                    @click.stop="confirmDeleteImage(img.id)"
                  >
                    <X :size="14" class="text-dark" stroke-width="2.5" />
                  </button>

                  <!-- PrimeVue Image component with native preview taking full card height -->
                  <Image 
                    :src="$authImg(img.imageUrl)" 
                    preview 
                    imageClass="w-100 h-100 object-fit-cover" 
                    class="w-100 h-100" 
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Instant Upload Section -->
          <div class="border-top pt-3">
            <h6 class="fw-bold mb-2 text-xs text-uppercase tracking-wider text-muted">Upload New Images</h6>
            
            <div v-if="room.images?.length >= 3" class="alert alert-warning py-3 d-flex align-items-center justify-content-center mb-0 text-center">
              <span class="small fw-semibold">Maximum limit of 3 images reached. Delete an existing image to upload new ones.</span>
            </div>
            
            <div v-else class="upload-dropzone p-4 text-center rounded-3 border-2 border-dashed d-flex flex-column align-items-center justify-content-center"
                 @dragover.prevent
                 @drop.prevent="onFileDrop"
                 style="cursor: pointer;"
                 @click="triggerUploadInput">
              <UploadCloud :size="36" class="text-primary mb-2 opacity-75" />
              <span class="fw-semibold text-sm">Drag & drop files or click to browse</span>
              <span class="text-muted small mt-1">Accepts images up to 5MB each (Max 3 files per upload)</span>
              
              <input type="file" ref="newUploadInput" accept="image/*" multiple class="d-none" @change="onFilesSelected" />
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Custom Modal Dialog instead of native alert/confirm -->
    <BaseModal v-model="showDeleteConfirmModal" title="Confirm Delete Image" size="sm">
      <div class="text-center p-3">
        <p class="mb-4 text-muted fw-medium">Are you sure you want to delete this room image?</p>
        <div class="d-flex gap-2">
          <BaseButton variant="outline-primary" class="flex-grow-1" @click="showDeleteConfirmModal = false">
            Cancel
          </BaseButton>
          <BaseButton variant="danger" class="flex-grow-1" @click="executeDeleteImage" :isLoading="isMutatingImage">
            Delete
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoomStore } from '@/stores/rooms/room';
import { School, Image as ImageIcon, X, UploadCloud } from '@lucide/vue';
import BaseButton from '@/components/base/BaseButton.vue';
import Image from 'primevue/image';

const props = defineProps({
  roomId: {
    type: [String, Number],
    required: true
  }
});

const emit = defineEmits(['close']);

const roomStore = useRoomStore();
const room = ref(null);
const isLoadingDetails = ref(true);
const isMutatingImage = ref(false);

const newUploadInput = ref(null);

// ─── Custom Modal Confirm state ──────────────────────────────────────────────
const showDeleteConfirmModal = ref(false);
const imageIdToDelete = ref(null);

const loadRoomDetails = async () => {
  isLoadingDetails.value = true;
  const ok = await roomStore.getRoomById(props.roomId);
  if (ok && roomStore.roomDetails) {
    room.value = roomStore.roomDetails;
  }
  isLoadingDetails.value = false;
};

const formatType = (type) => {
  if (!type) return '—';
  return type.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
};

const parseFacilities = (fac) => {
  if (!fac || fac === '-') return [];
  return fac.split(',').map(f => f.trim()).filter(Boolean);
};

// ─── Trigger upload browser dialog ───────────────────────────────────────────
const triggerUploadInput = () => {
  if (newUploadInput.value) {
    newUploadInput.value.click();
  }
};

const onFilesSelected = async (e) => {
  const currentCount = room.value?.images?.length || 0;
  if (currentCount >= 3) return;
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  await uploadFiles(files);
};

const onFileDrop = async (e) => {
  const currentCount = room.value?.images?.length || 0;
  if (currentCount >= 3) return;
  const files = Array.from(e.dataTransfer.files || []);
  if (!files.length) return;
  await uploadFiles(files);
};

// ─── Instant Upload function ────────────────────────────────────────────────
const uploadFiles = async (files) => {
  const currentCount = room.value?.images?.length || 0;
  const maxAllowed = 3 - currentCount;
  if (maxAllowed <= 0) return;

  isMutatingImage.value = true;
  try {
    const formData = new FormData();
    // limit to remaining slots max (max 3 total images)
    files.slice(0, maxAllowed).forEach(file => {
      formData.append('roomImages', file);
    });

    const ok = await roomStore.createRoomImage(props.roomId, formData);
    if (ok) {
      await loadRoomDetails();
    }
  } finally {
    isMutatingImage.value = false;
  }
};

// ─── Custom Modal Confirm Delete ─────────────────────────────────────────────
const confirmDeleteImage = (imageId) => {
  imageIdToDelete.value = imageId;
  showDeleteConfirmModal.value = true;
};



const executeDeleteImage = async () => {
  if (!imageIdToDelete.value) return;
  
  isMutatingImage.value = true;
  try {
    const ok = await roomStore.deleteRoomImage(props.roomId, imageIdToDelete.value);
    if (ok) {
      showDeleteConfirmModal.value = false;
      imageIdToDelete.value = null;
      await loadRoomDetails();
    }
  } finally {
    isMutatingImage.value = false;
  }
};

onMounted(async () => {
  await loadRoomDetails();
});
</script>

<style scoped>
.image-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.upload-dropzone {
  border: 1.5px dashed var(--border-clr);
  background-color: var(--surface-ground);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.upload-dropzone:hover {
  border-color: var(--primary-color);
  background-color: var(--primary-color-soft);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.delete-img-btn {
  transition: all 0.2s ease;
}

.delete-img-btn:hover {
  background-color: var(--danger-color) !important;
  border-color: var(--danger-color) !important;
}

.delete-img-btn:hover :deep(svg),
.delete-img-btn:hover svg {
  color: white !important;
}
</style>
