<template>
  <div class="sidebar">
    <!-- 导航菜单 -->
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      :collapse="collapsed"
      :unique-opened="true"
      background-color="#001529"
      text-color="#fff"
      active-text-color="#fff"
      router
    >
      <!-- 拍摄 -->
      <el-menu-item index="/home">
        <el-icon><Camera /></el-icon>
        <template #title>拍摄</template>
      </el-menu-item>

      <!-- 文件管理 -->
      <el-menu-item index="/file-management">
        <el-icon><Folder /></el-icon>
        <template #title>文件管理</template>
      </el-menu-item>

      <!-- 识别复检 -->
      <el-menu-item index="/review">
        <el-icon><Search /></el-icon>
        <template #title>识别复检</template>
      </el-menu-item>

      <!-- 历史记录 -->
      <el-menu-item index="/history">
        <el-icon><Clock /></el-icon>
        <template #title>历史记录</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Camera, Search, Clock, Folder } from '@element-plus/icons-vue'

// 定义props
defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
})

// 定义事件
defineEmits(['toggle'])

// 获取当前路由
const route = useRoute()

// 计算当前激活的菜单项
const activeMenu = computed(() => {
  return route.path
})
</script>

<style scoped>
.sidebar {
  height: 100%;
  background-color: #001529;
}

.sidebar-menu {
  border: none;
  height: 100%;
  width: 250px;
}

/* 自定义菜单项样式 */
:deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  color: #fff !important;
}

:deep(.el-sub-menu .el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  color: #fff !important;
}

:deep(.el-menu-item:hover) {
  background-color: #1890ff !important;
  color: #fff !important;
}

:deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
  font-weight: bold !important;
  color: #fff !important;
}

:deep(.el-menu-item.is-active span) {
  font-weight: bold !important;
  color: #fff !important;
}

:deep(.el-menu-item.is-active .el-icon) {
  color: #fff !important;
}

:deep(.el-sub-menu__title:hover) {
  background-color: #1890ff !important;
  color: #fff !important;
}

/* 选中状态的子菜单项也加粗并保持白色 */
:deep(.el-sub-menu .el-menu-item.is-active) {
  font-weight: bold !important;
  color: #fff !important;
  background-color: #1890ff !important;
}

:deep(.el-sub-menu .el-menu-item.is-active span) {
  font-weight: bold !important;
  color: #fff !important;
}

:deep(.el-sub-menu .el-menu-item.is-active .el-icon) {
  color: #fff !important;
}

/* 确保所有文字都是白色 */
:deep(.el-menu-item span) {
  color: #fff !important;
}

:deep(.el-sub-menu__title span) {
  color: #fff !important;
}

:deep(.el-menu-item .el-icon) {
  color: #fff !important;
}

:deep(.el-sub-menu__title .el-icon) {
  color: #fff !important;
}
</style>
