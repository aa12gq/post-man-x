<template>
  <div class="theme-editor">
    <el-form :model="themeForm" label-width="120px">
      <el-form-item :label="t('settings.theme.editor.name')">
        <el-input v-model="themeForm.name" placeholder="Enter theme name" />
      </el-form-item>

      <el-form-item :label="t('settings.theme.editor.type')">
        <el-switch
          v-model="themeForm.isDark"
          :active-text="t('settings.theme.dark')"
          :inactive-text="t('settings.theme.light')"
        />
      </el-form-item>

      <div class="colors-section">
        <h3>{{ t("settings.theme.editor.colors") }}</h3>
        <div class="color-grid">
          <div
            v-for="(_value, key) in themeForm.colors"
            :key="key"
            class="color-item"
          >
            <span class="color-label">{{ formatColorLabel(key) }}</span>
            <div class="color-input-group">
              <el-color-picker
                v-model="themeForm.colors[key]"
                show-alpha
                :predefine="predefineColors"
              />
              <el-input v-model="themeForm.colors[key]" size="small" />
            </div>
          </div>
        </div>
      </div>

      <div class="background-section">
        <h3>{{ t("settings.theme.editor.background") }}</h3>
        <el-form-item :label="t('settings.theme.editor.enableBackground')">
          <el-switch v-model="themeForm.backgroundImage.enabled" />
        </el-form-item>

        <template v-if="themeForm.backgroundImage.enabled">
          <el-form-item :label="t('settings.theme.editor.backgroundType')">
            <el-radio-group v-model="themeForm.backgroundImage.type">
              <el-radio-button value="image">{{
                t("settings.theme.editor.image")
              }}</el-radio-button>
              <el-radio-button value="gradient">{{
                t("settings.theme.editor.gradient")
              }}</el-radio-button>
              <el-radio-button value="pattern">{{
                t("settings.theme.editor.pattern")
              }}</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <template v-if="themeForm.backgroundImage.type === 'image'">
            <div>
              <el-form-item :label="t('settings.theme.editor.uploadImage')">
                <div class="upload-tips">
                  <el-alert
                    :title="t('settings.theme.editor.imageTips')"
                    type="info"
                    :closable="false"
                    show-icon
                  >
                    <template #default>
                      {{ t("settings.theme.editor.imageTipsContent") }}
                    </template>
                  </el-alert>
                </div>

                <el-upload
                  class="background-uploader"
                  accept="image/*"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="(file) => handleImageUpload(file.raw as File)"
                >
                  <div
                    v-if="themeForm.backgroundImage.image"
                    class="image-preview"
                  >
                    <img :src="themeForm.backgroundImage.image" />
                    <div class="image-actions">
                      <el-button-group>
                        <el-button
                          type="danger"
                          @click.stop="themeForm.backgroundImage.image = ''"
                        >
                          {{ t("settings.theme.editor.removeImage") }}
                        </el-button>
                        <el-button type="primary" @click.stop="optimizeImage">
                          {{ t("settings.theme.editor.optimizeImage") }}
                        </el-button>
                      </el-button-group>
                    </div>
                  </div>
                  <el-button v-else>{{
                    t("settings.theme.editor.selectImage")
                  }}</el-button>
                </el-upload>
              </el-form-item>

              <el-form-item :label="t('settings.theme.editor.position')">
                <el-select v-model="themeForm.backgroundImage.position">
                  <el-option
                    value="center center"
                    :label="t('settings.theme.editor.positions.center')"
                  />
                  <el-option
                    value="top center"
                    :label="t('settings.theme.editor.positions.top')"
                  />
                  <el-option
                    value="bottom center"
                    :label="t('settings.theme.editor.positions.bottom')"
                  />
                  <el-option
                    value="left center"
                    :label="t('settings.theme.editor.positions.left')"
                  />
                  <el-option
                    value="right center"
                    :label="t('settings.theme.editor.positions.right')"
                  />
                </el-select>
              </el-form-item>

              <el-form-item :label="t('settings.theme.editor.repeat')">
                <el-select v-model="themeForm.backgroundImage.repeat">
                  <el-option
                    value="no-repeat"
                    :label="t('settings.theme.editor.repeats.noRepeat')"
                  />
                  <el-option
                    value="repeat"
                    :label="t('settings.theme.editor.repeats.repeat')"
                  />
                  <el-option
                    value="repeat-x"
                    :label="t('settings.theme.editor.repeats.repeatX')"
                  />
                  <el-option
                    value="repeat-y"
                    :label="t('settings.theme.editor.repeats.repeatY')"
                  />
                </el-select>
              </el-form-item>

              <el-form-item :label="t('settings.theme.editor.size')">
                <el-select v-model="themeForm.backgroundImage.size">
                  <el-option
                    value="cover"
                    :label="t('settings.theme.editor.sizes.cover')"
                  />
                  <el-option
                    value="contain"
                    :label="t('settings.theme.editor.sizes.contain')"
                  />
                  <el-option
                    value="auto"
                    :label="t('settings.theme.editor.sizes.auto')"
                  />
                </el-select>
              </el-form-item>

              <el-form-item :label="t('settings.theme.editor.blendMode')">
                <el-select v-model="themeForm.backgroundImage.blendMode">
                  <el-option
                    value="normal"
                    :label="t('settings.theme.editor.blendModes.normal')"
                  />
                  <el-option
                    value="multiply"
                    :label="t('settings.theme.editor.blendModes.multiply')"
                  />
                  <el-option
                    value="screen"
                    :label="t('settings.theme.editor.blendModes.screen')"
                  />
                  <el-option
                    value="overlay"
                    :label="t('settings.theme.editor.blendModes.overlay')"
                  />
                  <el-option
                    value="darken"
                    :label="t('settings.theme.editor.blendModes.darken')"
                  />
                  <el-option
                    value="lighten"
                    :label="t('settings.theme.editor.blendModes.lighten')"
                  />
                </el-select>
              </el-form-item>

              <el-form-item :label="t('settings.theme.editor.opacity')">
                <el-slider
                  v-model="themeForm.backgroundImage.opacity"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  :format-tooltip="(value) => `${value * 100}%`"
                />
              </el-form-item>

              <el-form-item :label="t('settings.theme.editor.presets.title')">
                <el-radio-group v-model="selectedPreset" size="small">
                  <el-radio-button value="light">
                    {{ t("settings.theme.editor.presets.light") }}
                  </el-radio-button>
                  <el-radio-button value="dark">
                    {{ t("settings.theme.editor.presets.dark") }}
                  </el-radio-button>
                  <el-radio-button value="custom">
                    {{ t("settings.theme.editor.presets.custom") }}
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>
            </div>
          </template>

          <template v-if="themeForm.backgroundImage.type === 'gradient'">
            <el-form-item :label="t('settings.theme.editor.gradientPresets')">
              <div class="gradient-presets">
                <div
                  v-for="preset in gradientPresets"
                  :key="preset.name"
                  class="gradient-preset"
                  :style="{ background: preset.value }"
                  @click="themeForm.backgroundImage.gradient = preset.value"
                >
                  <span class="preset-name">{{ preset.name }}</span>
                </div>
              </div>
            </el-form-item>

            <el-form-item :label="t('settings.theme.editor.gradientAngle')">
              <div class="angle-control">
                <el-slider
                  v-model="gradientAngle"
                  :min="0"
                  :max="360"
                  :step="1"
                  @change="(val) => updateGradientAngle(Number(val))"
                />
                <span class="angle-value">{{ gradientAngle }}°</span>
              </div>
            </el-form-item>

            <el-form-item :label="t('settings.theme.editor.gradient')">
              <el-input
                v-model="themeForm.backgroundImage.gradient"
                type="textarea"
                :rows="2"
                :placeholder="t('settings.theme.editor.gradientPlaceholder')"
              />
            </el-form-item>
          </template>

          <template v-if="themeForm.backgroundImage.type === 'pattern'">
            <el-form-item :label="t('settings.theme.editor.pattern')">
              <el-input
                v-model="themeForm.backgroundImage.pattern"
                :placeholder="t('settings.theme.editor.patternPlaceholder')"
              />
            </el-form-item>
          </template>
        </template>
      </div>

      <div class="preview-section">
        <h3>{{ t("settings.theme.editor.preview") }}</h3>
        <div class="preview-container">
          <div class="preview-content" :style="previewStyles">
            <div class="preview-header">
              <span>{{ t("settings.theme.editor.previewHeader") }}</span>
              <el-button type="primary" size="small">Button</el-button>
            </div>
            <div class="preview-body">
              <div class="preview-card">
                <h4>{{ t("settings.theme.editor.previewCardTitle") }}</h4>
                <p>{{ t("settings.theme.editor.previewCardContent") }}</p>
                <el-button type="success" size="small">Success</el-button>
                <el-button type="warning" size="small">Warning</el-button>
                <el-button type="danger" size="small">Danger</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <el-button @click="$emit('cancel')">{{ t("common.cancel") }}</el-button>
        <el-button type="primary" @click="handleSave">{{
          t("settings.theme.editor.save")
        }}</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import type { Theme } from "../../types/theme";
