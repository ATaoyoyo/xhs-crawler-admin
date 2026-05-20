<template>
  <div class="posts-view">
    <el-card shadow="hover">
      <template #header>
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索标题/作者"
            style="width: 200px; margin-right: 10px"
            clearable
            @keyup.enter="handleSearch"
          />
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="margin-right: 10px"
            @change="handleSearch"
          />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
      </template>

      <el-table :data="postList" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="authorName" label="作者" width="120" />
        <el-table-column prop="likedCount" label="点赞数" width="100" sortable />
        <el-table-column prop="collectedCount" label="收藏数" width="100" sortable />
        <el-table-column prop="ip" label="IP属地" width="100" />
        <el-table-column prop="downloadTime" label="下载时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="handleView(row)">查看</el-button>
            <el-button type="text" size="small" danger @click="handleDelete(row)">删除</el-button>
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
          @size-change="loadPosts"
          @current-change="loadPosts"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPostList, deletePost } from '@/api/posts'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const searchKeyword = ref('')
const dateRange = ref(null)
const postList = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const loadPosts = async () => {
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value || undefined
    }
    if (dateRange.value?.length === 2) {
      params.startDate = formatDate(dateRange.value[0])
      params.endDate = formatDate(dateRange.value[1])
    }
    const res = await getPostList(params)
    postList.value = res.data.items
    pagination.total = res.data.total
  } catch (e) {
    // handle error
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadPosts()
}

const handleView = (row) => {
  router.push(`/posts/${row.postId}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该笔记吗？', '提示', {
      type: 'warning'
    })
    await deletePost(row.postId)
    ElMessage.success('删除成功')
    loadPosts()
  } catch (e) {
    // cancel or error
  }
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>