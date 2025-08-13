<template>
  <div class="data-list-page">
    <div class="page-header">
      <h2>数据列表</h2>
      <p>管理和查看系统中的所有数据</p>
    </div>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>数据表格</span>
          <el-button type="primary" :icon="Plus">新增数据</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" width="150" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default>
            <el-button size="small" type="primary">编辑</el-button>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const tableData = ref([
  {
    id: 1,
    name: '数据项目A',
    type: '类型1',
    status: '正常',
    createTime: '2024-01-15 10:30:00',
  },
  {
    id: 2,
    name: '数据项目B',
    type: '类型2',
    status: '异常',
    createTime: '2024-01-14 15:20:00',
  },
  {
    id: 3,
    name: '数据项目C',
    type: '类型1',
    status: '正常',
    createTime: '2024-01-13 09:15:00',
  },
])
</script>

<style scoped>
.data-list-page {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #333;
}

.page-header p {
  margin: 0;
  color: #666;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
