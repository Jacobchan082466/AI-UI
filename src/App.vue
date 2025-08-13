<template>
  <div id="app">
    <MainLayout />
  </div>
</template>

<script setup>
import MainLayout from './components/Layout/MainLayout.vue'
</script>

<style>
#app {
  height: 100vh;
  margin: 0;
  padding: 0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑',
    Arial, sans-serif;
}
</style>
