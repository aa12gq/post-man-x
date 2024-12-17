<template>
  <div class="auth-manager">
    <div class="auth-sidebar">
      <div class="selector-header">
        <div class="header-icon">
          <el-icon><Lock /></el-icon>
        </div>
        <span class="header-title">Authorization</span>
      </div>
      <div class="auth-menu">
        <div
          v-for="type in authTypes"
          :key="type.value"
          class="menu-item"
          :class="{
            'is-active': localAuthType === type.value,
            'is-configured': isAuthTypeConfigured(type.value),
          }"
          @click="handleAuthTypeChange(type.value)"
        >
          <div class="item-icon">
            <component :is="type.icon" />
          </div>
          <div class="item-content">
            <span class="item-label">{{ type.label }}</span>
            <span class="item-desc">{{ type.description }}</span>
          </div>
          <div class="item-status">
            <el-tag
              v-if="isAuthTypeConfigured(type.value)"
              size="small"
              type="success"
            >
              Configured
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <div class="auth-main">
      <div class="main-header">
        <div class="header-content">
          <div class="header-icon">
            <component :is="currentType.icon" />
          </div>
          <div class="header-info">
            <h3>{{ currentType.label }}</h3>
            <p>{{ currentType.description }}</p>
          </div>
        </div>
        <el-tag size="small" :type="authStatusType" class="auth-status">
          {{ authStatusText }}
        </el-tag>
      </div>
      <div class="main-content">
        <!-- API Key Auth -->
        <div v-if="localAuthType === 'apikey'" class="auth-form">
          <div class="form-header">
            <div class="form-icon">
              <el-icon><Key /></el-icon>
            </div>
            <span>API Key Authentication</span>
          </div>
          <div class="form-description">Authenticate using an API key</div>
          <div class="form-item">
            <label>Key</label>
            <el-input
              v-model="localApiKey.key"
              placeholder="Enter header name (e.g. X-API-Key)"
              @change="emitAuthChange"
              :prefix-icon="Key"
              :status="isApiKeyValid ? '' : 'error'"
            />
          </div>
          <div class="form-item">
            <label>Value</label>
            <el-input
              v-model="localApiKey.value"
              type="password"
              placeholder="Enter key value"
              show-password
              @change="emitAuthChange"
              :prefix-icon="Key"
              :status="isApiKeyValid ? '' : 'error'"
            />
          </div>
          <div class="form-description">
            <el-icon><InfoFilled /></el-icon>
            <span>The API key will be added as a request header</span>
          </div>
          <div class="form-footer" v-if="!isApiKeyValid">
            <el-alert type="warning" :closable="false" show-icon>
              Both key and value are required
            </el-alert>
          </div>
        </div>

        <!-- Basic Auth -->
        <div v-if="localAuthType === 'basic'" class="auth-form">
          <div class="form-header">
            <div class="form-icon">
              <el-icon><Key /></el-icon>
            </div>
            <span>Basic Authentication</span>
          </div>
          <div class="form-description">
            Authenticate using a username and password pair
          </div>
          <div class="form-item">
            <label>Username</label>
            <el-input
              v-model="localBasicAuth.username"
              placeholder="Enter username"
              @change="emitAuthChange"
              :prefix-icon="User"
              :status="isBasicAuthValid ? '' : 'error'"
            />
          </div>
          <div class="form-item">
            <label>Password</label>
            <el-input
              v-model="localBasicAuth.password"
              type="password"
              placeholder="Enter password"
              show-password
              @change="emitAuthChange"
              :prefix-icon="Lock"
              :status="isBasicAuthValid ? '' : 'error'"
            />
          </div>
          <div class="form-footer" v-if="!isBasicAuthValid">
            <el-alert type="warning" :closable="false" show-icon>
              Both username and password are required
            </el-alert>
          </div>
        </div>

        <!-- Bearer Token -->
        <div v-if="localAuthType === 'bearer'" class="auth-form">
          <div class="form-header">
            <div class="form-icon">
              <el-icon><Key /></el-icon>
            </div>
            <span>Bearer Token Authentication</span>
          </div>
          <div class="form-description">Authenticate using a bearer token</div>
          <div class="form-item">
            <label>Token</label>
            <el-input
              v-model="localBearerToken"
              type="password"
              placeholder="Enter token"
              show-password
              @change="emitAuthChange"
              :prefix-icon="Key"
              :status="isBearerTokenValid ? '' : 'error'"
            />
          </div>
          <div class="form-footer" v-if="!isBearerTokenValid">
            <el-alert type="warning" :closable="false" show-icon>
              Bearer token is required
            </el-alert>
          </div>
        </div>

        <!-- No Auth -->
        <div v-if="localAuthType === 'noauth'" class="no-auth-message">
          <div class="no-auth-content">
            <el-icon class="large-icon"><Lock /></el-icon>
            <h3>No Authentication</h3>
            <p>This request does not use any authentication method</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import {
  Lock,
  Key,
  User,
  Connection,
  InfoFilled,
} from "@element-plus/icons-vue";

