<template>
  <el-dialog
    v-model="visible"
    title="布局设置"
    width="80%"
    :before-close="handleClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="layout-settings">
      <!-- 布局预览区域 -->
      <div class="layout-preview-section">
        <div class="preview-container">
          <div
            class="layout-preview"
            :class="[
              previewSettings.currentLayout,
              { compact: previewSettings.compactMode },
            ]"
          >
            <!-- 预览头部 -->
            <div
              class="preview-header"
              :class="{ hidden: !previewSettings.showHeader }"
            >
              <div class="preview-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
            <!-- 预览主体 -->
            <div class="preview-body">
              <!-- 侧边栏 -->
              <div
                class="preview-sidebar"
                :class="{
                  hidden: !previewSettings.showSidebar,
                  right: previewSettings.sidebarPosition === 'right',
                  collapsed: previewSettings.isCollapsed,
                }"
                :style="{
                  width: previewSettings.isCollapsed
                    ? '48px'
                    : `${previewSettings.sidebarWidth}px`,
                }"
              >
                <div class="preview-sidebar-content">
                  <div class="preview-item"></div>
                  <div class="preview-item"></div>
                  <div class="preview-item"></div>
                </div>
              </div>
              <!-- 主内容区域 -->
              <div class="preview-main">
                <!-- 标签页 -->
                <div
                  class="preview-tabs"
                  :class="{
                    hidden: !previewSettings.showTabs,
                    [previewSettings.tabsPosition]: true,
                  }"
                >
                  <div class="preview-tab"></div>
                  <div class="preview-tab active"></div>
                  <div class="preview-tab"></div>
                </div>
                <!-- 内容区域 -->
                <div class="preview-content">
                  <!-- 工具栏 -->
                  <div
                    class="preview-toolbar"
                    :class="{
                      hidden: !previewSettings.showToolbar,
                      [previewSettings.toolbarPosition]: true,
                    }"
                  ></div>
                  <!-- 编辑器区域 -->
                  <div class="preview-editor"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 布局控制面板 -->
      <div class="layout-controls">
        <!-- 布局预设 -->
        <el-form-item label="布局预设">
          <div class="preset-buttons">
            <el-button-group>
              <el-button
                v-for="preset in layoutPresets"
                :key="preset.id"
                :type="
                  previewSettings.currentLayout === preset.id ? 'primary' : ''
                "
                @click.stop="(event) => selectLayout(preset.id, event)"
              >
                <el-icon><component :is="preset.icon" /></el-icon>
                {{ preset.name }}
              </el-button>
            </el-button-group>
          </div>
        </el-form-item>

        <!-- 组件显示控制 -->
        <el-form-item label="显示组件">
          <div class="component-toggles">
            <el-checkbox v-model="previewSettings.showHeader">顶栏</el-checkbox>
            <el-checkbox v-model="previewSettings.showSidebar"
              >侧边栏</el-checkbox
            >
            <el-checkbox v-model="previewSettings.showTabs">标签页</el-checkbox>
            <el-checkbox v-model="previewSettings.showToolbar"
              >工具栏</el-checkbox
            >
          </div>
        </el-form-item>

        <!-- 侧边栏设置 -->
        <template v-if="previewSettings.showSidebar">
          <el-form-item label="侧边栏">
            <div class="sidebar-settings">
              <el-radio-group
                v-model="previewSettings.sidebarPosition"
                size="small"
              >
                <el-radio-button :value="'left'">左侧</el-radio-button>
                <el-radio-button :value="'right'">右侧</el-radio-button>
              </el-radio-group>
              <el-checkbox v-model="previewSettings.isCollapsible"
                >可折叠</el-checkbox
              >
              <div class="width-control">
                <span>宽度:</span>
                <el-slider
                  v-model="previewSettings.sidebarWidth"
                  :min="180"
                  :max="500"
                  :step="10"
                  :marks="{
                    180: '最小',
                    300: '默认',
                    500: '最大',
                  }"
                />
              </div>
            </div>
          </el-form-item>
        </template>

        <!-- 标签页设置 -->
        <template v-if="previewSettings.showTabs">
          <el-form-item label="标签页位置">
            <el-radio-group v-model="previewSettings.tabsPosition" size="small">
              <el-radio-button :value="'top'">顶部</el-radio-button>
              <el-radio-button :value="'left'">左侧</el-radio-button>
              <el-radio-button :value="'bottom'">底部</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </template>

        <!-- 工具栏设置 -->
        <template v-if="previewSettings.showToolbar">
          <el-form-item label="工具栏位置">
            <el-radio-group
              v-model="previewSettings.toolbarPosition"
              size="small"
            >
              <el-radio-button :value="'top'">顶部</el-radio-button>
              <el-radio-button :value="'bottom'">底部</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </template>

        <!-- 其他布局选项 -->
        <el-form-item label="其他选项">
          <div class="other-options">
            <el-checkbox v-model="previewSettings.showBorders"
              >显示边框</el-checkbox
            >
            <el-checkbox v-model="previewSettings.compactMode"
              >紧凑模式</el-checkbox
            >
            <el-checkbox v-model="previewSettings.showShadows"
              >显示阴影</el-checkbox
            >
          </div>
        </el-form-item>

        <!-- 高级布局选项 -->
        <el-collapse>
          <el-collapse-item title="高级布局选项" name="advanced">
            <!-- 布局模式 -->
            <el-form-item label="布局模式">
              <el-radio-group v-model="previewSettings.layoutMode" size="small">
                <el-radio-button :value="'fixed'">固定布局</el-radio-button>
                <el-radio-button :value="'fluid'">流式布局</el-radio-button>
                <el-radio-button :value="'custom'">自定义布局</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <!-- 区域比例控制 -->
            <template v-if="previewSettings.layoutMode === 'custom'">
              <el-form-item label="区域比例">
                <div class="ratio-controls">
                  <div class="ratio-item">
                    <span>主内容区域</span>
                    <el-slider
                      v-model="previewSettings.mainContentRatio"
                      :min="30"
                      :max="70"
                      :step="5"
                      :marks="{
                        30: '30%',
                        50: '50%',
                        70: '70%',
                      }"
                    />
                  </div>
                  <div class="ratio-item">
                    <span>侧边栏</span>
                    <el-slider
                      v-model="previewSettings.sidebarRatio"
                      :min="10"
                      :max="40"
                      :step="5"
                    />
                  </div>
                  <div class="ratio-item">
                    <span>编辑器</span>
                    <el-slider
                      v-model="previewSettings.editorRatio"
                      :min="30"
                      :max="70"
                      :step="5"
                    />
                  </div>
                  <div class="ratio-item">
                    <span>响应区域</span>
                    <el-slider
                      v-model="previewSettings.responseRatio"
                      :min="20"
                      :max="60"
                      :step="5"
                    />
                  </div>
                </div>
              </el-form-item>

              <!-- Grid 布局编辑器 -->
              <el-form-item label="Grid 布局">
                <div class="grid-editor">
                  <div class="grid-preview" :style="gridStyle">
                    <!-- 可拖拽的网格区域 -->
                    <div
                      v-for="area in gridAreas"
                      :key="area.id"
                      class="grid-area"
                      :class="area.type"
                      draggable="true"
                      @dragstart="handleDragStart($event, area)"
                      @dragend="handleDragEnd"
                      @drop="handleDrop($event, area)"
                      @dragover.prevent
                    >
                      {{ area.name }}
                    </div>
                  </div>
                  <div class="grid-controls">
                    <el-button size="small" @click="resetGrid"
                      >重置网格</el-button
                    >
                    <el-button size="small" @click="optimizeGrid"
                      >优化布局</el-button
                    >
                  </div>
                </div>
              </el-form-item>
            </template>

            <!-- 响应式设置 -->
            <el-form-item label="响应式断点">
              <div class="breakpoint-controls">
                <div class="breakpoint-item">
                  <span>移动端 (&lt;)</span>
                  <el-input-number
                    v-model="previewSettings.responsiveBreakpoints.mobile"
                    :min="320"
                    :max="767"
                    :step="1"
                  />
                </div>
                <div class="breakpoint-item">
                  <span>平板 (&lt;)</span>
                  <el-input-number
                    v-model="previewSettings.responsiveBreakpoints.tablet"
                    :min="768"
                    :max="1023"
                    :step="1"
                  />
                </div>
                <div class="breakpoint-item">
                  <span>桌面端 (&gt;=)</span>
                  <el-input-number
                    v-model="previewSettings.responsiveBreakpoints.desktop"
                    :min="1024"
                    :max="1920"
                    :step="1"
                  />
                </div>
              </div>
            </el-form-item>

            <!-- 动画设置 -->
            <el-form-item label="过渡动画">
              <div class="animation-controls">
                <el-switch v-model="previewSettings.animations.enabled" />
                <template v-if="previewSettings.animations.enabled">
                  <el-select
                    v-model="previewSettings.animations.type"
                    size="small"
                  >
                    <el-option label="滑动" value="slide" />
                    <el-option label="淡入淡出" value="fade" />
                  </el-select>
                  <el-input-number
                    v-model="previewSettings.animations.duration"
                    :min="100"
                    :max="1000"
                    :step="50"
                    size="small"
                  >
                    <template #suffix>ms</template>
                  </el-input-number>
                </template>
              </div>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>

    <!-- 使用 dialog 的 footer 插槽 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="resetLayout">恢复默认</el-button>
        <el-button type="primary" @click="handleApply">应用布局</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useLayoutStore } from "../../stores/layout";
