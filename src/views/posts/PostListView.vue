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
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="likes" label="点赞数" width="100" sortable />
        <el-table-column prop="collects" label="收藏数" width="100" sortable />
        <el-table-column prop="comments" label="评论数" width="100" sortable />
        <el-table-column prop="created_at" label="发布时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
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

    <el-dialog v-model="detailVisible" title="笔记详情" width="600px">
      <div v-if="currentPost" class="post-detail">
        <p><strong>标题：</strong>{{ currentPost.title }}</p>
        <p><strong>作者：</strong>{{ currentPost.author }}</p>
        <p><strong>点赞：</strong>{{ currentPost.likes }}</p>
        <p><strong>收藏：</strong>{{ currentPost.collects }}</p>
        <p><strong>评论：</strong>{{ currentPost.comments }}</p>
        <p><strong>发布时间：</strong>{{ currentPost.created_at }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getPostList, deletePost } from '@/api/posts'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchKeyword = ref('')
const dateRange = ref(null)
const postList = ref([])
const detailVisible = ref(false)
const currentPost = ref(null)
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const loadPosts = async () => {
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.pageSize,
      keyword: searchKeyword.value || undefined
    }
    if (dateRange.value?.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }
    const res = await getPostList(params)
    postList.value = res.data.list
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
  currentPost.value = row
  detailVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该笔记吗？', '提示', {
      type: 'warning'
    })
    await deletePost(row.id)
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
.post-detail p {
  margin: 10px 0;
}
</style>