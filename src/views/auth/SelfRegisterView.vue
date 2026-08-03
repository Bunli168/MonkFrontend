<template>
<div>
  <div class="py-4 container-fluid px-2 px-sm-3 px-md-4" style="overflow-x: hidden;">
    <div>
      <!-- Header Area -->
      <div class="d-flex flex-column flex-lg-row justify-content-between align-items-stretch align-items-lg-center mb-4 gap-3">
        <div class="flex-grow-1" style="min-width: 0;">
          <h3 class="fw-bold mb-1 d-block d-sm-flex align-items-baseline gap-1 gap-sm-2" style="color: var(--text-heading-color); word-break: break-word;">
            <span class="d-block">Attendance & Seating</span>
            <span class="text-primary fs-5 fs-sm-4 d-block mt-1 mt-sm-0">/ វត្តមាន និង កៅអី</span>
          </h3>
          <p class="text-muted mb-0 subtitle small" style="word-break: break-word;">Manage your seating registration and absence permissions.</p>
        </div>
        <div class="d-flex flex-column flex-sm-row gap-2 justify-content-lg-end w-100 w-lg-auto mt-3 mt-lg-0">
          <!-- Button Register Seat -->
          <BaseButton type="button" @click="showRegisterModal = true" variant="outline" class="d-flex align-items-center justify-content-center gap-2 py-2 px-3 flex-fill w-100 w-sm-auto">
            <Armchair :size="18" class="flex-shrink-0 text-primary" />
            <span class="text-truncate fw-medium" style="max-width: 250px;">
              {{ hasRegisteredSeat ? `Seat: Row ${authStore.user?.profile?.seating_row?.row_num || ''} - Seat ${authStore.user?.profile?.seat_number || ''}` : 'Register Seat / ចុះឈ្មោះកៅអី' }}
            </span>
          </BaseButton>
          
          <!-- Button Leave Request -->
          <BaseButton type="button" @click="handleLeaveRequestClick" variant="primary" class="d-flex align-items-center justify-content-center gap-2 py-2 px-3 flex-fill shadow-sm w-100 w-sm-auto">
            <CalendarRange :size="18" class="flex-shrink-0" />
            <span class="fw-medium">Leave Request / ស្នើសុំច្បាប់</span>
          </BaseButton>
        </div>
      </div>

      <!-- Summary Cards -->
      <div v-if="summary" class="row g-2 mb-3">
        <!-- Permission Count -->
        <div class="col-12 col-md-4">
          <div class="px-3 py-2 border bg-white d-flex align-items-center justify-content-center justify-content-sm-start gap-2 shadow-sm w-100" style="border-radius: var(--border-inner-radius); border-color: rgba(var(--bs-primary-rgb), 0.3) !important;">
            <CalendarRange class="text-primary" :size="18" />
            <span class="small fw-medium text-muted">Permission:</span>
            <span class="fw-bold text-dark text-nowrap">{{ summary.permission || 0 }} <small class="text-muted fw-normal">days</small></span>
          </div>
        </div>
        
        <!-- Absent Count -->
        <div class="col-12 col-md-4">
          <div class="px-3 py-2 border bg-white d-flex align-items-center justify-content-center justify-content-sm-start gap-2 shadow-sm w-100" style="border-radius: var(--border-inner-radius); border-color: rgba(var(--bs-danger-rgb), 0.3) !important;">
            <AlertCircle class="text-danger" :size="18" />
            <span class="small fw-medium text-muted">Absent:</span>
            <span class="fw-bold text-dark text-nowrap">{{ summary.absent || 0 }} <small class="text-muted fw-normal">days</small></span>
          </div>
        </div>

        <!-- Fine Amount -->
        <div class="col-12 col-md-4">
          <div class="px-3 py-2 border bg-white d-flex align-items-center justify-content-center justify-content-sm-start gap-2 shadow-sm w-100" style="border-radius: var(--border-inner-radius); border-color: rgba(var(--bs-warning-rgb), 0.3) !important; background-color: #fffdf5 !important;">
            <Coins style="color: #b8860b;" :size="18" />
            <span class="small fw-medium text-muted">Fine:</span>
            <span class="fw-bold text-dark text-nowrap"><small class="text-muted fw-normal">$</small>{{ Number(summary.fine || 0).toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- Tabs System for Absences and Leave Requests -->
      <Tabs v-model:value="activeTab" scrollable class="card gap-2 p-2 p-sm-3 border-0 shadow-sm rounded-4 overflow-hidden" style="background-color: var(--surface-card); width: 100%; max-width: 100%;">
        <div class="border-bottom pb-2" style="overflow-x: auto;">
          <TabList>
            <Tab value="absences" class="py-2 px-3">
              <div class="d-flex align-items-center gap-2 fw-medium text-nowrap">
                <AlertCircle style="color: var(--danger-color);" :size="16" class="flex-shrink-0" />
                <span :class="{'d-none d-md-inline': activeTab !== 'absences'}">Absent & Permission / អវត្តមាន និង ច្បាប់</span>
              </div>
            </Tab>
            <Tab value="leave-requests" class="py-2 px-3">
              <div class="d-flex align-items-center gap-2 fw-medium text-nowrap">
                <CalendarRange style="color: var(--primary-color);" :size="16" class="flex-shrink-0" />
                <span :class="{'d-none d-md-inline': activeTab !== 'leave-requests'}">Leave Request History / ប្រវត្តិនៃការសុំច្បាប់</span>
              </div>
            </Tab>
          </TabList>
        </div>
        <TabPanels class="p-0 bg-transparent mt-2">
          <!-- Tab 1: Absent & Permission Table -->
          <TabPanel value="absences">
            <BaseTable 
              :columns="attendanceColDefs" 
              :rows="dailyAttendances" 
              :totalRecords="dailyAttendances.length"
              :loading="isAttendancesLoading"
              :show-index="true"
            >
              <template #date="{ data: row }">
                <span style="white-space: nowrap;">{{ row.dateDisplay || formatDate(row.date) }}</span>
              </template>
              <template #status="{ data: row }">
                <BaseBadge v-if="row.status" :status="row.status.toUpperCase()" :label="row.status === 'permission' ? 'Permission' : 'Absent'" />
              </template>
              <template #duration="{ data: row }">
                <span>{{ row.duration }}</span>
              </template>
              <template #notes="{ data: row }">
                <span>{{ row.notes || '—' }}</span>
              </template>
            </BaseTable>
          </TabPanel>

          <!-- Tab 2: Leave Request History Table -->
          <TabPanel value="leave-requests">
            <BaseTable 
              :columns="colDefs" 
              :rows="myRequests" 
              :totalRecords="myRequests.length"
              :loading="isLoading"
              :show-index="true"
            >
              <template #date_range="{ data: row }">
                <span>{{ formatDate(row.start_date) }} <ArrowRight class="text-muted mx-1" :size="14" /> {{ formatDate(row.end_date) }}</span>
              </template>
              <template #attachment="{ data: row }">
                <div class="d-flex justify-content-start align-items-center">
                  <a v-if="row.image_url" href="#" @click.prevent="openImageModal(`http://localhost:3006${row.image_url}`)" class="d-block" title="Click to view full image">
                    <img :src="`http://localhost:3006${row.image_url}`" alt="Leave Attachment" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; cursor: pointer; transition: transform 0.2s ease;" class="shadow-sm border border-secondary border-opacity-25 attachment-thumbnail" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
                  </a>
                  <span v-else class="text-muted fst-italic">-</span>
                </div>
              </template>
              <template #status="{ data: row }">
                <BaseBadge v-if="row.status" :status="getBadgeStatusColor(row.status)" :label="formatStatus(row.status)" />
              </template>
              <template #approved_by="{ data: row }">
                <span v-if="row.Approver && row.status !== 'pending'" class="text-muted">
                  {{ row.Approver.UserProfile?.first_name_kh || '' }} {{ row.Approver.UserProfile?.last_name_kh || '' }}
                </span>
                <span v-else class="text-muted fst-italic">N/A</span>
              </template>
              <template #actions="{ data: row }">
                <BaseActionMenu v-if="getActionItems(row).length > 0" :items="getActionItems(row)" />
              </template>
            </BaseTable>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>

  <!-- Image Viewer Modal -->
  <BaseModal v-model="isImageModalOpen" title="Attachment View" size="lg">
    <div class="text-center p-0">
      <img v-if="currentImageModalUrl" :src="currentImageModalUrl" class="img-fluid rounded shadow" style="max-height: 70vh;" alt="Attachment View" />
    </div>
  </BaseModal>

  <!-- Dialog Seating Registration -->
  <BaseModal v-model="showRegisterModal" title="Seating Registration / ចុះឈ្មោះកៅអី" size="md">
    <form @submit.prevent="submitRegistration" class="row g-4 form-container py-2">
      <div class="col-md-6 form-group">
        <label class="form-label custom-label">Seating Row</label>
        <div class="input-wrapper">
          <select v-model="form.seating_row_id" class="custom-select" :disabled="!rows.length || hasRegisteredSeat" required>
            <option value="" disabled selected>Select your row</option>
            <option v-for="row in rows" :key="row.id" :value="row.id">Row {{ row.row_num }}</option>
          </select>
        </div>
      </div>

      <div class="col-md-6 form-group">
        <label class="form-label custom-label">Seat Number</label>
        <div class="input-wrapper">
          <select v-model="form.seat_number" class="custom-select" :disabled="!form.seating_row_id || selectedRowCapacity === 0 || hasRegisteredSeat" required>
            <option value="" disabled selected>Select your seat</option>
            <option v-for="n in selectedRowCapacity" :key="n" :value="n" :disabled="takenSeats.includes(n)">
              Seat {{ n }} {{ takenSeats.includes(n) ? '(Taken)' : '' }}
            </option>
          </select>
          <div v-if="form.seating_row_id && selectedRowCapacity === 0" class="form-text text-warning mt-1" style="font-size: 0.8rem;">
            No seats available in this row.
          </div>
        </div>
      </div>

      <div class="col-12 mt-4" v-if="hasRegisteredSeat">
        <div class="alert alert-info d-flex align-items-center gap-2 mb-0 border-0" style="background-color: var(--surface-ground); color: var(--text-color);">
          <Lock :size="16" class="text-primary" />
          <span>You have successfully registered. To change your seating row or seat number, please contact your Kudi Admin.</span>
        </div>
      </div>

      <div class="col-12 mt-4 text-end" v-if="!hasRegisteredSeat">
        <BaseButton type="submit" variant="primary" :isLoading="isSubmitting" class="btn-premium px-5 py-2">
          <span class="btn-text">{{ isSubmitting ? 'Registering...' : 'Register' }}</span>
        </BaseButton>
      </div>
    </form>
  </BaseModal>

  <!-- Dialog Leave Request -->
  <BaseModal v-model="showLeaveModal" title="New Leave Request / ស្នើសុំច្បាប់ថ្មី" size="md">
    <form @submit.prevent="submitLeaveRequest" class="row g-3 py-2">
      <div class="col-md-6">
        <BaseDatePicker 
          label="Start Date" 
          v-model="leaveForm.start_date" 
          required 
          :minDate="today"
        />
      </div>
      <div class="col-md-6">
        <BaseDatePicker 
          label="End Date" 
          v-model="leaveForm.end_date" 
          required 
          :minDate="leaveForm.start_date || today"
        />
      </div>
      <div class="col-12">
        <label class="form-label fw-medium mt-2">Reason for Leave</label>
        <textarea class="form-control" v-model="leaveForm.reason" rows="3" required placeholder="Please explain why you need to take leave..."></textarea>
      </div>
      <div class="col-12">
        <label class="form-label fw-medium mt-2 mb-3">Attachment (Optional)</label>
        
        <!-- Upload Drop Zone -->
        <div 
          class="border rounded bg-light cursor-pointer text-center py-3 mb-3"
          style="border-style: dashed !important; border-width: 2px !important; border-color: #dee2e6 !important; transition: all 0.2s;"
          @click="fileInput.click()"
          onmouseover="this.classList.add('bg-secondary', 'bg-opacity-10')"
          onmouseout="this.classList.remove('bg-secondary', 'bg-opacity-10')"
        >
          <input type="file" class="d-none" ref="fileInput" @change="handleFileChange" accept="image/*" />
          
          <div class="d-inline-flex align-items-center gap-2 px-3 py-1 border rounded bg-white shadow-sm mb-2 text-dark fw-medium" style="font-size: 0.85rem;">
            <UploadCloud size="16" /> Upload
          </div>
          <div class="text-muted mb-1" style="font-size: 0.8rem;">Choose image or drag & drop it here.</div>
          <div class="text-muted opacity-75" style="font-size: 0.75rem;">JPG, JPEG, PNG. Max 5 MB.</div>
        </div>

        <!-- Thumbnails Row -->
        <div class="d-flex gap-3 flex-wrap">
          <div v-if="leaveForm.imagePreview" class="position-relative shadow-sm rounded overflow-hidden flex-shrink-0" style="width: 110px; height: 140px; border: 1px solid #dee2e6;">
            <img :src="leaveForm.imagePreview" class="w-100 h-100" style="object-fit: cover; cursor: zoom-in;" alt="Preview" @click="openImageModal(leaveForm.imagePreview)" />
            <!-- Remove Button -->
            <div class="position-absolute top-0 end-0 p-1">
              <button type="button" class="btn btn-sm btn-danger rounded-circle shadow-sm" style="padding: 0.15rem 0.35rem; background-color: rgba(220, 53, 69, 0.85); border: none;" @click.stop="leaveForm.image = null; leaveForm.imagePreview = null; if($refs.fileInput) $refs.fileInput.value = '';" title="Remove">
                <i class="bi bi-x" style="font-size: 1rem; line-height: 1;"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 d-flex justify-content-end gap-2 mt-4">
        <button type="button" class="btn btn-light border" @click="showLeaveModal = false">Cancel</button>
        <BaseButton type="submit" variant="primary" :isLoading="isSubmittingLeave" class="btn-premium px-4">
          Submit Request
        </BaseButton>
      </div>
    </form>
  </BaseModal>

  <BaseModal v-model="showConfirmModal" title="Confirm Delete" size="sm">
    <p class="mb-4 text-muted fw-medium">Are you sure you want to delete this leave request?</p>
    <div class="d-flex justify-content-end gap-2">
      <BaseButton type="button" variant="outline" @click="showConfirmModal = false">Cancel</BaseButton>
      <BaseButton type="button" variant="danger" :isLoading="isDeleting" @click="executeDelete">
        Delete
      </BaseButton>
    </div>
  </BaseModal>
</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import api from '@/api/api';
import { socket } from '@/utils/socket';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { Lock, Armchair, CalendarRange, AlertCircle, ClipboardList, ArrowRight, FileEdit, Trash2, Coins, UploadCloud, Maximize2 } from '@lucide/vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseDatePicker from '@/components/base/BaseDatePicker.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import BaseBadge from '@/components/base/BaseBadge.vue';
import BaseActionMenu from '@/components/base/BaseActionMenu.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import * as bootstrap from 'bootstrap';
import { Tab, TabList, TabPanels, TabPanel, Tabs } from 'primevue';

const authStore = useAuthStore();
const toast = useToastStore();

const showRegisterModal = ref(false);
const showLeaveModal = ref(false);
const isSubmitting = ref(false);
const isSubmittingLeave = ref(false);
const isLoading = ref(false);
const isAttendancesLoading = ref(false);
const fileInput = ref(null);

const isEditing = ref(false);
const editId = ref(null);
const showConfirmModal = ref(false);
const isDeleting = ref(false);
const deleteId = ref(null);

const activeTab = ref('absences');

const summary = ref(null);
const rows = ref([]);
const myRequests = ref([]);
const dailyAttendances = ref([]);

// Image Viewer State
const isImageModalOpen = ref(false);
const currentImageModalUrl = ref('');

const getLocalToday = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const today = getLocalToday();

const form = ref({
  seating_row_id: '',
  seat_number: ''
});

const leaveForm = ref({
  start_date: '',
  end_date: '',
  reason: '',
  image: null,
  imagePreview: null
});

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    leaveForm.value.image = file;
    leaveForm.value.imagePreview = URL.createObjectURL(file);
  } else {
    leaveForm.value.image = null;
    leaveForm.value.imagePreview = null;
  }
};

