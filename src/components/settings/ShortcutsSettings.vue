<template>
  <div class="shortcuts-settings">
    <div class="shortcuts-header">
      <h3>Keyboard Shortcuts</h3>
      <el-button @click="resetAll">Reset All</el-button>
    </div>

    <div class="shortcuts-list">
      <div
        v-for="category in shortcuts"
        :key="category.id"
        class="shortcut-category"
      >
        <h4>{{ category.name }}</h4>
        <div class="shortcut-items">
          <div
            v-for="shortcut in category.shortcuts"
            :key="shortcut.id"
            class="shortcut-item"
          >
            <div class="shortcut-info">
              <div class="shortcut-name">{{ shortcut.name }}</div>
              <div class="shortcut-description">{{ shortcut.description }}</div>
            </div>
            <div class="shortcut-key">
              <el-popover
                v-model:visible="editingShortcut[shortcut.id]"
                trigger="click"
                placement="top"
                width="300"
                :show-arrow="false"
              >
                <template #reference>
                  <el-button>{{ shortcut.key || "Click to set" }}</el-button>
                </template>
                <div class="shortcut-editor">
                  <p>Press the keys you want to use for this shortcut</p>
                  <div class="current-keys">
                    {{ recordingKeys || "Listening..." }}
                  </div>
                  <div class="editor-actions">
                    <el-button @click="cancelEdit">Cancel</el-button>
                    <el-button
                      type="primary"
                      @click="saveShortcut(category.id, shortcut.id)"
                      :disabled="!recordingKeys"
                    >
                      Save
                    </el-button>
                  </div>
                </div>
              </el-popover>
              <el-button
                link
                type="danger"
                @click="resetShortcut(category.id, shortcut.id)"
                :disabled="shortcut.key === shortcut.defaultKey"
              >
                Reset
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useShortcuts } from "../../composables/useShortcuts";
import { ElMessageBox } from "element-plus";

const {
  shortcuts,
  updateShortcut,
  resetShortcut: resetShortcutKey,
} = useShortcuts();

const editingShortcut = ref<Record<string, boolean>>({});
const recordingKeys = ref("");
const isRecording = ref(false);

const handleKeyDown = (e: KeyboardEvent) => {
  if (!isRecording.value) return;

  e.preventDefault();
  const keys = [];
  if (e.ctrlKey) keys.push("Ctrl");
  if (e.altKey) keys.push("Alt");
  if (e.shiftKey) keys.push("Shift");
  if (e.key !== "Control" && e.key !== "Alt" && e.key !== "Shift") {
    keys.push(e.key.toUpperCase());
  }
  recordingKeys.value = keys.join("+");
};

const cancelEdit = () => {
  isRecording.value = false;
  recordingKeys.value = "";
  Object.keys(editingShortcut.value).forEach((key) => {
    editingShortcut.value[key] = false;
  });
};

const saveShortcut = (categoryId: string, shortcutId: string) => {
  if (recordingKeys.value) {
    updateShortcut(categoryId, shortcutId, recordingKeys.value);
  }
  cancelEdit();
};

const resetShortcut = async (categoryId: string, shortcutId: string) => {
  try {
    await ElMessageBox.confirm(
      "Are you sure you want to reset this shortcut to its default value?",
      "Reset Shortcut"
    );
    resetShortcutKey(categoryId, shortcutId);
  } catch {}
};

const resetAll = async () => {
  try {
    await ElMessageBox.confirm(
      "Are you sure you want to reset all shortcuts to their default values?",
      "Reset All Shortcuts"
    );
    shortcuts.value.forEach((category) => {
      category.shortcuts.forEach((shortcut) => {
        resetShortcutKey(category.id, shortcut.id);
      });
    });
  } catch {}
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
.shortcuts-settings {
  padding: 20px;
}

.shortcuts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.shortcut-category h4 {
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.shortcut-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 4px;
  background-color: var(--background);
  border: 1px solid var(--border-color);
}

.shortcut-info {
  flex: 1;
}

.shortcut-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.shortcut-description {
  font-size: 12px;
  color: var(--text-secondary);
}

.shortcut-key {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shortcut-editor {
  padding: 16px;
  text-align: center;
}

.current-keys {
  margin: 16px 0;
  padding: 8px;
  background-color: var(--background);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
</style>