import { layoutPresets } from "../../constants/layoutPresets";

// 添加 props 和 emit
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  close: [];
}>();

// 控制弹窗显示
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const layoutStore = useLayoutStore();

// 创建预览设置的副本时，确保包含所有必要的属性
const previewSettings = ref({
  ...layoutStore.settings,
  showHeader: true,
  isCollapsed: false,
  compactMode: false,
  showBorders: true,
  showShadows: true,
  layoutMode: "fixed" as "fixed" | "fluid" | "custom",
  mainContentRatio: 0.5,
  sidebarRatio: 0.2,
  editorRatio: 0.5,
  responseRatio: 0.3,
  responsiveBreakpoints: {
    mobile: 576,
    tablet: 768,
    desktop: 1024,
  },
  animations: {
    enabled: true,
    type: "slide" as "slide" | "fade",
    duration: 300,
  },
});

const mainContentRatio = computed({
  get: () => (previewSettings.value.mainContentRatio || 0.5) * 100,
  set: (value) => {
    previewSettings.value.mainContentRatio = value / 100;
    updatePreview();
  },
});

const sidebarRatio = computed({
  get: () => (previewSettings.value.sidebarRatio || 0.2) * 100,
  set: (value) => {
    previewSettings.value.sidebarRatio = value / 100;
    updatePreview();
  },
});