const selectedRowCapacity = ref(0);
const takenSeats = ref([]);

const hasRegisteredSeat = computed(() => {
  return !!(authStore.user?.profile?.seating_row_id || authStore.user?.profile?.seating_row?.id) && 
         !!authStore.user?.profile?.seat_number;
});

const handleLeaveRequestClick = () => {
  if (!hasRegisteredSeat.value) {
    toast.showToast('Please register your row and seat number before submitting a leave request.', 'error');
    showRegisterModal.value = true;
    return;
  }
  showLeaveModal.value = true;
};

const attendanceColDefs = computed(() => {
  return [
    { field: 'date', header: 'Date', sortable: true },
    { field: 'status', header: 'Status', sortable: true },
    { field: 'duration', header: 'Duration / ចំនួនថ្ងៃ', sortable: false },
    { field: 'notes', header: 'Notes / Reason', sortable: false }
  ];
});

const colDefs = computed(() => {
  return [
    { field: 'date_range', header: 'Date Range', sortable: false },
    { field: 'reason', header: 'Reason', sortable: false },
    { field: 'attachment', header: 'Attachment', sortable: false },
    { field: 'status', header: 'Status', sortable: true },
    { field: 'approved_by', header: 'Reviewed By', sortable: false },
    { field: 'actions', header: 'Actions', sortable: false, class: 'text-end' }
  ];
});

