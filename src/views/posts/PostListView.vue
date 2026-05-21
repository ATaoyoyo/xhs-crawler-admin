<template>
  <div class="posts-view">
    <el-card shadow="hover">
      <template #header>
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索标题/笔记ID"
            style="width: 200px; margin-right: 10px"
            clearable
          />
          <el-input
            v-model="searchAuthor"
            placeholder="搜索作者昵称/作者ID"
            style="width: 200px; margin-right: 10px"
            clearable
          />
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="margin-right: 10px"
            @change="handleDateChange"
          />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </template>

      <el-table :data="postList" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column
          prop="title"
          label="标题"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column prop="authorName" label="作者" />
        <el-table-column prop="likedCount" label="点赞数" width="100" />
        <el-table-column prop="collectedCount" label="收藏数" width="100" />
        <el-table-column prop="ip" label="IP属地" width="90" />
        <el-table-column prop="downloadTime" label="下载时间" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)"
              >查看</el-button
            >
            <!-- <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button> -->
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
import { ref, reactive, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getPostList, deletePost } from "@/api/posts";
import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();
const route = useRoute();

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr);
};

const searchKeyword = ref("");
const searchAuthor = ref("");
const dateRange = ref(null);
const postList = ref([]);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const syncStateToUrl = () => {
  const query = {};
  if (searchKeyword.value) query.keyword = searchKeyword.value;
  if (searchAuthor.value) query.author = searchAuthor.value;
  if (dateRange.value?.length === 2) {
    query.startDate = formatDate(dateRange.value[0]);
    query.endDate = formatDate(dateRange.value[1]);
  }
  if (pagination.page !== 1) query.page = pagination.page;
  if (pagination.pageSize !== 10) query.pageSize = pagination.pageSize;
  router.replace({ query });
};

const loadStateFromUrl = () => {
  const { keyword, author, startDate, endDate, page, pageSize } = route.query;
  if (keyword) searchKeyword.value = keyword;
  if (author) searchAuthor.value = author;
  if (startDate && endDate) {
    dateRange.value = [parseDate(startDate), parseDate(endDate)];
  }
  if (page) pagination.page = parseInt(page, 10);
  if (pageSize) pagination.pageSize = parseInt(pageSize, 10);
};

const loadPosts = async () => {
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value || undefined,
      author: searchAuthor.value || undefined,
    };
    if (dateRange.value?.length === 2) {
      params.startDate = formatDate(dateRange.value[0]);
      params.endDate = formatDate(dateRange.value[1]);
    }
    const res = await getPostList(params);
    postList.value = res.data.items;
    pagination.total = res.data.total;
  } catch (e) {
    // handle error
  }
};

const handleSearch = () => {
  pagination.page = 1;
  loadPosts();
  syncStateToUrl();
};

const handleReset = () => {
  searchKeyword.value = "";
  searchAuthor.value = "";
  dateRange.value = null;
  handleSearch();
};

const handleDateChange = () => {
  handleSearch();
};

const handleView = (row) => {
  router.push(`/posts/${row.postId}`);
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("确定删除该笔记吗？", "提示", {
      type: "warning",
    });
    await deletePost(row.postId);
    ElMessage.success("删除成功");
    loadPosts();
  } catch (e) {
    // cancel or error
  }
};

onMounted(() => {
  loadStateFromUrl();
  loadPosts();
});

watch(
  () => [pagination.page, pagination.pageSize],
  () => {
    syncStateToUrl();
  },
);
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
