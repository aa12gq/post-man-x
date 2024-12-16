<script setup lang="ts">
import { watch, ref } from "vue";
import { useTheme } from "../../composables/useTheme";
import type * as monaco from "monaco-editor";
import { applyThemeToMonaco } from "../../utils/editor";

const { currentTheme } = useTheme();
const editor = ref<monaco.editor.IStandaloneCodeEditor | null>(null);

watch(
  () => currentTheme.value,
  (theme) => {
    if (editor.value && window.monaco) {
      applyThemeToMonaco(window.monaco, theme.isDark);
    }
  }
);
</script>
