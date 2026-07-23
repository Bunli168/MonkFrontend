<script setup>
import { onMounted, defineAsyncComponent, ref, computed } from 'vue';
const BarChart = defineAsyncComponent(() => import('@/components/charts/BarChart.vue'));
const PieChart = defineAsyncComponent(() => import('@/components/charts/PieChart.vue'));
import api from '@/api/api';

const stats = ref({
    userStats: { total: 0, growth: 0 },
    roomStats: { total: 0, growth: 0 },
    reportStats: { total: 0, growth: 0, monthlyReportComparison: [], byStatus: {} },
    surveyStats: { total: 0, growth: 0, monthlySurveyResponses: [] },
    scheduleStats: { total: 0 }
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

// Bar chart data from monthlyReportComparison
const barChartLabels = computed(() => {
    return (stats.value.reportStats?.monthlyReportComparison || []).map(item => item.month);
});
const barChartDatasets = computed(() => {
    return [
        {
            label: 'Reports Filed',
            type: 'bar',
            data: (stats.value.reportStats?.monthlyReportComparison || []).map(item => item.count)
        }
    ];
});

// Pie chart data from reportStats byStatus
const pieChartLabels = computed(() => {
    return Object.keys(stats.value.reportStats?.byStatus || {});
});
const pieChartData = computed(() => {
    return Object.values(stats.value.reportStats?.byStatus || {});
});
</script>

<template>
  <div class="overview-view">
    <div class="mb-3">
        <div class="row g-3">
            <div class="col-lg-3 col-6">
                <BaseStat :loading="isLoading" :value="stats.userStats.total" label="Total Users" trendLabel="this month" :trendValue="formatGrowth(stats.userStats.growth)" :trendType="getTrendType(stats.userStats.growth)" />
            </div>
            <div class="col-lg-3 col-6">
                <BaseStat :loading="isLoading" :value="stats.surveyStats.total" label="Active Surveys" trendLabel="this month" :trendValue="formatGrowth(stats.surveyStats.growth)" :trendType="getTrendType(stats.surveyStats.growth)" />
            </div>
            <div class="col-lg-3 col-6">
                <BaseStat :loading="isLoading" :value="stats.reportStats.total" label="Reports Filed" trendLabel="this month" :trendValue="formatGrowth(stats.reportStats.growth)" :trendType="getTrendType(stats.reportStats.growth)" />
            </div>
            <div class="col-lg-3 col-6">
                <BaseStat :loading="isLoading" :value="stats.roomStats.total" label="Registered Rooms" trendLabel="this month" :trendValue="formatGrowth(stats.roomStats.growth)" :trendType="getTrendType(stats.roomStats.growth)" />
            </div>
        </div>
    </div>
    <div class="row g-3">
      <div class="col-xl-8 col-lg-7">
        <BarChart 
            class="h-100" 
            title="Monthly Reports" 
            subtitle="Reports filed over the last year"
            :labels="barChartLabels" 
            :datasets="barChartDatasets" 
        />
      </div>

      <div class="col-xl-4 col-lg-5" >
        <PieChart 
            class="h-100" 
            title="Reports by Status" 
            subtitle="Current status distribution"
            :labels="pieChartLabels" 
            :dataValues="pieChartData" 
        />
      </div>
    </div>
  </div>
</template>
<style scoped>
</style>