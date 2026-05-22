<template>
  <div class="users-view">
    <!-- Header -->
    <el-row :gutter="20" align="middle" class="page-header">
      <el-col :span="12">
        <h1 class="page-title">管理员账号</h1>
      </el-col>
      <el-col :span="12" class="text-right">
        <el-button type="primary" @click="handleCreate">创建管理员</el-button>
      </el-col>
    </el-row>

    <!-- Table Card -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <span>管理员列表</span>
      </template>
      <el-table :data="accountList" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'super' ? 'danger' : 'primary'" size="small">
              {{ row.role === 'super' ? '超级管理员' : '管理员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'" size="small">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" width="180">
          <template #default="{ row }">
            {{ row.lastLoginAt || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无数据" />
        </template>
      </el-table>
      <el-row justify="end" class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          background
          @size-change="loadAccounts"
          @current-change="loadAccounts"
        />
      </el-row>
    </el-card>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="管理员详情" width="500px">
      <div v-if="currentAccount" class="account-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ currentAccount.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentAccount.username }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="currentAccount.role === 'super' ? 'danger' : 'primary'" size="small">
              {{ currentAccount.role === 'super' ? '超级管理员' : '管理员' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentAccount.isActive ? 'success' : 'info'" size="small">
              {{ currentAccount.isActive ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ currentAccount.lastLoginAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentAccount.createdAt }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="formVisible" :title="isEdit ? '编辑管理员' : '创建管理员'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密码" :prop="isEdit ? '' : 'password'">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
          <span v-if="isEdit" class="form-hint">留空则不修改密码</span>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="超级管理员" value="super" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-switch v-model="form.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAdminAccountList,
  getAdminAccountDetail,
  createAdminAccount,
  updateAdminAccount,
  deleteAdminAccount
} from '@/api/users'

const loading = ref(false)
const accountList = ref([])
const detailVisible = ref(false)
const formVisible = ref(false)
const currentAccount = ref(null)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const form = reactive({
  username: '',
  password: '',
  role: 'admin',
  isActive: true
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const loadAccounts = async () => {
  loading.value = true
  try {
    const res = await getAdminAccountList({
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    accountList.value = res.data.items
    pagination.total = res.data.total
  } catch (e) {
    ElMessage.error('加载管理员列表失败')
  } finally {
    loading.value = false
  }
}

const handleView = async (row) => {
  try {
    const res = await getAdminAccountDetail(row.id)
    currentAccount.value = res.data
    detailVisible.value = true
  } catch (e) {
    ElMessage.error('加载详情失败')
  }
}

const handleCreate = () => {
  isEdit.value = false
  form.username = ''
  form.password = ''
  form.role = 'admin'
  form.isActive = true
  formVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentAccount.value = row
  form.username = row.username
  form.password = ''
  form.role = row.role
  form.isActive = row.isActive
  formVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  submitLoading.value = true
  try {
    const hashPassword = async (pwd) => {
      const encoder = new TextEncoder()
      const data = encoder.encode(pwd)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }

    const data = {
      role: form.role,
      is_active: form.isActive
    }
    if (form.password) {
      data.password = await hashPassword(form.password)
    }
    if (isEdit.value) {
      await updateAdminAccount(currentAccount.value.id, data)
      ElMessage.success('管理员更新成功')
    } else {
      await createAdminAccount({
        username: form.username,
        password: data.password,
        role: form.role
      })
      ElMessage.success('管理员创建成功')
    }
    formVisible.value = false
    loadAccounts()
  } catch (e) {
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除管理员 "${row.username}" 吗？`, '删除确认', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteAdminAccount(row.id)
      ElMessage.success('删除成功')
      loadAccounts()
    } catch (e) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadAccounts()
})
</script>

<style scoped>
.users-view {
  padding: var(--space-6);
}

.page-header {
  margin-bottom: var(--space-6);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  margin: 0;
  letter-spacing: -0.5px;
}

.text-right {
  text-align: right;
}

.form-hint {
  font-size: 12px;
  color: var(--gray-500);
  margin-top: 4px;
}
</style>