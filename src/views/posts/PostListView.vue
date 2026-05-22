<template>
  <div class="posts-view">
    <!-- Header -->
    <el-row :gutter="20" align="middle" class="page-header">
      <el-col :span="12">
        <h1 class="page-title">笔记管理</h1>
      </el-col>
      <el-col :span="12" class="text-right">
        <el-statistic title="总记录数" :value="pagination.total" />
      </el-col>
    </el-row>

    <!-- Filter Card -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true">
        <el-form-item label="关键词">
          <el-input
            v-model="searchKeyword"
            placeholder="标题 / 笔记ID"
            clearable
          />
        </el-form-item>
        <el-form-item label="作者">
          <el-input
            v-model="searchAuthor"
            placeholder="昵称 / 作者ID"
            clearable
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="searchTag" placeholder="搜索标签" clearable />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table Card -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <span>笔记列表</span>
      </template>
      <el-table :data="postList" v-loading="loading" @row-click="handleView">
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column prop="authorName" label="作者" />
        <el-table-column prop="likedCount" label="点赞" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.likedCount) }}
          </template>
        </el-table-column>
        <el-table-column prop="collectedCount" label="收藏" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.collectedCount) }}
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP属地">
          <template #default="{ row }">
            {{ row.ip || "—" }}
          </template>
        </el-table-column>
        <el-table-column prop="downloadTime" label="下载时间" />
        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="handleView(row)"
              >查看</el-button
            >
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无数据" />
        </template>
      </el-table>
      <el-row justify="end" class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          background
        />
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getPostList } from "@/api/posts";
import { ElMessage } from "element-plus";

const router = useRouter();
const route = useRoute();

const loading = ref(false);

const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 10000) return (num / 10000).toFixed(1) + "w";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return String(num);
};

const searchKeyword = ref("");
const searchAuthor = ref("");
const searchTag = ref("");
const dateRange = ref(null);
const postList = ref([]);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const loadPosts = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value || undefined,
      author: searchAuthor.value || undefined,
      tag: searchTag.value || undefined,
    };
    if (dateRange.value?.length === 2) {
      params.startDate = formatDate(dateRange.value[0]);
      params.endDate = formatDate(dateRange.value[1]);
    }
    const res = await getPostList(params);
    postList.value = res.data.items;
    pagination.total = res.data.total;
  } catch (e) {
    ElMessage.error("加载数据失败");
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  loadPosts();
};

const handleReset = () => {
  searchKeyword.value = "";
  searchAuthor.value = "";
  searchTag.value = "";
  dateRange.value = null;
  handleSearch();
};

const handleView = (row) => {
  router.push(`/posts/${row.postId || row.id}`);
};

onMounted(() => {
  loadPosts();
});

watch(
  () => [pagination.page, pagination.pageSize],
  () => {
    loadPosts();
  },
);
</script>

<style scoped>
.posts-view {
  background: #fafafa;
  padding: 24px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #171717;
  margin: 0;
}

.text-right {
  text-align: right;
}

.filter-card {
  margin-bottom: 16px;
}

.pagination {
  padding: 16px 0 0;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th.el-table__cell) {
  font-size: 12px;
  text-transform: uppercase;
  color: #525252;
  font-weight: 500;
}

:deep(.el-table td.el-table__cell) {
  color: #262626;
}

:deep(.el-table .el-table__row) {
  cursor: pointer;
}
</style>
