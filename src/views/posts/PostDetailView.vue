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
      <el-descriptions :column="3" border>
        <el-descriptions-item label="标题" :span="3">
          {{ post.title }}
          <el-tag size="small" :type="post.category ? '' : 'info'" style="margin-left: 8px">
            {{ post.category || "未分类" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="笔记ID">{{ post.postId }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ post.authorName || post.authorId }}</el-descriptions-item>
        <el-descriptions-item label="IP属地">{{ post.ip || "—" }}</el-descriptions-item>
        <el-descriptions-item label="下载时间">{{ post.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="点赞">{{ formatNumber(post.likedCount) }}</el-descriptions-item>
        <el-descriptions-item label="收藏">{{ formatNumber(post.collectedCount) }}</el-descriptions-item>
      </el-descriptions>

      <!-- Content Card -->
      <el-card>
        <template #header>正文内容</template>
        <p class="content-text">{{ post.content }}</p>
      </el-card>

      <!-- Tags Card -->
      <el-card v-if="post.tags?.length" header="标签">
        <el-tag v-for="tag in post.tags" :key="tag.tagId" style="margin-right: 8px; margin-bottom: 8px">
          {{ tag.tagName }}
        </el-tag>
      </el-card>

      <!-- Images Card -->
      <el-card v-if="imageList.length" header="图片">
        <el-image
          v-for="(url, index) in imageList"
          :key="index"
          :src="url"
          :initial-index="index"
          :preview-src-list="imageList"
          fit="cover"
          class="media-item"
        />
      </el-card>

      <!-- Video Card -->
      <el-card v-if="videoList.length" header="视频">
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
      <el-card header="分享链接">
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
import { Link } from "@element-plus/icons-vue";

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
  background: #fafafa;
  padding: 24px;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.content-text {
  font-size: 14px;
  line-height: 1.8;
  color: #525252;
  white-space: pre-wrap;
  margin: 0;
}

.media-item {
  width: 120px;
  height: 120px;
  border-radius: 6px;
}

.video-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.video-item {
  max-height: 200px;
  border-radius: 6px;
  object-fit: contain;
  background: #171717;
}
</style>