const getBadgeStatusColor = (status) => {
  if (!status) return '';
  if (status === 'pending_superadmin' || status === 'pending_mekudi' || status === 'pending') return 'PENDING';
  return status.toUpperCase();
};

const formatStatus = (status) => {
  if (!status) return '';
  if (status === 'pending_superadmin' || status === 'pending_mekudi' || status === 'pending') return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB');
};

const getActionItems = (row) => {
  const items = [];
  if (row.status === 'pending' || row.status === 'pending_mekudi' || row.status === 'pending_superadmin') {
    items.push({
      label: 'Edit',
      icon: FileEdit,
      command: () => editLeave(row),
      iconClass: 'text-primary',
      textClass: 'text-primary'
    });
    items.push({
      label: 'Delete',
      icon: Trash2,
      command: () => confirmDelete(row),
      iconClass: 'text-danger',
      textClass: 'text-danger'
    });
  }
  return items;
};

const editLeave = (row) => {
  isEditing.value = true;
  editId.value = row.id;
  leaveForm.value = {
    start_date: row.start_date,
    end_date: row.end_date,
    reason: row.reason
  };
  showLeaveModal.value = true;
};

const confirmDelete = (row) => {
  deleteId.value = row.id;
  showConfirmModal.value = true;
};

const executeDelete = async () => {
  if (!deleteId.value) return;
  isDeleting.value = true;
  try {
    await api.delete(`/leave-requests/${deleteId.value}`);
    toast.showToast('Leave request deleted successfully', 'success');
    showConfirmModal.value = false;
    deleteId.value = null;
    fetchRequests();
    loadSummary();
  } catch (error) {
    console.error('Delete request error:', error);
    toast.showToast(error.response?.data?.message || 'Failed to delete leave request', 'error');
  } finally {
    isDeleting.value = false;
  }
};

