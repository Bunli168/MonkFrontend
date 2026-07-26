<template>
  <div class="ledger-container">
    <!-- Header -->
    <div class="card p-3 mb-3 border-0 shadow-sm" style="background-color: var(--surface-card);">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h5 class="mb-0 fw-bold" style="color: var(--text-heading-color);">Fine Ledger & Payments</h5>
          <small class="text-muted">Showing monks with outstanding fines</small>
        </div>
        <div class="d-flex gap-2 align-items-center">
          <!-- Season Dropdown -->
          <select v-model="selectedSeasonId" @change="fetchLedger" class="form-select" style="max-width: 200px;" v-if="seasons.length > 0">
            <option v-for="season in seasons" :key="season.id" :value="season.id">
              {{ season.name }}
            </option>
          </select>
          
          <input type="text" v-model="searchQuery" class="form-control" placeholder="Search by name..." style="max-width: 220px;">
          <!-- Toggle to also show non-fined monks -->
          <div class="form-check form-switch mb-0 d-flex align-items-center gap-2 ms-2">
            <input class="form-check-input" type="checkbox" id="showAllToggle" v-model="showAll" role="switch">
            <label class="form-check-label text-muted small" for="showAllToggle">Show all monks</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Summary Grid -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-md-4">
        <div class="card stat-card h-100 p-3 p-xl-4 rounded-4 shadow-sm border-0 position-relative overflow-hidden" style="background-color: var(--surface-card);">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <span class="text-muted fw-bold text-uppercase small" style="letter-spacing: 0.5px;">Fined (Red)</span>
            <div class="icon-box bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center" style="width: 45px; height: 45px;">
              <i class="fas fa-exclamation-circle fs-5"></i>
            </div>
          </div>
          <h2 class="fw-bold mb-1" style="color: var(--text-heading-color);">
            {{ redCount }}
          </h2>
          <div class="d-flex align-items-center gap-2 mt-2">
            <span class="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-1 small fw-medium">
              <i class="fas fa-bell me-1"></i>Action Req.
            </span>
            <span class="text-muted small">Monks with active fines</span>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card stat-card h-100 p-3 p-xl-4 rounded-4 shadow-sm border-0 position-relative overflow-hidden" style="background-color: var(--surface-card);">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <span class="text-muted fw-bold text-uppercase small" style="letter-spacing: 0.5px;">Warning (Yellow)</span>
            <div class="icon-box bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center" style="width: 45px; height: 45px;">
              <i class="fas fa-exclamation-triangle fs-5"></i>
            </div>
          </div>
          <h2 class="fw-bold mb-1" style="color: var(--text-heading-color);">
            {{ yellowCount }}
          </h2>
          <div class="d-flex align-items-center gap-2 mt-2">
            <span class="badge bg-warning bg-opacity-10 text-warning rounded-pill px-2 py-1 small fw-medium">
              <i class="fas fa-clock me-1"></i>Warning
            </span>
            <span class="text-muted small">Approaching fine limit</span>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card stat-card h-100 p-3 p-xl-4 rounded-4 shadow-sm border-0 position-relative overflow-hidden" style="background-color: var(--surface-card);">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <span class="text-muted fw-bold text-uppercase small" style="letter-spacing: 0.5px;">Total Fines Owed</span>
            <div class="icon-box bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center" style="width: 45px; height: 45px;">
              <i class="fas fa-dollar-sign fs-5"></i>
            </div>
          </div>
          <h2 class="fw-bold mb-1 d-flex align-items-baseline gap-1" style="color: var(--text-heading-color);">
            <span class="text-success fs-4">$</span>{{ totalFinesOwed }}
          </h2>
          <div class="d-flex align-items-center gap-2 mt-2">
            <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1 small fw-medium">
              <i class="fas fa-coins me-1"></i>Outstanding
            </span>
            <span class="text-muted small">Across all fined monks</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Ledger Table -->
    <div class="card border-0 shadow-sm" style="background-color: var(--surface-card);">
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mt-2 small">Loading fine ledger...</p>
      </div>

      <!-- Empty state when no fines -->
      <div v-else-if="filteredLedger.length === 0 && !showAll" class="text-center py-5">
        <div class="mb-3" style="font-size: 3rem;">🎉</div>
        <h6 class="fw-bold text-success">No Outstanding Fines</h6>
        <p class="text-muted small mb-3">All monks are currently fine-free.</p>
        <button class="btn btn-outline-secondary btn-sm" @click="showAll = true">Show all monks</button>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">#</th>
              <th>Monk Name</th>
              <th>Row</th>
              <th class="text-center">Absences</th>
              <th class="text-center">Leaves</th>
              <th class="text-center">Active Points</th>
              <th class="text-center">Fine Owed</th>
              <th class="text-center">Status</th>
              <th class="text-center pe-3">Record Payment</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(monk, index) in filteredLedger"
              :key="monk.user_id"
              :class="{
                'table-danger': monk.status_level === 'Red',
                'table-warning': monk.status_level === 'Yellow'
              }"
            >
              <td class="ps-3 text-muted small">{{ index + 1 }}</td>
              <td class="fw-bold">{{ monk.name }}</td>
              <td class="text-muted small">{{ monk.seating_row_id || '—' }}</td>
              <td class="text-center">
                <span class="badge bg-danger bg-opacity-75">{{ monk.total_absences }}</span>
              </td>
              <td class="text-center">
                <span class="badge bg-warning text-dark bg-opacity-75">{{ monk.total_permissions }}</span>
              </td>
              <td class="text-center fw-bold">{{ monk.active_points }} <small class="text-muted fw-normal">pts</small></td>
              <td class="text-center fw-bold" :class="monk.fine_balance_owed > 0 ? 'text-danger' : 'text-muted'">
                ${{ monk.fine_balance_owed }}
              </td>
              <td class="text-center">
                <span v-if="monk.status_level === 'Red'" class="badge bg-danger">🔴 Fined</span>
                <span v-else-if="monk.status_level === 'Yellow'" class="badge bg-warning text-dark">🟡 Warning</span>
                <span v-else class="badge bg-success">🟢 Clear</span>
              </td>
              <td class="text-center pe-3">
                <div class="d-flex justify-content-center gap-1" v-if="monk.fine_balance_owed > 0">
                  <button
                    @click="makePayment(monk, 5)"
                    class="btn btn-sm btn-outline-primary"
                    :disabled="isPaying"
                    title="Pay $5 — clears 9 points"
                  >$5</button>
                  <button
                    v-if="monk.active_points >= 9"
                    @click="makePayment(monk, 10)"
                    class="btn btn-sm btn-outline-primary"
                    :disabled="isPaying"
                    title="Pay $10 — clears 18 points"
                  >$10</button>
                  <button
                    v-if="monk.active_points >= 18"
                    @click="makePayment(monk, 15)"
                    class="btn btn-sm btn-outline-primary"
                    :disabled="isPaying"
                    title="Pay $15 — clears 27 points"
                  >$15</button>
                </div>
                <span v-else class="text-muted small">—</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="px-3 py-2 border-top text-muted small d-flex justify-content-between">
          <span>Showing {{ filteredLedger.length }} monk{{ filteredLedger.length !== 1 ? 's' : '' }}</span>
          <span v-if="!showAll" class="text-primary" role="button" @click="showAll = true" style="cursor:pointer;">Show all monks →</span>
          <span v-else class="text-primary" role="button" @click="showAll = false" style="cursor:pointer;">← Show fined only</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();

