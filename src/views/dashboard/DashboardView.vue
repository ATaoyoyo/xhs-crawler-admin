<template>
  <div class="dashboard">
    <!-- Stats Row -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card stat-card-featured" shadow="hover" body-style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <span class="stat-prefix">笔记总数</span>
            <div class="stat-value">{{ stats.totalPosts }}</div>
          </div>
          <div class="stat-indicator">
            <span class="indicator-dot"></span>
            <span>活跃内容</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover" body-style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <span class="stat-prefix">用户总数</span>
            <div class="stat-value">{{ stats.totalUsers }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover" body-style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <span class="stat-prefix">今日下载</span>
            <div class="stat-value accent">{{ stats.todayDownloads }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover" body-style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <span class="stat-prefix">本月下载</span>
            <div class="stat-value accent">{{ stats.monthDownloads }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Content Grid -->
    <el-row :gutter="16" class="content-row">
      <el-col :span="14">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">近7日下载量趋势</span>
              <el-tag type="success" size="small">周</el-tag>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-area"></div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card class="tags-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">热门标签</span>
              <el-tag type="success" size="small">前十</el-tag>
            </div>
          </template>
          <div class="tags-list">
            <div v-for="(tag, index) in hotTags" :key="index" class="tag-row">
              <span class="tag-index">{{ String(index + 1).padStart(2, "0") }}</span>
              <span class="tag-name">{{ tag.name }}</span>
              <el-progress
                :percentage="(tag.count / (hotTags[0]?.count || 1)) * 100"
                :stroke-width="4"
                :show-text="false"
                color="#3ecf8e"
              />
              <span class="tag-count">{{ tag.count }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import { getDashboardStats } from "@/api/dashboard";
import { nextTick } from "vue";

const stats = ref({
  totalPosts: 0,
  totalUsers: 0,
  todayDownloads: 0,
  monthDownloads: 0,
});
const trendData = ref([]);
const hotTags = ref([]);
let trendChart = null;
const trendChartRef = ref(null);


const loadStats = async () => {
  try {
    const res = await getDashboardStats();
    const data = res.data;
    stats.value = {
      totalPosts: data.totalPosts,
      totalUsers: data.totalUsers,
      todayDownloads: data.todayDownloads,
      monthDownloads: data.monthDownloads,
    };
    trendData.value = data.trendData || [];
    hotTags.value = data.topTags || [];

    nextTick(() => initTrendChart());
  } catch (e) {
    // handle error
  }
};

const initTrendChart = () => {
  if (!trendChartRef.value) return;
  trendChart = echarts.init(trendChartRef.value);
  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "#ffffff",
      borderColor: "#e5e5e5",
      textStyle: { color: "#525252" },
    },
    grid: {
      top: 20,
      right: 20,
      bottom: 30,
      left: 50,
    },
    xAxis: {
      type: "category",
      data: trendData.value.map((item) => item.date),
      axisLine: { lineStyle: { color: "#e5e5e5" } },
      axisLabel: { color: "#737373", fontSize: 12 },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "#f5f5f5" } },
      axisLabel: { color: "#737373", fontSize: 12 },
    },
    series: [
      {
        data: trendData.value.map((item) => item.count),
        type: "line",
        smooth: 0.4,
        lineStyle: { color: "#3ecf8e", width: 2 },
        itemStyle: { color: "#3ecf8e" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(62, 207, 142, 0.15)" },
              { offset: 1, color: "rgba(62, 207, 142, 0)" },
            ],
          },
        },
      },
    ],
  };
  trendChart.setOption(option);
};

onMounted(() => {
  loadStats();
  window.addEventListener("resize", () => trendChart?.resize());
});

onUnmounted(() => {
  trendChart?.dispose();
});
</script>

<style scoped>
.dashboard {
  background: #fafafa;
  min-height: 100vh;
  padding: 0 32px 32px;
}

/* Stats Row */
.stats-row {
  margin-bottom: 24px;
}
.stat-card {
  border-radius: 8px;
  height: 140px;
}
.stat-card-featured {
  background: #3ecf8e;
  border-color: #3ecf8e;
}
.stat-card-featured .stat-prefix,
.stat-card-featured .stat-value {
  color: #ffffff;
}
.stat-prefix {
  font-size: 12px;
  color: #737373;
  display: block;
  margin-bottom: 8px;
}
.stat-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #737373;
  margin-top: 12px;
}
.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3ecf8e;
}
.stat-card-featured .stat-indicator {
  color: rgba(255, 255, 255, 0.9);
}
.stat-card-featured .indicator-dot {
  background: #ffffff;
}

/* Content Row */
.content-row {
  margin-bottom: 24px;
}
.chart-card,
.tags-card {
  border-radius: 8px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  font-size: 15px;
  font-weight: 500;
  color: #171717;
}
.chart-area {
  height: 280px;
}

/* Tags List */
.tags-list {
  padding: 0;
}
.tag-row {
  display: grid;
  grid-template-columns: 32px 1fr 100px 48px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}
.tag-row:last-child {
  border-bottom: none;
}
.tag-row:hover {
  background: #fafafa;
  margin: 0 -20px;
  padding: 12px 20px;
}
.tag-index {
  font-size: 12px;
  font-weight: 500;
  color: #a3a3a3;
  font-variant-numeric: tabular-nums;
}
.tag-name {
  font-size: 14px;
  color: #525252;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 12px;
}
.tag-count {
  font-size: 12px;
  color: #737373;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-row .el-col {
    margin-bottom: 16px;
  }
  .content-row .el-col {
    margin-bottom: 16px;
  }
}
@media (max-width: 768px) {
  .dashboard {
    padding: 0 16px 24px;
  }
}
</style>
