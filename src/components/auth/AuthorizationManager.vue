<template>
  <div class="auth-container">
    <div class="auth-type-sidebar">
      <el-radio-group v-model="authType" class="auth-type-list">
        <el-radio value="noauth">No Auth</el-radio>
        <el-radio value="basic">Basic Auth</el-radio>
        <el-radio value="bearer">Bearer Token</el-radio>
      </el-radio-group>
    </div>

    <div class="auth-form-container">
      <!-- No Auth -->
      <template v-if="authType === 'noauth'">
        <div class="auth-info">
          <el-alert
            title="This request does not use any authorization"
            type="info"
            :closable="false"
          />
        </div>
      </template>

      <!-- Basic Auth -->
      <template v-if="authType === 'basic'">
        <el-form label-position="top">
          <el-form-item label="Username">
            <el-input v-model="basicAuth.username" />
          </el-form-item>
          <el-form-item label="Password">
            <el-input v-model="basicAuth.password" type="password" />
          </el-form-item>
        </el-form>
      </template>

      <!-- Bearer Token -->
      <template v-if="authType === 'bearer'">
        <el-form label-position="top">
          <el-form-item label="Token">
            <el-input v-model="bearerToken" />
          </el-form-item>
        </el-form>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  initialAuthType?: string
  initialBasicAuth?: { username: string; password: string }
  initialBearerToken?: string
}>()

const emit = defineEmits(['auth-change'])

const authType = ref(props.initialAuthType || 'noauth')
const basicAuth = ref({
  username: props.initialBasicAuth?.username || '',
  password: props.initialBasicAuth?.password || ''
})
const bearerToken = ref(props.initialBearerToken || '')

watch([authType, basicAuth, bearerToken], () => {
  emit('auth-change', {
    type: authType.value,
    basicAuth: basicAuth.value,
    bearerToken: bearerToken.value
  })
})
</script>

<style scoped>
.auth-container {
  display: flex;
  height: 100%;
}

.auth-type-sidebar {
  width: 200px;
  border-right: 1px solid var(--el-border-color-light);
  padding: 16px;
}

.auth-type-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-form-container {
  flex: 1;
  padding: 16px;
}

.auth-info {
  margin-top: 16px;
}
</style>
