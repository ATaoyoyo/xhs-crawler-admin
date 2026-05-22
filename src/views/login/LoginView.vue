<template>
  <div class="login-container">
    <el-card class="login-card" shadow="never">
      <div class="login-header">
        <img :src="logoUrl" alt="薯爬爬" class="logo" />
        <h1 class="title">薯爬爬管理系统</h1>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            :loading="loading"
            class="login-btn"
            type="primary"
            size="large"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import logoUrl from '@/assets/images/logo.png'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const loading = ref(false)
const form = reactive({
  username: '',
  password: ''
})
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  await formRef.value.validate()
  loading.value = true
  try {
    await authStore.login(form.username, form.password)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (e) {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--gray-50);
}

.login-card {
  width: 400px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.logo {
  width: 64px;
  height: 64px;
  margin-bottom: var(--space-4);
  border-radius: 50%;
}

.title {
  margin: 0 0 var(--space-2);
  color: var(--gray-900);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  letter-spacing: -0.42px;
}

.subtitle {
  margin: 0;
  color: var(--gray-500);
  font-size: var(--text-sm);
}

.login-form {
  margin-top: var(--space-6);
}

.login-btn {
  width: 100%;
  border-radius: var(--radius-sm);
}
</style>
