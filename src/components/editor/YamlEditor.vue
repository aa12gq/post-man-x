<template>
  <BaseEditor
    ref="editorRef"
    v-model="content"
    language="yaml"
    :height="height"
    :read-only="readOnly"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { parse, stringify } from "yaml";
import BaseEditor from "./BaseEditor.vue";

const props = defineProps<{
  modelValue: string | object;
  height?: string;
  readOnly?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string | object];
  change: [value: string | object];
  error: [error: Error];
}>();

const editorRef = ref<InstanceType<typeof BaseEditor> | null>(null);
const content = ref("");

// 初始化内容
watch(
  () => props.modelValue,
  (newValue) => {
    try {
      content.value =
        typeof newValue === "string" ? newValue : stringify(newValue);
    } catch (error) {
      emit("error", error as Error);
    }
  },
  { immediate: true }
);

// 处理内容变化
const handleChange = (value: string) => {
  try {
    // 尝试解析 YAML
    const parsed = parse(value);
    emit("update:modelValue", parsed);
    emit("change", parsed);
  } catch (error) {
    // 如果解析失败，发出原始字符串
    emit("update:modelValue", value);
    emit("change", value);
    emit("error", error as Error);
  }
};

// 暴露方法
defineExpose({
  editor: editorRef,
  format: () => {
    try {
      const value = content.value;
      const parsed = parse(value);
      content.value = stringify(parsed);
    } catch (error) {
      emit("error", error as Error);
    }
  },
});
</script>