watch(showLeaveModal, (val) => {
  if (!val) {
    isEditing.value = false;
    editId.value = null;
    leaveForm.value = { start_date: '', end_date: '', reason: '', image: null, imagePreview: null };
  }
});

watch(() => form.value.seating_row_id, async (newVal) => {
  if (newVal) {
    const row = rows.value.find(r => String(r.id) === String(newVal));
    if (row) {
      selectedRowCapacity.value = row.capacity;
      try {
        const response = await api.get(`/seating-rows/${row.id}/taken-seats`);
        takenSeats.value = response.data.takenSeats || [];
      } catch (e) {
        console.error('Failed to fetch taken seats', e);
        takenSeats.value = [];
      }
    } else {
      selectedRowCapacity.value = 0;
      takenSeats.value = [];
    }
  } else {
    selectedRowCapacity.value = 0;
    takenSeats.value = [];
  }
});

const loadSummary = async () => {
  try {
    const response = await api.get('/attendances/my-summary');
    summary.value = response.data?.data || null;
  } catch (error) {
    console.error('Failed to load summary', error);
  }
};

const loadRows = async () => {
  try {
    const response = await api.get('/seating-rows');
    rows.value = response.data?.data || response.data || [];
  } catch (error) {
    console.error('Failed to load rows', error);
    rows.value = [];
  }
};