const editorRatio = computed({
  get: () => (previewSettings.value.editorRatio || 0.5) * 100,
  set: (value) => {
    previewSettings.value.editorRatio = value / 100;
    updatePreview();
  },
});

const responseRatio = computed({
  get: () => (previewSettings.value.responseRatio || 0.3) * 100,
  set: (value) => {
    previewSettings.value.responseRatio = value / 100;
    updatePreview();
  },
});

// Grid 布局相关
const gridAreas = ref([
  { id: 1, name: "侧边栏", type: "sidebar" },
  { id: 2, name: "编辑器", type: "editor" },
  { id: 3, name: "响应区域", type: "response" },
]);

const gridStyle = computed(() => ({
  display: "grid",
  gridTemplateColumns: `${sidebarRatio.value}% ${mainContentRatio.value}%`,
  gridTemplateRows: `${editorRatio.value}% ${responseRatio.value}%`,
  gap: "4px",
}));

// Grid 拖拽相关方法
const handleDragStart = (e: DragEvent, area: any) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData("text/plain", area.id.toString());
  }
};

const handleDragEnd = () => {
  // 处理拖拽结束
};

const handleDrop = (e: DragEvent, targetArea: any) => {
  const sourceId = e.dataTransfer?.getData("text/plain");
  if (sourceId) {
    // 交换位置逻辑
    const sourceArea = gridAreas.value.find(
      (a) => a.id.toString() === sourceId
    );
    if (sourceArea) {
      const sourceIndex = gridAreas.value.indexOf(sourceArea);
      const targetIndex = gridAreas.value.indexOf(targetArea);
      gridAreas.value.splice(sourceIndex, 1);
      gridAreas.value.splice(targetIndex, 0, sourceArea);
    }
  }
};

