<template>
  <div class="users-view">
    <el-card shadow="hover">
      <el-table :data="userList" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="post_count" label="下载笔记数" width="120" sortable />
        <el-table-column prop="created_at" label="注册时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadUsers"
          @current-change="loadUsers"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" title="用户详情" width="500px">
      <div v-if="currentUser" class="user-detail">
        <p><strong>用户名：</strong>{{ currentUser.username }}</p>
        <p><strong>邮箱：</strong>{{ currentUser.email }}</p>
        <p><strong>下载笔记数：</strong>{{ currentUser.post_count }}</p>
        <p><strong>注册时间：</strong>{{ currentUser.created_at }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getUserList } from '@/api/users'

const userList = ref([])
const detailVisible = ref(false)
const currentUser = ref(null)
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const loadUsers = async () => {
  try {
    const res = await getUserList({
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    userList.value = res.data.items
    pagination.total = res.data.total
  } catch (e) {
    // handle error
  }
}

const handleView = (row) => {
  currentUser.value = row
  detailVisible.value = true
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.user-detail p {
  margin: 10px 0;
}
</style>