const props = defineProps<{
  initialAuthType: "noauth" | "apikey" | "basic" | "bearer";
  initialBasicAuth?: {
    username: string;
    password: string;
  };
  initialApiKey?: {
    key: string;
    value: string;
  };
  initialBearerToken?: string;
}>();

const emit = defineEmits(["auth-change"]);

const localAuthType = ref(props.initialAuthType);
const localBasicAuth = ref({
  username: props.initialBasicAuth?.username || "",
  password: props.initialBasicAuth?.password || "",
});
const localBearerToken = ref(props.initialBearerToken || "");
const localApiKey = ref({
  key: props.initialApiKey?.key || "",
  value: props.initialApiKey?.value || "",
});

watch(
  () => props.initialAuthType,
  (newType) => {
    localAuthType.value = newType;
  }
);

watch(
  () => props.initialBasicAuth,
  (newAuth) => {
    if (newAuth) {
      localBasicAuth.value = { ...newAuth };
    }
  }
);

watch(
  () => props.initialBearerToken,
  (newToken) => {
    localBearerToken.value = newToken || "";
  }
);

watch(
  () => props.initialApiKey,
  (newApiKey) => {
    if (newApiKey) {
      localApiKey.value = { ...newApiKey };
    }
  }
);

const handleAuthTypeChange = (
  value: "noauth" | "apikey" | "bearer" | "basic"
) => {
  localAuthType.value = value;
  emitAuthChange();
};

const emitAuthChange = () => {
  emit("auth-change", {
    type: localAuthType.value,
    basicAuth: localBasicAuth.value,
    bearerToken: localBearerToken.value,
    apiKey: localApiKey.value,
  });
};

const isBasicAuthValid = computed(() => {
  if (localAuthType.value !== "basic") return true;
  return (
    localBasicAuth.value.username.trim() !== "" &&
    localBasicAuth.value.password.trim() !== ""
  );
});

const isBearerTokenValid = computed(() => {
  if (localAuthType.value !== "bearer") return true;
  return localBearerToken.value.trim() !== "";
});

const isApiKeyValid = computed(() => {
  if (localAuthType.value !== "apikey") return true;
  return (
    localApiKey.value.key.trim() !== "" && localApiKey.value.value.trim() !== ""
  );
});

const authStatusType = computed(() => {
  if (localAuthType.value === "noauth") return "info";
  if (localAuthType.value === "basic" && !isBasicAuthValid.value)
    return "warning";
  if (localAuthType.value === "bearer" && !isBearerTokenValid.value)
    return "warning";
  if (localAuthType.value === "apikey" && !isApiKeyValid.value)
    return "warning";
  return "success";
});

const authStatusText = computed(() => {
  if (localAuthType.value === "noauth") return "No Auth";
  if (
    !isBasicAuthValid.value ||
    !isBearerTokenValid.value ||
    !isApiKeyValid.value
  )
    return "Incomplete";
  return "Configured";
});

