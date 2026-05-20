<template>
  <div class="post-detail-view">
    <el-page-header @back="router.back()" content="笔记详情">
      <template #extra>
        <el-button type="danger" plain @click="handleDelete">删除</el-button>
      </template>
    </el-page-header>

    <el-card v-loading="loading" style="margin-top: 20px">
      <div v-if="post" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="笔记ID">{{ post.postId }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ post.title }}</el-descriptions-item>
          <el-descriptions-item label="作者ID">{{ post.authorId }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ post.category || '未分类' }}</el-descriptions-item>
          <el-descriptions-item label="IP属地">{{ post.ip }}</el-descriptions-item>
          <el-descriptions-item label="下载时间">{{ post.createdAt }}</el-descriptions-item>
        </el-descriptions>

        <div class="content-section">
          <h4>正文内容</h4>
          <div class="content-text">{{ post.content }}</div>
        </div>

        <div class="interact-section">
          <h4>互动数据</h4>
          <div class="interact-stats">
            <el-statistic title="点赞数" :value="post.likedCount" />
            <el-statistic title="收藏数" :value="post.collectedCount" />
          </div>
        </div>

        <div v-if="mediaList.length" class="media-section">
          <h4>图片/视频</h4>
          <el-carousel :interval="4000" type="card" height="300px">
            <el-carousel-item v-for="(item, index) in mediaList" :key="index">
              <el-image
                v-if="item.type === 'image'"
                :src="item.url"
                fit="contain"
                :preview-src-list="mediaList.filter(m => m.type === 'image').map(m => m.url)"
                style="width: 100%; height: 100%"
              />
              <video
                v-else-if="item.type === 'video'"
                :src="item.url"
                controls
                style="width: 100%; height: 100%"
              />
            </el-carousel-item>
          </el-carousel>
        </div>

        <div class="share-section">
          <h4>分享链接</h4>
          <el-link :href="post.shareUrl" target="_blank" type="primary">{{ post.shareUrl }}</el-link>
        </div>
      </div>

      <el-empty v-else-if="!loading" description="笔记不存在" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getPostDetail, deletePost } from '@/api/posts'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const post = ref(null)
const mediaList = ref([])

const loadDetail = async () => {
  const postId = route.params.id
  if (!postId) {
    ElMessage.error('笔记ID不存在')
    router.back()
    return
  }
  loading.value = true
  try {
    const res = await getPostDetail(postId)
    post.value = res.data
    const media = res.data.media
    mediaList.value = media ? (Array.isArray(media) ? media : [media]) : []
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定删除该笔记吗？', '提示', { type: 'warning' })
    await deletePost(route.params.id)
    ElMessage.success('删除成功')
    router.back()
  } catch (e) {
    // cancel or error
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.post-detail-view {
  padding: 20px;
}
.content-section,
.interact-section,
.media-section,
.share-section {
  margin-top: 24px;
}
.content-section h4,
.interact-section h4,
.media-section h4,
.share-section h4 {
  margin-bottom: 12px;
  color: var(--el-text-color-regular);
}
.content-text {
  white-space: pre-wrap;
  line-height: 1.8;
  color: var(--el-text-color-primary);
}
.interact-stats {
  display: flex;
  gap: 40px;
}
</style>