const fetchRequests = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/leave-requests/my');
    myRequests.value = response.data || [];
  } catch (error) {
    console.error('Failed to load leave requests:', error);
    toast.showToast('Failed to load requests', 'error');
  } finally {
    isLoading.value = false;
  }
};

const fetchDailyAttendances = async () => {
  isAttendancesLoading.value = true;
  try {
    const response = await api.get('/attendances', { 
      params: { 
        user_id: authStore.user.id,
      } 
    });
    const list = response.data?.data || response.data || [];
    
    // Group consecutive permission records
    const absencesAndPerms = list.filter(a => a.status === 'absent' || a.status === 'permission');
    absencesAndPerms.sort((a, b) => new Date(a.date) - new Date(b.date));

    const grouped = [];
    let currentGroup = null;

    for (const record of absencesAndPerms) {
      if (record.status === 'absent') {
        grouped.push({ ...record, dateDisplay: formatDate(record.date) });
        currentGroup = null;
      } else if (record.status === 'permission') {
        if (!currentGroup || currentGroup.notes !== record.notes) {
          currentGroup = { ...record, start_date: record.date, end_date: record.date, count: 1 };
          grouped.push(currentGroup);
        } else {
          const prevDate = new Date(currentGroup.end_date);
          const currDate = new Date(record.date);
          const diffTime = Math.abs(currDate - prevDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            currentGroup.end_date = record.date;
            currentGroup.count += 1;
          } else {
            currentGroup = { ...record, start_date: record.date, end_date: record.date, count: 1 };
            grouped.push(currentGroup);
          }
        }
      }
    }

    dailyAttendances.value = grouped.map(g => {
      if (g.status === 'permission' && g.start_date !== g.end_date) {
         g.dateDisplay = `${formatDate(g.start_date)} ➔ ${formatDate(g.end_date)}`;
         g.duration = `${g.count} day(s)`;
      } else if (!g.dateDisplay) {
         g.dateDisplay = formatDate(g.start_date || g.date);
         g.duration = '1 day';
      } else {
         g.duration = '1 day';
      }
      g.sortDate = new Date(g.start_date || g.date).getTime();
      return g;
    }).sort((a, b) => b.sortDate - a.sortDate);

  } catch (error) {
    console.error('Failed to load daily attendances:', error);
  } finally {
    isAttendancesLoading.value = false;
  }
};

