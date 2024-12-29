# 主题系统开发文档

## 概述

主题系统基于 CSS 变量实现，支持明暗主题切换，并与 Element Plus 主题系统集成。主题变量统一在 `:root` 选择器中定义，通过 `data-theme` 属性切换。

## 主题变量结构

主题系统包含以下核心变量类别：

```css
:root {
  /* 基础颜色 */
  --primary-color: var(--el-color-primary);

  /* 背景颜色 */
  --bg-color: #ffffff;
  --bg-color-light: #f5f7fa;
  --bg-color-dark: #e4e7ed;
  --header-bg: #f5f7fa;

  /* 文本颜色 */
  --text-color: #333333;
  --text-color-secondary: #909399;
  --text-color-disabled: #c0c4cc;

  /* 边框和分割线 */
  --border-color: #dcdfe6;
  --border-color-light: #e4e7ed;
  --border-color-dark: #d4d7de;

  /* 状态颜色 */
  --success-color: var(--el-color-success);
  --warning-color: var(--el-color-warning);
  --danger-color: var(--el-color-danger);
  --info-color: var(--el-color-info);

  /* 编辑器相关 */
  --editor-bg: #ffffff;
  --editor-line-number: #999999;
  --editor-selection: #e6f2ff;
  --editor-cursor: var(--primary-color);
  --editor-gutter-bg: #f5f7fa;
}
```

## 使用方法

### 1. 在组件中使用主题变量

```vue
<style scoped>
.my-component {
  background-color: var(--surface-1);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}
</style>
```

### 2. 切换主题

通过设置 `data-theme` 属性切换主题：

```typescript
// 切换到暗色主题
document.documentElement.setAttribute("data-theme", "dark");

// 切换到亮色主题
document.documentElement.setAttribute("data-theme", "light");
```

### 3. 监听主题变化

```typescript
// 监听主题变化
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "data-theme") {
      // 主题变化后的处理逻辑
    }
  });
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme"],
});
```

## 暗色主题变量

暗色主题通过 `:root[data-theme="dark"]` 选择器定义：

```css
:root[data-theme="dark"] {
  /* 背景颜色 */
  --bg-color: #1e1e1e;
  --bg-color-light: #252525;
  --bg-color-dark: #141414;
  --header-bg: #252525;

  /* 文本颜色 */
  --text-color: #e0e0e0;
  --text-color-secondary: #909399;
  --text-color-disabled: #666666;

  /* 边框和分割线 */
  --border-color: #333333;
  --border-color-light: #404040;
  --border-color-dark: #1f1f1f;

  /* 编辑器相关 */
  --editor-bg: #1e1e1e;
  --editor-line-number: #666666;
  --editor-selection: #264f78;
}
```

## 组件适配

### 1. Element Plus 组件适配

项目中的 Element Plus 组件会自动响应主题变化，无需额外处理。

### 2. Monaco Editor 适配

Monaco Editor 需要特殊处理以响应主题变化：

```typescript
// 监听主题变化并更新编辑器主题
watch(
  () => themeStore.currentTheme.isDark,
  (isDark) => {
    if (editor.value && window.monaco) {
      editor.value.updateOptions({
        theme: isDark ? "vs-dark" : "vs",
      });
    }
  }
);
```

## 最佳实践

1. **语义化变量命名**

   - 使用描述性的变量名，如 `--header-bg` 而不是 `--color-1`
   - 保持命名一致性，使用 `-` 分隔单词

2. **组件样式**

   - 优先使用主题变量而不是硬编码颜色值
   - 确保所有交互状态都使用主题变量

3. **主题切换**

   - 提供平滑的过渡效果
   - 确保所有组件都正确响应主题变化

4. **性能优化**
   - 避免在运行时频繁修改主题变量
   - 使用 CSS 变量而不是 JavaScript 动态样式

## 注意事项

1. 确保所有自定义组件都使用主题变量
2. 测试主题切换时的视觉一致性
3. 注意主题切换时的性能影响
4. 保持与 Element Plus 主题系统的兼容性
