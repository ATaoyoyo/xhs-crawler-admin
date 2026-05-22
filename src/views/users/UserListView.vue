<template>
  <div class="users-view">
    <!-- Header -->
    <el-row :gutter="20" align="middle" class="page-header">
      <el-col :span="12">
        <h1 class="page-title">用户管理</h1>
      </el-col>
      <el-col :span="12" class="text-right">
        <el-statistic title="总记录数" :value="pagination.total" />
      </el-col>
    </el-row>

    <!-- Table Card -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <span>用户列表</span>
      </template>
      <el-table :data="userList" v-loading="loading" @row-click="handleView">
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column
          prop="post_count"
          label="下载笔记数"
          width="120"
          sortable
        >
          <template #default="{ row }">
            {{ formatNumber(row.post_count) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" />
        <el-table-column label="操作" fixed="right">
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

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="用户详情" width="500px">
      <div v-if="currentUser" class="user-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户名">
            {{ currentUser.username }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ currentUser.email }}
          </el-descriptions-item>
          <el-descriptions-item label="下载笔记数">
            {{ currentUser.post_count }}
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">
            {{ currentUser.created_at }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { getUserList } from "@/api/users";

const loading = ref(false);
const userList = ref([]);
const detailVisible = ref(false);
const currentUser = ref(null);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 10000) return (num / 10000).toFixed(1) + "w";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return String(num);
};

const loadUsers = async () => {
  loading.value = true;
  try {
    const res = await getUserList({
      page: pagination.page,
      pageSize: pagination.pageSize,
    });
    userList.value = res.data.items;
    pagination.total = res.data.total;
  } catch (e) {
    // handle error
  } finally {
    loading.value = false;
  }
};

const handleView = (row) => {
  currentUser.value = row;
  detailVisible.value = true;
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.users-view {
  padding: var(--space-6);
}

.page-header {
  margin-bottom: var(--space-6);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  margin: 0;
  letter-spacing: -0.5px;
}

.text-right {
  text-align: right;
}
</style>