import { useI18n } from "vue-i18n";
import { useThemeStore } from "../../stores/theme";

const { t } = useI18n();

const props = defineProps<{
  initialTheme?: Partial<Theme> | null;
}>();

const emit = defineEmits<{
  (e: "save", theme: Omit<Theme, "id">): void;
  (e: "cancel"): void;
}>();

const themeForm = ref({
  name: props.initialTheme?.name || "",
  isDark: props.initialTheme?.isDark || false,
  colors: {
    primary: "#409eff",
    "primary-light": "#ecf5ff",
    "primary-dark": "#337ecc",
    background: "#ffffff",
    "background-light": "#f5f7fa",
    "background-dark": "#e4e7ed",
    "surface-1": "#ffffff",
    "surface-2": "#f5f7fa",
    "surface-3": "#e4e7ed",
    "surface-4": "#dcdfe6",
    text: "#333333",
    "text-secondary": "#909399",
    border: "#dcdfe6",
    hover: "#f5f7fa",
    header: "#f5f7fa",
    shadow: "rgba(0, 0, 0, 0.1)",
    success: "#67c23a",
    warning: "#e6a23c",
    danger: "#f56c6c",
    info: "#909399",
    selected: "var(--el-color-primary-light-9)",
    "selected-hover": "var(--el-color-primary-light-8)",
    "border-active": "var(--el-color-primary-light-5)",
    ...props.initialTheme?.colors,
  },
  backgroundImage: {
    enabled: props.initialTheme?.backgroundImage?.enabled || false,
    image: props.initialTheme?.backgroundImage?.image || "",
    blendMode: props.initialTheme?.backgroundImage?.blendMode || "normal",
    opacity: props.initialTheme?.backgroundImage?.opacity || 0.1,
    type: props.initialTheme?.backgroundImage?.type || "image",
    gradient: props.initialTheme?.backgroundImage?.gradient || "",
    pattern: props.initialTheme?.backgroundImage?.pattern || "",
    position: props.initialTheme?.backgroundImage?.position || "center center",
    repeat: props.initialTheme?.backgroundImage?.repeat || "no-repeat",
    size: props.initialTheme?.backgroundImage?.size || "cover",
  },
});

