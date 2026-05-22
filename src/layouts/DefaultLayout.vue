<template>
  <el-container class="layout">
    <!-- Sidebar -->
    <el-aside class="sidebar" :width="collapsed ? '72px' : '240px'">
      <!-- Logo Area -->
      <div class="sidebar-logo" :class="{ collapsed }">
        <el-image
          class="logo-image"
          :src="logoImage"
          fit="contain"
        />
        <transition name="fade">
          <div v-if="!collapsed" class="logo-text">
            <span class="logo-title">薯爬爬</span>
            <span class="logo-subtitle">Admin</span>
          </div>
        </transition>
      </div>

      <!-- Navigation -->
      <el-menu
        :default-active="activeIndex"
        class="sidebar-menu"
        :collapse="collapsed"
        :collapse-transition="false"
        router
      >
        <el-menu-item
          v-for="item in navItems"
          :key="item.path"
          :index="item.path"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.label }}</template>
        </el-menu-item>
      </el-menu>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <el-button class="collapse-btn" text @click="toggleSidebar">
          <el-icon><Fold v-if="!collapsed" /><Expand v-else /></el-icon>
          <span v-if="!collapsed" class="collapse-text">收起</span>
        </el-button>
      </div>
    </el-aside>

    <!-- Main Content -->
    <el-container>
      <!-- Header -->
      <el-header class="main-header">
        <div class="header-breadcrumb">
          <span class="breadcrumb-item">{{ currentPageTitle }}</span>
        </div>
        <div class="header-right">
          <div class="header-time">{{ currentTime }}</div>
          <div class="header-user">
            <el-avatar class="user-avatar" :size="32">
              {{ userInitials }}
            </el-avatar>
            <span class="user-name">{{ authStore.user?.username }}</span>
          </div>
          <el-button class="btn-logout" @click="handleLogout">退出</el-button>
        </div>
      </el-header>

      <!-- Content Area -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  Fold,
  Expand,
  DataAnalysis,
  Document,
  User,
} from "@element-plus/icons-vue";
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth";
import { logout as logoutApi } from "@/api/auth";
import { ElMessage } from "element-plus";
import logoImage from "@/assets/images/logo.png";

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const authStore = useAuthStore();

const collapsed = computed(() => appStore.sidebarCollapsed);
const currentTime = ref("");

const navItems = [
  { path: "/dashboard", label: "仪表盘", icon: DataAnalysis },
  { path: "/posts", label: "笔记管理", icon: Document },
  { path: "/users", label: "用户管理", icon: User },
];

const activeIndex = computed(() => {
  if (route.path === "/dashboard") return "/dashboard";
  return navItems.find((item) => route.path.startsWith(item.path))?.path || "/dashboard";
});

const currentPageTitle = computed(() => {
  const item = navItems.find((item) => route.path.startsWith(item.path));
  return item?.label || "控制台";
});

const userInitials = computed(() => {
  const name = authStore.user?.username || "管理员";
  return name.slice(0, 2).toUpperCase();
});

const toggleSidebar = () => {
  appStore.toggleSidebar();
};

const handleLogout = async () => {
  try {
    await logoutApi();
  } catch (e) {
    // ignore error
  }
  authStore.logout();
  ElMessage.success("已退出登录");
  router.push("/login");
};

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

let timeInterval = null;
onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
});
</script>

<style scoped>
.layout {
  height: 100vh;
}

.sidebar {
  background: var(--sidebar-bg);
  border-right: 1px solid var(--gray-800);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-4);
  border-bottom: 1px solid var(--gray-800);
}

.logo-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
}

.sidebar-logo.collapsed {
  justify-content: center;
  padding: var(--space-6) 0;
}

.sidebar-logo:not(.collapsed) {
  justify-content: flex-start;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.logo-title {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  color: var(--sidebar-text-active);
  letter-spacing: -0.15px;
}

.logo-subtitle {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--gray-500);
  text-transform: uppercase;
}

.sidebar-menu {
  flex: 1;
  border: none;
  background: transparent;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 240px;
}

:deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
  color: var(--sidebar-text);
  border-radius: var(--radius-sm);
  margin: 2px 4px;
}

:deep(.el-menu-item:hover) {
  background: var(--sidebar-hover);
  color: var(--sidebar-text-active);
}

:deep(.el-menu-item.is-active) {
  background: var(--sidebar-active);
  color: var(--sidebar-text-active);
}

:deep(.el-menu-item.is-active::before) {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 20px;
  background: var(--primary);
  border-radius: 0 2px 2px 0;
}

:deep(.el-menu-item .el-icon) {
  margin-right: var(--space-3);
}

.sidebar-footer {
  padding: var(--space-4) var(--space-3);
  border-top: 1px solid var(--gray-800);
}

.collapse-btn {
  width: 100%;
  justify-content: flex-start;
  color: var(--gray-500);
}

.collapse-btn:hover {
  background: var(--sidebar-hover);
  color: var(--primary);
}

.collapse-btn:hover .collapse-icon {
  color: var(--primary);
}

.collapse-text {
  font-size: var(--text-sm);
  margin-left: var(--space-2);
}

.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-8);
  height: 56px;
  background: var(--bg-header);
  border-bottom: 1px solid var(--border-color);
}

.breadcrumb-item {
  font-size: var(--text-lg);
  color: var(--gray-900);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.header-time {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--gray-500);
}

.header-user {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.user-name {
  font-size: var(--text-sm);
  color: var(--gray-900);
}

.btn-logout {
  border-radius: 99999px;
}

.main-content {
  padding: var(--space-6);
  background: var(--bg-page);
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
