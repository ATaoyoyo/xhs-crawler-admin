<template>
  <el-card shadow="hover" class="stat-card">
    <div class="stat-value">{{ value }}</div>
    <div class="stat-label">{{ label }}</div>
  </el-card>
</template>

<script setup>
defineProps({
  value: {
    type: [Number, String],
    required: true
  },
  label: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.stat-card {
  text-align: center;
  padding: 20px 0;
  border-radius: var(--radius-md);
}
.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--xhs-primary);
}
.stat-label {
  font-size: 14px;
  color: var(--text-regular);
  margin-top: 10px;
}
</style>