const resetGrid = () => {
  // 重置网格布局
};

const optimizeGrid = () => {
  // 自动优化网格布局
};

// 方法
const selectLayout = (layoutId: string, event?: Event) => {
  // 首先阻止事件冒泡
  event?.preventDefault();
  event?.stopPropagation();

  const preset = layoutPresets.find((p) => p.id === layoutId);
  if (preset) {
    // 创建新的预览设置对象
    const newSettings = {
      ...previewSettings.value, // 保留现有设置
      currentLayout: layoutId,
      toolbarPosition: preset.preview.toolbar?.position || "top",
      sidebarPosition: preset.preview.sidebar?.position || "left",
      tabsPosition: preset.preview.tabs?.position || "top",
      showSidebar: !!preset.preview.sidebar,
      showToolbar: !!preset.preview.toolbar,
      showTabs: !!preset.preview.tabs,
      compactMode: layoutId === "compact",
      sidebarWidth: preset.preview.sidebar?.width || 240,
      // 保留其他必要的设置
      responsiveBreakpoints: previewSettings.value.responsiveBreakpoints,
      animations: previewSettings.value.animations,
      layoutMode: previewSettings.value.layoutMode,
      mainContentRatio: previewSettings.value.mainContentRatio,
      sidebarRatio: previewSettings.value.sidebarRatio,
      editorRatio: previewSettings.value.editorRatio,
      responseRatio: previewSettings.value.responseRatio,
      isCollapsible: previewSettings.value.isCollapsible,
      showHeader: previewSettings.value.showHeader,
      showBorders: previewSettings.value.showBorders,
      showShadows: previewSettings.value.showShadows,
    };

    // 更新预览设置
    previewSettings.value = newSettings;
    // 触发预览更新
    updatePreview();
  }
};

// 更新预览
const updatePreview = () => {
  // 创建一个新的预览对象，确保包含所有必要的属性
  const previewData = {
    ...previewSettings.value,
    // 确保这些属性存在
    responsiveBreakpoints: previewSettings.value.responsiveBreakpoints || {
      mobile: 576,
      tablet: 768,
      desktop: 1024,
    },
    animations: previewSettings.value.animations || {
      enabled: true,
      type: "slide",
      duration: 300,
    },
  };

  // 更新预览
  layoutStore.previewLayout(previewData);
};

// 应用设置
const applySettings = () => {
  layoutStore.applyPreview();
  ElMessage.success("布局设置已应用");
};

// 取消预览
const cancelPreview = () => {
  layoutStore.cancelPreview();
  previewSettings.value = {
    ...layoutStore.settings,
    showHeader: true,
    compactMode: false,
    showBorders: true,
    showShadows: true,
    layoutMode: "fixed" as const,
    mainContentRatio: 0.5,
    sidebarRatio: 0.2,
    editorRatio: 0.5,
    responseRatio: 0.3,
    responsiveBreakpoints: { mobile: 576, tablet: 768, desktop: 1024 },
    animations: { enabled: true, type: "slide" as const, duration: 300 },
  };
};

// 重置布局 - 使用完整的默认设置
const resetLayout = () => {
  previewSettings.value = {
    ...layoutStore.settings, // 先保留基础设置
    showHeader: true,
    isCollapsed: false,
    sidebarWidth: 240,
    minSidebarWidth: 200,
    maxSidebarWidth: 600,
    isCollapsible: true,
    showSidebar: true,
    showToolbar: true,
    showTabs: true,
    compactMode: false,
    showBorders: true,
    showShadows: true,
    currentLayout: "classic",
    sidebarPosition: "left",
    tabsPosition: "top",
    layoutMode: "fixed" as const,
    mainContentRatio: 0.5,
    sidebarRatio: 0.2,
    editorRatio: 0.5,
    responseRatio: 0.3,
    responsiveBreakpoints: {
      mobile: 576,
      tablet: 768,
      desktop: 1024,
    },
    animations: {
      enabled: true,
      type: "slide" as const,
      duration: 300,
    },
  };
  updatePreview();
};

