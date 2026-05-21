<template>
  <el-container class="default-layout">
    <el-aside :width="collapsed ? '64px' : '200px'">
      <div class="logo">
        <span v-if="!collapsed">小红书管理</span>
        <span v-else>管理</span>
      </div>
      <el-menu
        :default-active="$route.path"
        :collapse="collapsed"
        :collapse-transition="false"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/posts">
          <el-icon><Document /></el-icon>
          <span>笔记管理</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleSidebar">
            <Expand v-if="collapsed" />
            <Fold v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <span class="username">{{ authStore.user?.username }}</span>
          <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Fold, Expand, DataAnalysis, Document, User } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { logout as logoutApi } from '@/api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

const collapsed = computed(() => appStore.sidebarCollapsed)

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const handleLogout = async () => {
  try {
    await logoutApi()
  } catch (e) {
    // ignore error
  }
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.default-layout {
  height: 100vh;
}
.el-aside {
  background: var(--sidebar-bg);
  transition: width 0.3s;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  background: var(--sidebar-active);
}
.el-menu {
  border: none;
  background: var(--sidebar-bg);
}
.el-menu-item {
  color: var(--sidebar-text);
}
.el-menu-item:hover,
.el-menu-item.is-active {
  background: var(--sidebar-hover) !important;
  color: var(--sidebar-text-active);
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-header);
  box-shadow: var(--shadow-sm);
}
.collapse-btn {
  font-size: 20px;
  cursor: pointer;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.username {
  color: var(--text-regular);
}
.el-main {
  background: var(--bg-page);
  padding: 20px;
}
</style>