const submitRegistration = async () => {
  if (!form.value.seating_row_id || !form.value.seat_number) {
    toast.showToast('Please select both row and seat number', 'error');
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = {
      seating_row_id: Number(form.value.seating_row_id),
      seat_number: String(form.value.seat_number).trim()
    };
    await api.put(`/users/${authStore.user.id}/profile`, payload);
    
    // Refresh user info in authStore
    const userRes = await api.get('/users/me');
    authStore.user = userRes.data?.data || userRes.data;

    toast.showToast('Registration successful.', 'success');
    showRegisterModal.value = false;
  } catch (error) {
    toast.showToast(error.response?.data?.message || 'Failed to update registration', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const formatToYMD = (val) => {
  if (!val) return '';
  if (typeof val === 'string' && val.includes('-')) return val.split('T')[0];
  const d = new Date(val);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const submitLeaveRequest = async () => {
  isSubmittingLeave.value = true;
  try {
    const formData = new FormData();
    formData.append('start_date', formatToYMD(leaveForm.value.start_date));
    formData.append('end_date', formatToYMD(leaveForm.value.end_date));
    formData.append('reason', leaveForm.value.reason);
    if (leaveForm.value.image) {
      formData.append('image', leaveForm.value.image);
    }

    if (isEditing.value && editId.value) {
      await api.put(`/leave-requests/${editId.value}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.showToast('Leave request updated successfully', 'success');
    } else {
      await api.post('/leave-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.showToast('Leave request submitted successfully', 'success');
    }
    
    showLeaveModal.value = false;
    fetchRequests();
    loadSummary();
  } catch (error) {
    console.error('Failed to submit request:', error);
    toast.showToast(error.response?.data?.message || 'Failed to submit request', 'error');
  } finally {
    isSubmittingLeave.value = false;
  }
};

const handleLeaveUpdated = () => {
  fetchRequests();
  fetchDailyAttendances();
  loadSummary();
};

const openImageModal = (url) => {
  currentImageModalUrl.value = url;
  isImageModalOpen.value = true;
};

const closeImageModal = () => {
  isImageModalOpen.value = false;
  setTimeout(() => {
    currentImageModalUrl.value = '';
  }, 300);
};

onMounted(async () => {
  await loadRows();
  await loadSummary();
  await fetchRequests();
  await fetchDailyAttendances();

  const profileUser = authStore.user;
  if (profileUser) {
    const profileRowId = profileUser.profile?.seating_row?.id || profileUser.profile?.seating_row_id;
    if (profileRowId) {
      form.value.seating_row_id = profileRowId.toString();
    }
    if (profileUser.profile?.seat_number) {
      form.value.seat_number = String(profileUser.profile.seat_number);
    }
  }

  socket.on('leave_request_updated', handleLeaveUpdated);
});

onUnmounted(() => {
  socket.off('leave_request_updated', handleLeaveUpdated);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.subtitle {
  font-size: 0.95rem;
  font-family: 'Inter', sans-serif;
}

.custom-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.input-wrapper {
  position: relative;
}

.custom-select {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  color: var(--text-color);
  background: var(--surface-ground);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s ease;
  outline: none;
}

.custom-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 20%, transparent);
}

.custom-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}

.btn-premium {
  font-weight: 500;
  border-radius: 8px;
  background-color: var(--primary-color);
  border: none;
}

.btn-premium:hover {
  background-color: color-mix(in srgb, var(--primary-color) 80%, black);
}

/* PrimeVue Active Tab Styling (Pill Style like Navbar) */
:deep(.p-tablist-tab-list) {
  border-bottom: none !important;
}

:deep(.p-tablist-tab-list .p-tab),
:deep(.p-tab) {
  border: none !important;
  border-radius: 8px !important;
  color: var(--text-muted) !important;
  background-color: transparent !important;
  padding: 0.6rem 1rem !important;
  margin-right: 0.5rem !important;
  transition: all 0.2s ease;
}

:deep(.p-tablist-tab-list .p-tab:hover),
:deep(.p-tab:hover) {
  background-color: var(--surface-hover) !important;
}

:deep(.p-tablist-tab-list .p-tab[aria-selected="true"]),
:deep(.p-tab.p-tab-active),
:deep(.p-tab-active) {
  background-color: rgba(var(--bs-primary-rgb), 0.1) !important;
  color: var(--primary-color) !important;
  font-weight: 600 !important;
}
</style>
