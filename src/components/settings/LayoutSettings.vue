<template>
  <el-dialog
    v-model="visible"
    :title="t('settings.layout.title')"
    width="80%"
    :before-close="handleClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="layout-settings">
      <!-- 布局预览区域 -->
      <div class="layout-preview-section">
        <h4>{{ t("settings.layout.title") }}</h4>
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
                <span
                  :title="t('settings.layout.preview.dots.minimize')"
                ></span>
                <span
                  :title="t('settings.layout.preview.dots.maximize')"
                ></span>
                <span :title="t('settings.layout.preview.dots.close')"></span>
              </div>
              <span class="preview-title">
                {{ t("settings.layout.components.header") }}
              </span>
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
                  <div class="preview-title">
                    {{ t("settings.layout.components.sidebar") }}
                  </div>
                  <div class="preview-item"></div>
                  <div class="preview-item"></div>
                  <div class="preview-item"></div>
                </div>
              </div>
              <!-- 主内容区域 -->
              <div
                class="preview-main"
                :class="{
                  'layout-modern': previewSettings.currentLayout === 'modern',
                  'layout-classic': previewSettings.currentLayout === 'classic',
                }"
              >
                <!-- 经典布局的标签页 -->
                <template v-if="previewSettings.currentLayout === 'classic'">
                  <div class="preview-tabs">
                    <div class="preview-title">
                      {{ t("settings.layout.components.tabs") }}
                    </div>
                    <div class="preview-tab active"></div>
                    <div class="preview-tab"></div>
                  </div>
                  <div class="preview-content">
                    <div class="preview-toolbar">
                      <div class="preview-title">
                        {{ t("settings.layout.components.toolbar") }}
                      </div>
                    </div>
                    <div class="preview-editor">
                      <div class="preview-title">
                        {{ t("settings.layout.components.editor") }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- 现代布局的标签页和内容 -->
                <template v-else>
                  <div class="preview-tabs-container">
                    <div class="preview-tabs">
                      <div class="preview-title">
                        {{ t("settings.layout.components.tabs") }}
                      </div>
                      <div class="preview-tab active"></div>
                      <div class="preview-tab"></div>
                      <div class="preview-tab"></div>
                    </div>
                  </div>
                  <div class="preview-content-container">
                    <div class="preview-toolbar">
                      <div class="preview-title">
                        {{ t("settings.layout.components.toolbar") }}
                      </div>
                    </div>
                    <div class="preview-content">
                      <div class="preview-editor">
                        <div class="preview-title">
                          {{ t("settings.layout.components.editor") }}
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 布局控制面板 -->
      <div class="layout-controls">
        <!-- 布局预设 -->
        <el-form-item :label="t('settings.layout.presets.title')">
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
                {{ t(`settings.layout.presets.names.${preset.id}`) }}
              </el-button>
            </el-button-group>
          </div>
        </el-form-item>

        <!-- 组件显示控制 -->
        <el-form-item :label="t('settings.layout.components.title')">
          <div class="component-toggles">
            <el-checkbox v-model="previewSettings.showHeader">
              {{ t("settings.layout.components.header") }}
            </el-checkbox>
            <el-checkbox v-model="previewSettings.showSidebar">
              {{ t("settings.layout.components.sidebar") }}
            </el-checkbox>
            <el-checkbox v-model="previewSettings.showTabs">
              {{ t("settings.layout.components.tabs") }}
            </el-checkbox>
            <el-checkbox v-model="previewSettings.showToolbar">
              {{ t("settings.layout.components.toolbar") }}
            </el-checkbox>
          </div>
        </el-form-item>

        <!-- 侧边栏设置 -->
        <template v-if="previewSettings.showSidebar">
          <el-form-item :label="t('settings.layout.sidebarSettings.title')">
            <div class="sidebar-settings">
              <el-radio-group
                v-model="previewSettings.sidebarPosition"
                size="small"
              >
                <el-radio-button :value="'left'">
                  {{ t("settings.layout.sidebarSettings.position.left") }}
                </el-radio-button>
                <el-radio-button :value="'right'">
                  {{ t("settings.layout.sidebarSettings.position.right") }}
                </el-radio-button>
              </el-radio-group>
              <el-checkbox v-model="previewSettings.isCollapsible">
                {{ t("settings.layout.sidebarSettings.collapsible") }}
              </el-checkbox>
              <div class="width-control">
                <span
                  >{{
                    t("settings.layout.sidebarSettings.widthControl.label")
                  }}:</span
                >
                <el-slider
                  v-model="previewSettings.sidebarWidth"
                  :min="180"
                  :max="500"
                  :step="10"
                  :marks="{
                    180: `180${t(
                      'settings.layout.sidebarSettings.widthControl.unit'
                    )}`,
                    300: `300${t(
                      'settings.layout.sidebarSettings.widthControl.unit'
                    )}`,
                    500: `500${t(
                      'settings.layout.sidebarSettings.widthControl.unit'
                    )}`,
                  }"
                />
              </div>
            </div>
          </el-form-item>
        </template>

        <!-- 标签页设置 -->
        <template v-if="previewSettings.showTabs">
          <el-form-item :label="t('settings.layout.tabsPosition.title')">
            <el-radio-group v-model="previewSettings.tabsPosition" size="small">
              <el-radio-button :value="'top'">{{
                t("settings.layout.tabsPosition.top")
              }}</el-radio-button>
              <el-radio-button :value="'left'">{{
                t("settings.layout.tabsPosition.left")
              }}</el-radio-button>
              <el-radio-button :value="'bottom'">{{
                t("settings.layout.tabsPosition.bottom")
              }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </template>

        <!-- 工具栏设置 -->
        <template v-if="previewSettings.showToolbar">
          <el-form-item :label="t('settings.layout.toolbarPosition.title')">
            <el-radio-group
              v-model="previewSettings.toolbarPosition"
              size="small"
            >
              <el-radio-button :value="'top'">{{
                t("settings.layout.toolbarPosition.top")
              }}</el-radio-button>
              <el-radio-button :value="'bottom'">{{
                t("settings.layout.toolbarPosition.bottom")
              }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </template>

        <!-- 其他布局选项 -->
        <el-form-item :label="t('settings.layout.other.title')">
          <div class="other-options">
            <el-checkbox v-model="previewSettings.showBorders">{{
              t("settings.layout.other.showBorders")
            }}</el-checkbox>
            <el-checkbox v-model="previewSettings.compactMode">{{
              t("settings.layout.other.compactMode")
            }}</el-checkbox>
            <el-checkbox v-model="previewSettings.showShadows">{{
              t("settings.layout.other.showShadows")
            }}</el-checkbox>
          </div>
        </el-form-item>

        <!-- 高级布局选项 -->
        <el-collapse>
          <el-collapse-item
            :title="t('settings.layout.advanced.title')"
            name="advanced"
          >
            <!-- 布局模式 -->
            <el-form-item
              :label="t('settings.layout.advanced.layoutMode.title')"
            >
              <el-radio-group v-model="previewSettings.layoutMode" size="small">
                <el-radio-button :value="'fixed'">{{
                  t("settings.layout.advanced.layoutMode.fixed")
                }}</el-radio-button>
                <el-radio-button :value="'fluid'">{{
                  t("settings.layout.advanced.layoutMode.fluid")
                }}</el-radio-button>
                <el-radio-button :value="'custom'">{{
                  t("settings.layout.advanced.layoutMode.custom")
                }}</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <!-- 区域比例控制 -->
            <template v-if="previewSettings.layoutMode === 'custom'">
              <el-form-item :label="t('settings.layout.advanced.ratios.title')">
                <div class="ratio-controls">
                  <div class="ratio-header">
                    <el-tooltip
                      :content="t('settings.layout.advanced.ratios.tooltip')"
                      placement="top"
                    >
                      <el-icon><InfoFilled /></el-icon>
                    </el-tooltip>
                    <span class="ratio-title">{{
                      t("settings.layout.advanced.ratios.title")
                    }}</span>
                  </div>
                  <div class="ratio-item">
                    <span>{{
                      t("settings.layout.advanced.ratios.mainContent")
                    }}</span>
                    <el-slider
                      v-model="previewSettings.mainContentRatio"
                      :min="30"
                      :max="70"
                      :step="5"
                      :marks="{
                        30: t('settings.layout.ratios.sliderMarks.min', {
                          value: 30,
                        }),
                        50: t('settings.layout.ratios.sliderMarks.default', {
                          value: 50,
                        }),
                        70: t('settings.layout.ratios.sliderMarks.max', {
                          value: 70,
                        }),
                      }"
                    />
                  </div>
                  <div class="ratio-item">
                    <span>{{
                      t("settings.layout.advanced.ratios.sidebar")
                    }}</span>
                    <el-slider
                      v-model="previewSettings.sidebarRatio"
                      :min="10"
                      :max="40"
                      :step="5"
                    />
                  </div>
                  <div class="ratio-item">
                    <span>{{
                      t("settings.layout.advanced.ratios.editor")
                    }}</span>
                    <el-slider
                      v-model="previewSettings.editorRatio"
                      :min="30"
                      :max="70"
                      :step="5"
                    />
                  </div>
                  <div class="ratio-item">
                    <span>{{
                      t("settings.layout.advanced.ratios.response")
                    }}</span>
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
              <el-form-item :label="t('settings.layout.advanced.grid.title')">
                <div class="grid-editor">
                  <div class="grid-preview" :style="gridStyle">
                    <div class="grid-title">
                      <span>{{ t("settings.layout.grid.preview.title") }}</span>
                      <el-tooltip
                        :content="t('settings.layout.preview.dragAndDrop.tip')"
                        placement="top"
                      >
                        <el-icon><InfoFilled /></el-icon>
                      </el-tooltip>
                    </div>
                    <template v-if="gridAreas.length">
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
                        {{ t(`settings.layout.grid.areas.${area.type}`) }}
                      </div>
                    </template>
                    <div v-else class="grid-empty">
                      {{ t("settings.layout.grid.preview.empty") }}
                    </div>
                  </div>
                  <div class="grid-controls">
                    <el-button size="small" @click="resetGrid">
                      {{ t("settings.layout.advanced.grid.reset") }}
                    </el-button>
                    <el-button size="small" @click="optimizeGrid">
                      {{ t("settings.layout.advanced.grid.optimize") }}
                    </el-button>
                  </div>
                </div>
              </el-form-item>
            </template>

            <!-- 响应式设置 -->
            <el-form-item
              :label="t('settings.layout.advanced.responsive.title')"
            >
              <div class="breakpoint-controls">
                <div class="breakpoint-item">
                  <span>{{
                    t("settings.layout.breakpoints.label.mobile")
                  }}</span>
                  <el-input-number
                    v-model="previewSettings.responsiveBreakpoints.mobile"
                    :min="320"
                    :max="767"
                    :step="1"
                  >
                    <template #suffix>{{
                      t("settings.layout.breakpoints.unit")
                    }}</template>
                  </el-input-number>
                </div>
                <div class="breakpoint-item">
                  <span>{{
                    t("settings.layout.breakpoints.label.tablet")
                  }}</span>
                  <el-input-number
                    v-model="previewSettings.responsiveBreakpoints.tablet"
                    :min="768"
                    :max="1023"
                    :step="1"
                  >
                    <template #suffix>{{
                      t("settings.layout.breakpoints.unit")
                    }}</template>
                  </el-input-number>
                </div>
                <div class="breakpoint-item">
                  <span>{{
                    t("settings.layout.breakpoints.label.desktop")
                  }}</span>
                  <el-input-number
                    v-model="previewSettings.responsiveBreakpoints.desktop"
                    :min="1024"
                    :max="1920"
                    :step="1"
                  >
                    <template #suffix>{{
                      t("settings.layout.breakpoints.unit")
                    }}</template>
                  </el-input-number>
                </div>
              </div>
            </el-form-item>

            <!-- 动画设置 -->
            <el-form-item
              :label="t('settings.layout.advanced.animations.enabled.title')"
            >
              <div class="animation-controls">
                <el-tooltip
                  :content="
                    t('settings.layout.advanced.animations.enabled.tooltip')
                  "
                  placement="top"
                >
                  <el-switch
                    v-model="previewSettings.animations.enabled"
                    :active-text="
                      t('settings.layout.advanced.animations.enabled.label')
                    "
                  />
                </el-tooltip>
                <template v-if="previewSettings.animations.enabled">
                  <el-select
                    v-model="previewSettings.animations.type"
                    size="small"
                  >
                    <el-option
                      :label="
                        t('settings.layout.advanced.animations.type.slide')
                      "
                      value="slide"
                    />
                    <el-option
                      :label="
                        t('settings.layout.advanced.animations.type.fade')
                      "
                      value="fade"
                    />
                  </el-select>
                  <el-tooltip
                    :content="
                      t('settings.layout.advanced.animations.duration.tooltip')
                    "
                    placement="top"
                  >
                    <div class="duration-input">
                      <span class="duration-label">{{
                        t("settings.layout.advanced.animations.duration.label")
                      }}</span>
                      <el-input-number
                        v-model="previewSettings.animations.duration"
                        :min="100"
                        :max="1000"
                        :step="50"
                        size="small"
                        controls-position="right"
                      >
                        <template #suffix>{{
                          t("settings.layout.advanced.animations.durationUnit")
                        }}</template>
                      </el-input-number>
                    </div>
                  </el-tooltip>
                </template>
              </div>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{
          t("settings.layout.actions.cancel")
        }}</el-button>
        <el-button @click="resetLayout">{{
          t("settings.layout.actions.reset")
        }}</el-button>
        <el-button type="primary" @click="handleApply">{{
          t("settings.layout.actions.apply")
        }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useLayoutStore } from "../../stores/layout";