type AuthType = "noauth" | "apikey" | "basic" | "bearer";

const authTypes = [
  {
    value: "noauth" as AuthType,
    label: "No Authentication",
    icon: Lock,
    description: "Make requests without authentication",
  },
  {
    value: "apikey" as AuthType,
    label: "API Key",
    icon: Key,
    description: "Authenticate using an API key in request headers",
  },
  {
    value: "basic" as AuthType,
    label: "Basic Auth",
    icon: Key,
    description: "Use username and password for authentication",
  },
  {
    value: "bearer" as AuthType,
    label: "Bearer Token",
    icon: Connection,
    description: "Use a bearer token in Authorization header",
  },
];

const isAuthTypeConfigured = (
  type: "noauth" | "apikey" | "basic" | "bearer"
) => {
  if (type === "noauth") return false;
  if (type === "basic")
    return isBasicAuthValid.value && localAuthType.value === "basic";
  if (type === "bearer")
    return isBearerTokenValid.value && localAuthType.value === "bearer";
  if (type === "apikey")
    return isApiKeyValid.value && localAuthType.value === "apikey";
  return false;
};

const currentType = computed(() => {
  return (
    authTypes.find((type) => type.value === localAuthType.value) || authTypes[0]
  );
});
</script>

<style scoped>
.auth-manager {
  height: 100%;
  display: flex;
  background-color: var(--surface-1);
}

.auth-sidebar {
  width: 280px;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  background-color: var(--background-light);
}

.selector-header {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  background-color: var(--header);
}

.auth-menu {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  cursor: pointer;
  border-radius: 6px;
  border: 1px solid transparent;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background-color: var(--surface-1);
  border-color: var(--border);
}

.menu-item.is-active {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-5);
}

.item-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: var(--surface-1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.is-active .item-icon {
  background-color: var(--el-color-primary);
  color: white;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 2px;
}

.item-desc {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.auth-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.main-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  background-color: var(--header);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-info h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text);
}

.header-info p {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.auth-form {
  max-width: 600px;
}

.form-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-icon .el-icon {
  font-size: 20px;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 500;
  color: var(--text);
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
}

.no-auth-message {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.no-auth-content {
  text-align: center;
  padding: 40px;
}

.large-icon {
  font-size: 48px;
  color: var(--el-color-info);
  margin-bottom: 16px;
}

.no-auth-content h3 {
  margin: 0 0 8px;
  color: var(--text);
}

.no-auth-content p {
  margin: 0;
  color: var(--text-secondary);
}

.form-description {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  padding: 12px;
  background-color: var(--el-color-info-light-9);
  border-radius: 8px;
  line-height: 1.5;
}

.form-description .el-icon {
  color: var(--el-color-info);
  font-size: 16px;
}

.form-footer {
  margin-top: 16px;
}

:deep(.el-alert) {
  border-radius: 4px;
  background-color: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-5);
}

.auth-type {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--surface-1);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 1px solid transparent;
  height: 40px;
}

.auth-type:hover {
  background-color: var(--background-light);
  color: var(--text);
  border-color: var(--border);
}

.auth-type.is-active {
  background-color: var(--selected);
  color: var(--el-color-primary);
  font-weight: 500;
  border-color: var(--border-active);
  z-index: 1;
}

.type-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: var(--surface-1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.auth-type.is-active .type-icon {
  background-color: var(--el-color-primary);
  color: white;
}

:deep(.el-radio-button__inner) {
  background-color: var(--surface-1);
  border-color: var(--border);
  color: var(--text);
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: var(--selected);
  border-color: var(--border-active);
  color: var(--el-color-primary);
  box-shadow: -1px 0 0 0 var(--border-active);
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left: 1px solid var(--border);
}

:deep(.el-radio-button__inner:hover) {
  color: var(--el-color-primary);
}
</style>
