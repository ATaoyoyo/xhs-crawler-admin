<template>
  <el-card shadow="hover" class="page-card">
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
    <slot />
  </el-card>
</template>

<style scoped>
.page-card {
  border-radius: var(--radius-md);
}
</style>
