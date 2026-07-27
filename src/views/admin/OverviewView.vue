<script setup>
import { onMounted, defineAsyncComponent, ref, computed } from 'vue';
const BarChart = defineAsyncComponent(() => import('@/components/charts/BarChart.vue'));
const PieChart = defineAsyncComponent(() => import('@/components/charts/PieChart.vue'));
import api from '@/api/api';

const stats = ref({
    userStats: { total: 0, growth: 0 },
    roomStats: { total: 0, growth: 0 },
    attendanceStats: { total: 0, growth: 0, monthlyAttendanceComparison: [], byStatus: {} },
    leaveStats: { total: 0, growth: 0 }
});
const isLoading = ref(true);

onMounted(async () => {
    isLoading.value = true;
    try {
        const response = await api.get('statistics/admin');
        if (response.data?.data) {
            stats.value = response.data.data;
        }
    } finally {
        isLoading.value = false;
    }
});

const formatGrowth = (val) => {
    return val > 0 ? `+${val}%` : `${val}%`;
};
const getTrendType = (val) => {
    return val >= 0 ? 'up' : 'down';
};

// Bar chart data from monthlyAttendanceComparison
const barChartLabels = computed(() => {
    return (stats.value.attendanceStats?.monthlyAttendanceComparison || []).map(item => item.month);
});
const barChartDatasets = computed(() => {
    return [
        {
            label: 'Attendance Logged',
            type: 'bar',
            data: (stats.value.attendanceStats?.monthlyAttendanceComparison || []).map(item => item.count)
        }
    ];
});

// Pie chart data from attendanceStats byStatus
const pieChartLabels = computed(() => {
    return Object.keys(stats.value.attendanceStats?.byStatus || {});
});
const pieChartData = computed(() => {
    return Object.values(stats.value.attendanceStats?.byStatus || {});
});
</script>

<template>
  <div class="overview-view">
    <div class="mb-3">
        <div class="row g-3">
            <div class="col-lg-3 col-6">
                <BaseStat :loading="isLoading" :value="stats.userStats?.total || 0" label="Total Members" trendLabel="this month" :trendValue="formatGrowth(stats.userStats?.growth || 0)" :trendType="getTrendType(stats.userStats?.growth || 0)" />
            </div>
            <div class="col-lg-3 col-6">
                <BaseStat :loading="isLoading" :value="stats.attendanceStats?.total || 0" label="Attendance Records" trendLabel="this month" :trendValue="formatGrowth(stats.attendanceStats?.growth || 0)" :trendType="getTrendType(stats.attendanceStats?.growth || 0)" />
            </div>
            <div class="col-lg-3 col-6">
                <BaseStat :loading="isLoading" :value="stats.leaveStats?.total || 0" label="Leave Requests" trendLabel="this month" :trendValue="formatGrowth(stats.leaveStats?.growth || 0)" :trendType="getTrendType(stats.leaveStats?.growth || 0)" />
            </div>
            <div class="col-lg-3 col-6">
                <BaseStat :loading="isLoading" :value="stats.roomStats?.total || 0" label="Pagoda Kuts" trendLabel="this month" :trendValue="formatGrowth(stats.roomStats?.growth || 0)" :trendType="getTrendType(stats.roomStats?.growth || 0)" />
            </div>
        </div>
    </div>
    <div class="row g-3">
      <div class="col-xl-8 col-lg-7">
        <BarChart 
            class="h-100" 
            title="Monthly Attendance" 
            subtitle="Attendance records logged over recent months"
            :labels="barChartLabels" 
            :datasets="barChartDatasets" 
        />
      </div>

      <div class="col-xl-4 col-lg-5" >
        <PieChart 
            class="h-100" 
            title="Attendance by Status" 
            subtitle="Current attendance distribution"
            :labels="pieChartLabels" 
            :dataValues="pieChartData" 
        />
      </div>
    </div>
  </div>
</template>
<style scoped>
</style>