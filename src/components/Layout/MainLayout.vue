<template>
  <el-container class="layout-container">
    <!-- 顶部导航条 -->
    <el-header class="layout-header">
      <TopBar />
    </el-header>

    <!-- 主体内容区域 -->
    <el-container>
      <!-- 左侧导航栏 -->
      <el-aside class="layout-aside" width="250px">
        <SideBar />
      </el-aside>

      <!-- 主要内容区域 -->
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import TopBar from './TopBar.vue'
import SideBar from './SideBar.vue'
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0;
  height: 60px !important;
  line-height: 60px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.layout-aside {
  background-color: #001529;
}

.layout-main {
  background-color: #f0f2f5;
  padding: 24px;
  overflow-y: auto;
}
</style>