// 关闭处理方法
const handleClose = () => {
  // 出确认对话框
  ElMessageBox.confirm("确定要取消布局设置吗？未保存的更改将会丢失。", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 用户确认关闭
      cancelPreview();
      visible.value = false;
      emit("close");
    })
    .catch(() => {
      // 用户取消关闭，不做任何操作
    });
};

// 应用布局方法
const handleApply = () => {
  applySettings();
  // 确保设置应用后再关闭弹窗
  setTimeout(() => {
    visible.value = false;
    emit("close");
  }, 100);
};

// 组件卸载时取消预览
onBeforeUnmount(() => {
  cancelPreview();
});
</script>

<style scoped>
.layout-settings {
  padding: 20px;
}

.layout-preview-section {
  margin: 20px 0;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.preview-container {
  padding: 20px;
  background-color: var(--bg-color-light);
}

.layout-preview {
  position: relative;
  width: 100%;
  height: 300px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  background-color: var(--background);
}

/* 预览区域的样式 */
.preview-header {
  height: 32px;
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.preview-dots {
  display: flex;
  gap: 6px;
}

.preview-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--text-secondary);
  opacity: 0.5;
}

.preview-body {
  display: flex;
  height: calc(100% - 32px);
}

.preview-sidebar {
  width: 200px;
  background-color: var(--bg-color-light);
  border-right: 1px solid var(--border-color);
  transition: all 0.3s;
}

.preview-sidebar.right {
  order: 2;
  border-right: none;
  border-left: 1px solid var(--border-color);
}

.preview-sidebar.collapsed {
  width: 48px;
}

.preview-sidebar-content {
  padding: 8px;
}

.preview-item {
  height: 24px;
  background-color: var(--el-color-primary-light-8);
  margin-bottom: 8px;
  border-radius: 4px;
}

.preview-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.preview-tabs {
  height: 36px;
  background-color: var(--background);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  padding: 4px 8px 0;
  gap: 2px;
}

.preview-tabs.left {
  width: 160px;
  height: 100%;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
  border-bottom: none;
}

.preview-tab {
  width: 120px;
  height: 32px;
  background-color: var(--bg-color-light);
  border: 1px solid var(--border-color);
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}

.preview-tab.active {
  background-color: var(--background);
  border-bottom: 2px solid var(--el-color-primary);
}

.preview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color-light);
}

.preview-toolbar {
  height: 40px;
  background-color: var(--background);
  border-bottom: 1px solid var(--border-color);
}

.preview-toolbar.bottom {
  order: 1;
  border-top: 1px solid var(--border-color);
  border-bottom: none;
}

.preview-editor {
  flex: 1;
  background-color: var(--background);
  margin: 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

/* 控制面板样式 */
.layout-controls {
  margin-top: 24px;
}

.component-toggles,
.other-options {
  display: flex;
  gap: 16px;
}

.sidebar-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.width-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.width-control .el-slider {
  flex: 1;
}

.layout-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 隐藏元素 */
.hidden {
  display: none !important;
}

/* 紧凑模式 */
.compact {
  .preview-header {
    height: 28px;
  }

  .preview-tabs {
    height: 32px;
  }

  .preview-toolbar {
    height: 36px;
  }
}

/* 高级布局项样式 */
.ratio-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ratio-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ratio-item span {
  min-width: 80px;
}

.grid-editor {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 16px;
}

.grid-preview {
  height: 200px;
  background-color: var(--bg-color-light);
  border-radius: 4px;
  margin-bottom: 12px;
}

.grid-area {
  padding: 8px;
  background-color: var(--background);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: move;
  user-select: none;
}

.breakpoint-controls {
  display: flex;
  gap: 24px;
}

.breakpoint-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.animation-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.settings-section {
  margin-bottom: 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
}

:deep(.el-dialog__body) {
  padding: 0;
}

:deep(.el-dialog__header) {
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

:deep(.el-dialog__footer) {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}

/* 添加过渡效果 */
.preview-sidebar,
.preview-toolbar,
.preview-tabs {
  transition: all 0.3s ease;
}
</style>