const predefineColors = [
  "#409EFF",
  "#67C23A",
  "#E6A23C",
  "#F56C6C",
  "#909399",
  "#FFFFFF",
  "#000000",
];

const formatColorLabel = (key: string) => {
  return key
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const themeStore = useThemeStore();

const previewStyles = computed(() => {
  const styles: Record<string, string> = {};

  Object.entries(themeForm.value.colors).forEach(([key, value]) => {
    styles[`--${key}`] = value;
  });

  if (themeForm.value.backgroundImage?.enabled) {
    const {
      type,
      image,
      blendMode,
      opacity,
      gradient,
      pattern,
      position,
      repeat,
      size,
    } = themeForm.value.backgroundImage;

    let backgroundValue = themeForm.value.colors.background;

    if (type === "image" && image) {
      backgroundValue = `linear-gradient(rgba(255,255,255,${
        1 - opacity
      }), rgba(255,255,255,${1 - opacity})), url(${image})`;
      styles.backgroundBlendMode = blendMode;
      styles.backgroundSize = size || "cover";
      styles.backgroundPosition = position || "center center";
      styles.backgroundRepeat = repeat || "no-repeat";
    } else if (type === "gradient" && gradient) {
      backgroundValue = gradient;
    } else if (type === "pattern" && pattern) {
      backgroundValue = `url(${pattern})`;
      styles.backgroundRepeat = "repeat";
    }

    styles.background = backgroundValue;
  } else {
    styles.background = themeForm.value.colors.background;
    styles.backgroundImage = "none";
  }

  return styles;
});

const handleSave = () => {
  if (!themeForm.value.name) {
    ElMessage.warning(t("settings.theme.editor.nameRequired"));
    return;
  }
  emit("save", {
    name: themeForm.value.name,
    isDark: themeForm.value.isDark,
    colors: themeForm.value.colors,
    backgroundImage: themeForm.value.backgroundImage,
  });
};

const handleImageUpload = async (file: File) => {
  try {
    const imageData = await themeStore.handleBackgroundImage(file);
    themeForm.value.backgroundImage.image = imageData;
  } catch (error) {
    ElMessage.error(t("settings.theme.editor.imageUploadError"));
  }
};

const selectedPreset = ref("custom");

watch(selectedPreset, (newValue) => {
  if (newValue === "light") {
    themeForm.value.backgroundImage.blendMode = "normal";
    themeForm.value.backgroundImage.opacity = 0.9;
  } else if (newValue === "dark") {
    themeForm.value.backgroundImage.blendMode = "multiply";
    themeForm.value.backgroundImage.opacity = 0.7;
  }
});

const optimizeImage = async () => {
  try {
    ElMessage.success(t("settings.theme.editor.optimizeSuccess"));
  } catch (error) {
    ElMessage.error(t("settings.theme.editor.optimizeError"));
  }
};

const gradientPresets = [
  { name: "蓝色渐变", value: "linear-gradient(45deg, #2196F3, #00BCD4)" },
  { name: "紫色渐变", value: "linear-gradient(45deg, #9C27B0, #E91E63)" },
  { name: "绿色渐变", value: "linear-gradient(45deg, #4CAF50, #8BC34A)" },
  { name: "橙色渐变", value: "linear-gradient(45deg, #FF9800, #FF5722)" },
];

const gradientAngle = ref(45);
const updateGradientAngle = (angle: number) => {
  const gradient = themeForm.value.backgroundImage.gradient;
  if (gradient && gradient.startsWith("linear-gradient")) {
    themeForm.value.backgroundImage.gradient = gradient.replace(
      /linear-gradient\(.*?,/,
      `linear-gradient(${angle}deg,`
    );
  }
};
</script>

<style scoped>
.theme-editor {
  padding: 20px;
}

.colors-section {
  margin: 20px 0;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.color-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-label {
  font-size: 14px;
  color: var(--text-color);
}

.color-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-input-group :deep(.el-input) {
  width: 120px;
}

.preview-section {
  margin: 20px 0;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.preview-container {
  padding: 20px;
  background-color: var(--el-bg-color);
}

.preview-content {
  position: relative;
  min-height: 300px;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: var(--surface-1);
}

.preview-content::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: 0;
  background: rgba(0, 0, 0, 0.1);
  transition: opacity 0.3s ease;
}

.preview-content:hover::after {
  opacity: 1;
}

.preview-header {
  padding: 16px;
  background-color: var(--header);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-body {
  padding: 16px;
  min-height: 240px;
}

.preview-card {
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--background-light);
  box-shadow: 0 2px 12px 0 var(--shadow);
}

.preview-card h4 {
  margin: 0 0 8px;
  color: var(--text-color);
}

.preview-card p {
  margin: 0 0 16px;
  color: var(--text-secondary);
}

.dialog-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.background-section {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.background-uploader {
  text-align: center;
}

.image-preview {
  position: relative;
  width: 200px;
  height: 120px;
  margin: 0 auto;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 var(--shadow);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-preview:hover img {
  transform: scale(1.05);
}

.image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .image-actions {
  opacity: 1;
}

.background-section :deep(.el-alert) {
  margin-bottom: 16px;
}

.upload-tips {
  margin-bottom: 16px;
}

.preset-backgrounds {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 8px;
}

.preset-item {
  position: relative;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  transition: transform 0.2s;
}

.preset-item:hover {
  transform: translateY(-2px);
}

.preset-item.active {
  outline: 2px solid var(--el-color-primary);
}

.preset-item img {
  width: 100%;
  height: 80px;
  object-fit: cover;
}

.preset-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  text-align: center;
}

.nested-form-item {
  margin-bottom: 12px;
}

.nested-form-item :deep(.el-form-item__label) {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.gradient-presets {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.gradient-preset {
  height: 60px;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s;
}

.gradient-preset:hover {
  transform: translateY(-2px);
}

.angle-control {
  display: flex;
  align-items: center;
  gap: 16px;
}

.angle-value {
  min-width: 48px;
  text-align: right;
  color: var(--el-text-color-secondary);
}
</style>
