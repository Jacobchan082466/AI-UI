<template>
  <div class="data-analysis-page">
    <div class="page-header">
      <h2>数据分析</h2>
      <p>查看数据统计和分析报表</p>
    </div>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>数据趋势图</span>
          </template>
          <div class="chart-placeholder">
            <el-icon size="60" color="#ddd">
              <TrendCharts />
            </el-icon>
            <p>图表区域 - 可集成 ECharts 等图表库</p>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <span>数据分布</span>
          </template>
          <div class="chart-placeholder">
            <el-icon size="60" color="#ddd">
              <PieChart />
            </el-icon>
            <p>饼图区域 - 显示数据分布情况</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>数据报表</span>
          </template>
          <el-table :data="reportData" style="width: 100%">
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="visits" label="访问量" width="100" />
            <el-table-column prop="users" label="用户数" width="100" />
            <el-table-column prop="revenue" label="收入" width="120" />
            <el-table-column prop="growth" label="增长率" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.growth > 0 ? 'success' : 'danger'">
                  {{ scope.row.growth > 0 ? '+' : '' }}{{ scope.row.growth }}%
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const reportData = ref([
  {
    date: '2024-01-15',
    visits: 1234,
    users: 567,
    revenue: '¥12,345',
    growth: 5.2,
  },
  {
    date: '2024-01-14',
    visits: 1156,
    users: 523,
    revenue: '¥11,890',
    growth: -2.1,
  },
  {
    date: '2024-01-13',
    visits: 1298,
    users: 601,
    revenue: '¥13,200',
    growth: 8.7,
  },
])
</script>

<style scoped>
.data-analysis-page {
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

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  text-align: center;
}

.chart-placeholder p {
  margin-top: 16px;
  font-size: 14px;
}
</style>
