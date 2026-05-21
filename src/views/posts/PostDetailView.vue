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
          <el-descriptions-item label="作者">{{ post.authorName || post.authorId }}</el-descriptions-item>
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

        <div v-if="post.tags && post.tags.length" class="tags-section">
          <h4>标签</h4>
          <el-tag v-for="tag in post.tags" :key="tag.tagId" style="margin-right: 8px">{{ tag.tagName }}</el-tag>
        </div>

        <div v-if="imageList.length" class="media-section">
          <h4>图片</h4>
          <div class="media-grid">
            <el-image
              v-for="(url, index) in imageList"
              :key="index"
              :src="url"
              fit="cover"
              :preview-src-list="imageList"
              class="media-item"
              style="width: 120px; height: 120px"
            />
          </div>
        </div>

        <div v-if="videoList.length" class="media-section">
          <h4>视频</h4>
          <div class="media-grid">
            <video
              v-for="(url, index) in videoList"
              :key="index"
              :src="url"
              controls
              class="media-item"
              style="width: 120px; height: 120px"
            />
          </div>
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
const imageList = ref([])
const videoList = ref([])

const MEDIA_BASE_URL = 'https://www.shupapa.top/media'

const getMediaUrl = (originalUrl, postId, dateStr, type) => {
  const filename = originalUrl.split('/').pop()
  let cleanFilename = filename
  if (type === 'images') {
    cleanFilename = filename.split('!')[0] + '.webp'
  } else if (type === 'videos') {
    cleanFilename = filename.split('?sign')[0]
  }
  return `${MEDIA_BASE_URL}/${dateStr}/${postId}/${type}/${cleanFilename}`
}

const formatDateForPath = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.split(' ')[0].replace(/-/g, '')
}

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
    const dateStr = formatDateForPath(res.data.createdAt)
    if (media) {
      imageList.value = (media.postImages || []).map(url =>
        getMediaUrl(url, postId, dateStr, 'images')
      )
      videoList.value = (media.postVideos || []).map(url =>
        getMediaUrl(url, postId, dateStr, 'videos')
      )
    } else {
      imageList.value = []
      videoList.value = []
    }
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
.tags-section h4,
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
.media-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.media-item {
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}
</style>