<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalPosts }}</div>
            <div class="stat-label">总笔记数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ stats.todayDownloads }}</div>
            <div class="stat-label">今日下载</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ stats.monthDownloads }}</div>
            <div class="stat-label">本月下载</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <span>近7日下载量趋势</span>
          </template>
          <div ref="trendChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span>热门标签TOP10</span>
          </template>
          <div class="tag-list">
            <div
              v-for="(tag, index) in hotTags"
              :key="index"
              class="tag-item"
            >
              <span class="tag-rank">{{ index + 1 }}</span>
              <span class="tag-name">{{ tag.name }}</span>
              <span class="tag-count">{{ tag.count }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { getDashboardStats } from '@/api/dashboard'

const stats = ref({
  totalPosts: 0,
  totalUsers: 0,
  todayDownloads: 0,
  monthDownloads: 0
})
const trendData = ref([])
const hotTags = ref([])
let trendChart = null
const trendChartRef = ref(null)

const loadStats = async () => {
  try {
    const res = await getDashboardStats()
    stats.value = res.data
  } catch (e) {
    // handle error
  }
}

const loadTrend = async () => {
  try {
    const res = await getDownloadTrend(7)
    trendData.value = res.data
    initTrendChart()
  } catch (e) {
    // handle error
  }
}

const loadHotTags = async () => {
  try {
    const res = await getHotTags(10)
    hotTags.value = res.data
  } catch (e) {
    // handle error
  }
}

const initTrendChart = () => {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: trendData.value.map(item => item.date)
    },
    yAxis: { type: 'value' },
    series: [{
      data: trendData.value.map(item => item.count),
      type: 'line',
      smooth: true,
      areaStyle: { opacity: 0.3 }
    }]
  }
  trendChart.setOption(option)
}

onMounted(() => {
  loadStats()
  loadTrend()
  loadHotTags()
  window.addEventListener('resize', () => trendChart?.resize())
})

onUnmounted(() => {
  trendChart?.dispose()
})
</script>

<style scoped>
.stats-row {
  margin-bottom: 20px;
}
.stat-card {
  text-align: center;
  padding: 20px 0;
}
.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}
.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 10px;
}
.charts-row {
  margin-bottom: 20px;
}
.tag-list {
  max-height: 300px;
  overflow-y: auto;
}
.tag-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.tag-rank {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: #409eff;
  color: #fff;
  border-radius: 50%;
  margin-right: 12px;
}
.tag-name {
  flex: 1;
  color: #333;
}
.tag-count {
  color: #999;
}
</style>