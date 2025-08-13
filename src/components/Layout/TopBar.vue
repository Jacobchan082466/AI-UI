<template>
  <div class="top-bar">
    <!-- 左侧区域 -->
    <div class="top-bar-left">
      <!-- Logo和标题 -->
      <div class="logo-section">
        <el-icon class="logo-icon" size="24">
          <House />
        </el-icon>
        <span class="title">AI UI 系统</span>
      </div>
    </div>

    <!-- 右侧区域 -->
    <div class="top-bar-right">
      <!-- 通知 -->
      <el-button type="text" class="header-btn">
        <el-badge :value="3" class="item">
          <el-icon size="18">
            <Bell />
          </el-icon>
        </el-badge>
      </el-button>
    </div>
  </div>
</template>

<script setup>
// 移除用户登录相关功能
</script>

<style scoped>
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  background-color: #fff;
}

.top-bar-left {
  display: flex;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo-icon {
  color: #409eff;
  margin-right: 8px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-btn {
  color: #666;
  padding: 8px;
}

.header-btn:hover {
  color: #409eff;
}
</style>