const ledger = ref([]);
const isLoading = ref(false);
const isPaying = ref(false);
const searchQuery = ref('');
const showAll = ref(false); // default: show only fined monks

const seasons = ref([]);
const selectedSeasonId = ref(null);

const fetchSeasons = async () => {
  try {
    const res = await api.get('/retreat-events');
    seasons.value = res.data.data;
    if (seasons.value.length > 0) {
      // Find active or default to the latest one
      const active = seasons.value.find(s => s.is_active);
      selectedSeasonId.value = active ? active.id : seasons.value[0].id;
    }
  } catch (error) {
    console.error('Fetch seasons error:', error);
  }
};

const fetchLedger = async () => {
  isLoading.value = true;
  try {
    const params = selectedSeasonId.value ? { retreat_event_id: selectedSeasonId.value } : {};
    const res = await api.get('/ledger', { params });
    ledger.value = res.data.data;
  } catch (error) {
    console.error('Fetch ledger error:', error);
    toast.showToast('Failed to load ledger', 'error');
  } finally {
    isLoading.value = false;
  }
};

const makePayment = async (monk, amount) => {
  if (confirm(`Record a $${amount} payment for ${monk.name}?\nThis will clear ${amount / 5 * 9} active points.`)) {
    isPaying.value = true;
    try {
      await api.post('/ledger/pay', {
        user_id: monk.user_id,
        amount_paid: amount,
        retreat_event_id: selectedSeasonId.value
      });
      toast.showToast(`$${amount} payment recorded for ${monk.name}`, 'success');
      await fetchLedger();
    } catch (error) {
      console.error('Payment error:', error);
      toast.showToast(error.response?.data?.message || 'Failed to record payment', 'error');
    } finally {
      isPaying.value = false;
    }
  }
};

const filteredLedger = computed(() => {
  // Start with all monks, or only fined ones
  let list = showAll.value
    ? ledger.value
    : ledger.value.filter(m => m.fine_balance_owed > 0);

  // Then apply name search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(m => m.name.toLowerCase().includes(q));
  }

  // Sort: Red first, then Yellow, then Green
  return list.sort((a, b) => {
    const order = { Red: 0, Yellow: 1, Green: 2 };
    return order[a.status_level] - order[b.status_level];
  });
});

// Stats always based on ALL monks
const redCount = computed(() => ledger.value.filter(m => m.status_level === 'Red').length);
const yellowCount = computed(() => ledger.value.filter(m => m.status_level === 'Yellow').length);
const totalFinesOwed = computed(() =>
  ledger.value.reduce((sum, m) => sum + m.fine_balance_owed, 0)
);

onMounted(async () => {
  await fetchSeasons();
  fetchLedger();
});
</script>

<style scoped>
.stat-card {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
  border: 1px solid var(--border-clr);
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08) !important;
}
[data-theme="dark"] .stat-card:hover {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35) !important;
}
.ledger-container {
  scrollbar-color: color-mix(in srgb, var(--primary-color) 40%, transparent) transparent;
}
</style>
