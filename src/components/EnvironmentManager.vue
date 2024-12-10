<template>
  <div class="environment-manager">
    <div class="env-selector">
      <el-select
        v-model="currentEnvId"
        placeholder="选择环境"
        style="width: 200px"
      >
        <el-option
          v-for="env in environments"
          :key="env.id"
          :label="env.name"
          :value="env.id"
        />
      </el-select>
      <el-button @click="showEnvDialog = true">管理环境</el-button>
    </div>

    <!-- 环境管理对话框 -->
    <el-dialog
      v-model="showEnvDialog"
      title="环境管理"
      width="80%"
    >
      <el-tabs v-model="activeEnvTab">
        <el-tab-pane
          v-for="env in environments"
          :key="env.id"
          :label="env.name"
          :name="env.id"
        >
          <el-table :data="getEnvVariables(env)" style="width: 100%">
            <el-table-column label="变量名">
              <template #default="scope">
                <el-input v-model="scope.row.key" placeholder="变量名" />
              </template>
            </el-table-column>
            <el-table-column label="值">
              <template #default="scope">
                <el-input v-model="scope.row.value" placeholder="变量值" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button
                  type="danger"
                  size="small"
                  @click="removeVariable(env, scope.$index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="env-actions">
            <el-button type="primary" @click="addVariable(env)">
              添加变量
            </el-button>
            <el-button type="danger" @click="deleteEnvironment(env.id)">
              删除环境
            </el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
      <div class="new-env-form">
        <el-input
          v-model="newEnvName"
          placeholder="新环境名称"
          style="width: 200px"
        />
        <el-button type="primary" @click="createEnvironment">
          创建新环境
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import EnvironmentService, { Environment } from '../services/EnvironmentService'

const environments = ref<Environment[]>([])
const currentEnvId = ref('')
const showEnvDialog = ref(false)
const activeEnvTab = ref('')
const newEnvName = ref('')

onMounted(() => {
  loadEnvironments()
  const currentEnv = EnvironmentService.getCurrentEnvironment()
  if (currentEnv) {
    currentEnvId.value = currentEnv.id
  }
})

const loadEnvironments = () => {
  environments.value = EnvironmentService.getEnvironments()
}

const getEnvVariables = (env: Environment) => {
  return Object.entries(env.variables).map(([key, value]) => ({ key, value }))
}

const createEnvironment = () => {
  if (!newEnvName.value) return
  
  EnvironmentService.saveEnvironment({
    name: newEnvName.value,
    variables: {}
  })
  
  newEnvName.value = ''
  loadEnvironments()
}

const deleteEnvironment = (id: string) => {
  EnvironmentService.deleteEnvironment(id)
  loadEnvironments()
}

const addVariable = (env: Environment) => {
  env.variables['新变量'] = ''
  EnvironmentService.updateEnvironment(env)
  loadEnvironments()
}

const removeVariable = (env: Environment, index: number) => {
  const variables = getEnvVariables(env)
  delete env.variables[variables[index].key]
  EnvironmentService.updateEnvironment(env)
  loadEnvironments()
}

watch(currentEnvId, (newId) => {
  if (newId) {
    EnvironmentService.setCurrentEnvironment(newId)
  }
})
</script>

<style scoped>
.environment-manager {
  margin: 10px 0;
}

.env-selector {
  display: flex;
  gap: 10px;
  align-items: center;
}

.env-actions {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}

.new-env-form {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
</style> 