import { layoutPresets } from "../../constants/layoutPresets";
import { useI18n } from "vue-i18n";
import { InfoFilled } from "@element-plus/icons-vue";

const { t } = useI18n();
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  close: [];
}>();

// 跟踪是否有未保存的更改
const hasUnsavedChanges = ref(false);

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const layoutStore = useLayoutStore();

// 创建预览设置的副本时确保包含所有必要的属性
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
  { id: 1, type: "sidebar" },
  { id: 2, type: "editor" },
  { id: 3, type: "response" },
]);

const gridStyle = computed(() => ({
  display: "grid",
  gridTemplateColumns: `${sidebarRatio.value}% ${mainContentRatio.value}%`,
  gridTemplateRows: `${editorRatio.value}% ${responseRatio.value}%`,
  gap: "4px",
}));

// Grid 拽方法
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
  // 阻止事件冒泡
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const preset = layoutPresets.find((p) => p.id === layoutId);
  if (preset) {
    // 创建新的预览设置对象
    const newSettings = {
      ...previewSettings.value,
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
  // 确保包含所有设置
  const newSettings = {
    ...previewSettings.value,
    sidebarPosition: previewSettings.value.sidebarPosition,
    isCollapsed: previewSettings.value.isCollapsed,
    sidebarWidth: previewSettings.value.sidebarWidth,
  };

  // 更新布局存储
  layoutStore.updateSettings(newSettings);
  ElMessage.success(t("settings.layout.advanced.messages.applySuccess"));
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

// 重置布局 - 使用完的默认设置
const resetLayout = async () => {
  try {
    await ElMessageBox.confirm(
      t("settings.layout.advanced.messages.resetConfirm"),
      t("settings.layout.title")
    );
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
    ElMessage.success(t("settings.layout.advanced.messages.resetSuccess"));
  } catch {}
};

// 关闭处理方法
const handleClose = async () => {
  if (hasUnsavedChanges.value) {
    try {
      await ElMessageBox.confirm(
        t("settings.layout.messages.unsavedChanges"),
        t("settings.layout.actions.confirm"),
        {
          confirmButtonText: t("settings.layout.actions.save"),
          cancelButtonText: t("settings.layout.actions.cancel"),
          type: "warning",
        }
      );
      // 用户选择保存
      await applySettings();
      visible.value = false;
      emit("close");
    } catch {
      // 用户取消保存，不做任何操作
    }
  } else {
    // 没有未保存的更改，直接关闭
    visible.value = false;
    emit("close");
  }
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
  background-color: var(--surface-1);
  display: flex;
  flex-direction: column;
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
  flex: 1;
  display: flex;
  height: calc(100% - 32px);
  min-height: 0;
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
  background-color: var(--surface-1);
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
  background-color: var(--surface-1);
  border-bottom: 2px solid var(--el-color-primary);
}

.preview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color-light);
  min-height: 0;
}

