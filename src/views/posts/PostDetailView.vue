<template>
  <div class="post-detail-view">
    <!-- Header -->
    <el-page-header @back="router.back()">
      <template #content>
        <span class="page-title">笔记详情</span>
      </template>
      <template #extra>
        <el-button type="danger" size="small" @click="handleDelete">删除笔记</el-button>
      </template>
    </el-page-header>

    <!-- Loading State -->
    <el-empty v-if="loading" description="加载中..." />

    <!-- Empty State -->
    <el-empty v-else-if="!post" description="该笔记可能已被删除或不存在">
      <el-button type="primary" @click="router.back()">返回列表</el-button>
    </el-empty>

    <!-- Main Content -->
    <div v-else class="detail-grid">
      <!-- Primary Info Card -->
      <el-card class="info-card" shadow="never">
        <div class="info-header">
          <div class="info-title-row">
            <h2 class="info-title">{{ post.title }}</h2>
            <el-tag size="small" :type="post.category ? 'success' : 'info'">
              {{ post.category || "未分类" }}
            </el-tag>
          </div>
          <p class="info-meta">
            <span class="meta-item">
              <el-icon><User /></el-icon>
              {{ post.authorName || post.authorId }}
            </span>
            <span class="meta-item" v-if="post.ip">
              <el-icon><Location /></el-icon>
              {{ post.ip }}
            </span>
            <span class="meta-item">
              <el-icon><Clock /></el-icon>
              {{ post.createdAt }}
            </span>
          </p>
        </div>
        <div class="info-stats">
          <div class="stat-item">
            <span class="stat-value">{{ formatNumber(post.likedCount) }}</span>
            <span class="stat-label">点赞</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ formatNumber(post.collectedCount) }}</span>
            <span class="stat-label">收藏</span>
          </div>
          <div class="stat-item">
            <span class="stat-value text-mono">{{ post.postId }}</span>
            <span class="stat-label">笔记ID</span>
          </div>
        </div>
      </el-card>

      <!-- Content Card -->
      <el-card class="content-card" shadow="never">
        <template #header>
          <span class="card-title">正文内容</span>
        </template>
        <p class="content-text">{{ post.content }}</p>
      </el-card>

      <!-- Tags Card -->
      <el-card v-if="post.tags?.length" class="tags-card" shadow="never">
        <template #header>
          <span class="card-title">标签</span>
        </template>
        <el-tag v-for="tag in post.tags" :key="tag.tagId" style="margin-right: 8px; margin-bottom: 8px">
          {{ tag.tagName }}
        </el-tag>
      </el-card>

      <!-- Images Card -->
      <el-card v-if="imageList.length" class="images-card" shadow="never">
        <template #header>
          <span class="card-title">图片 ({{ imageList.length }})</span>
        </template>
        <div class="image-list">
          <el-image
            v-for="(url, index) in imageList"
            :key="index"
            :src="url"
            :initial-index="index"
            :preview-src-list="imageList"
            fit="cover"
            class="media-item"
          />
        </div>
      </el-card>

      <!-- Video Card -->
      <el-card v-if="videoList.length" class="video-card" shadow="never">
        <template #header>
          <span class="card-title">视频 ({{ videoList.length }})</span>
        </template>
        <div class="video-list">
          <video
            v-for="(url, index) in videoList"
            :key="index"
            :src="url"
            controls
            class="video-item"
          />
        </div>
      </el-card>

      <!-- Share Link Card -->
      <el-card class="share-card" shadow="never">
        <template #header>
          <span class="card-title">分享链接</span>
        </template>
        <el-link :href="post.shareUrl" target="_blank" type="primary">
          {{ post.shareUrl }}
          <el-icon style="margin-left: 4px"><Link /></el-icon>
        </el-link>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getPostDetail, deletePost } from "@/api/posts";
import { ElMessage, ElMessageBox } from "element-plus";
import { Link, User, Location, Clock } from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const post = ref(null);
const imageList = ref([]);
const videoList = ref([]);

const MEDIA_BASE_URL = "https://www.shupapa.top/media";

const getMediaUrl = (originalUrl, postId, dateStr, type) => {
  const filename = originalUrl.split("/").pop();
  let cleanFilename = filename;
  if (type === "images") {
    cleanFilename = filename.split("!")[0] + ".webp";
  } else if (type === "videos") {
    cleanFilename = filename.split("?sign")[0];
  }
  return `${MEDIA_BASE_URL}/${dateStr}/${postId}/${type}/${cleanFilename}`;
};

const formatDateForPath = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.split(" ")[0].replace(/-/g, "");
};

const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 10000) return (num / 10000).toFixed(1) + "w";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return String(num);
};

const loadDetail = async () => {
  const postId = route.params.id;
  if (!postId) {
    ElMessage.error("笔记ID不存在");
    router.back();
    return;
  }
  loading.value = true;
  try {
    const res = await getPostDetail(postId);
    post.value = res.data;
    const media = res.data.media;
    const dateStr = formatDateForPath(res.data.createdAt);
    if (media) {
      imageList.value = (media.postImages || []).map((url) =>
        getMediaUrl(url, postId, dateStr, "images"),
      );
      videoList.value = (media.postVideos || []).map((url) =>
        getMediaUrl(url, postId, dateStr, "videos"),
      );
    }
  } catch (e) {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
};

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm("确定删除该笔记吗？", "提示", {
      type: "warning",
    });
    await deletePost(route.params.id);
    ElMessage.success("删除成功");
    router.back();
  } catch (e) {
    // cancel or error
  }
};

onMounted(() => {
  loadDetail();
});
</script>

<style scoped>
.post-detail-view {
  background: var(--gray-50);
  padding: 24px;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

/* Info Card */
.info-card {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}
.info-header {
  margin-bottom: var(--space-6);
}
.info-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}
.info-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  letter-spacing: -0.42px;
}
.info-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin: 0;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--gray-500);
}
.info-stats {
  display: flex;
  gap: var(--space-8);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-light);
}
.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.stat-value {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
}
.stat-value.text-mono {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}
.stat-label {
  font-size: var(--text-xs);
  color: var(--gray-400);
}

/* Content Card */
.content-card {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}
.card-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--gray-800);
}
.content-text {
  font-size: var(--text-base);
  line-height: 1.8;
  color: var(--gray-600);
  white-space: pre-wrap;
  margin: 0;
}

/* Tags Card */
.tags-card,
.images-card,
.video-card,
.share-card {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

/* Images */
.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.media-item {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-sm);
}

/* Video */
.video-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.video-item {
  max-height: 200px;
  border-radius: var(--radius-sm);
  object-fit: contain;
  background: var(--gray-900);
}
</style>
