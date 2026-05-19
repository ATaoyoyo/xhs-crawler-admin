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
import { ElMessage } from 'element-plus'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

const collapsed = computed(() => appStore.sidebarCollapsed)

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const handleLogout = () => {
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
  background: #304156;
  transition: width 0.3s;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  background: #2b3a4a;
}
.el-menu {
  border: none;
  background: #304156;
}
.el-menu-item {
  color: #bfcbd9;
}
.el-menu-item:hover,
.el-menu-item.is-active {
  background: #263445 !important;
  color: #409eff;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
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
  color: #666;
}
.el-main {
  background: #f0f2f5;
  padding: 20px;
}
</style>