.preview-toolbar {
  height: 40px;
  background-color: var(--surface-1);
  border-bottom: 1px solid var(--border-color);
}

.preview-toolbar.bottom {
  order: 1;
  border-top: 1px solid var(--border-color);
  border-bottom: none;
}

.preview-editor {
  flex: 1;
  background-color: var(--surface-1);
  margin: 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  min-height: 0;
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
  background-color: var(--surface-1);
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

/* 经典布局预览样式 */
.layout-classic {
  .preview-main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .preview-tabs {
    height: 36px !important;
    width: 100% !important;
    background-color: var(--surface-1);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    padding: 4px 8px 0;
    gap: 2px;
    flex-direction: row !important;
  }

  .preview-tab {
    width: 120px !important;
    height: 32px;
    background-color: var(--bg-color-light);
    border: 1px solid var(--border-color);
    border-bottom: none;
    border-radius: 4px 4px 0 0;
    margin: 0 2px;

    &.active {
      background-color: var(--surface-1);
      border-bottom: 2px solid var(--el-color-primary);
    }
  }

  .preview-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .preview-toolbar {
    height: 40px;
    background-color: var(--surface-1);
    border-bottom: 1px solid var(--border-color);
  }

  .preview-editor {
    flex: 1;
    margin: 8px;
    background-color: var(--surface-1);
    border: 1px solid var(--border-color);
    border-radius: 4px;
  }
}

/* 现代布局预览样式 */
.layout-modern {
  .preview-body {
    display: flex;
    height: 100%;
  }

  .preview-main {
    flex: 1;
    display: flex;
    flex-direction: row; /* 保持水平布局 */
    min-width: 0;
  }

  /* 标签页容器 */
  .preview-tabs-container {
    width: 200px;
    border-right: 1px solid var(--border-color);
    background-color: var(--surface-1);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .preview-tabs {
    display: flex;
    flex-direction: column !important;
    padding: 8px 0;
    height: auto !important;
    border-bottom: none;
  }

  .preview-tab {
    width: auto !important;
    height: 32px;
    margin: 0 8px 4px;
    background-color: var(--bg-color-light);
    border: 1px solid var(--border-color);
    border-radius: 4px;

    &.active {
      background-color: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary);
    }
  }

  /* 内容区域 */
  .preview-content-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .preview-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 8px;
  }

  /* 右侧布局时的样式 */
  .preview-sidebar.right {
    order: 2;
    border-left: 1px solid var(--border-color);
    border-right: none;
  }

  .preview-main {
    order: 1;
  }
}

/* 预览内容样式 */
.preview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color-light);
  min-height: 0;
}

.preview-toolbar {
  height: 40px;
  background-color: var(--surface-1);
  border-bottom: 1px solid var(--border-color);
}

.preview-editor {
  flex: 1;
  background-color: var(--surface-1);
  margin: 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  min-height: 0;
}

.animation-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.duration-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.duration-label {
  font-size: 13px;
  color: var(--text-color);
}

.ratio-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.ratio-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
}

.ratio-header .el-icon {
  font-size: 16px;
  color: var(--text-color-secondary);
}

.preview-title {
  font-size: 12px;
  color: var(--text-color-secondary);
  padding: 4px 8px;
  opacity: 0.7;
  user-select: none;
}

.preview-sidebar-content .preview-title,
.preview-tabs .preview-title,
.preview-toolbar .preview-title,
.preview-editor .preview-title {
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-color-light);
  margin-bottom: 4px;
}

.grid-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-color-light);
}

.grid-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-color-secondary);
  font-size: 14px;
}
</style>
