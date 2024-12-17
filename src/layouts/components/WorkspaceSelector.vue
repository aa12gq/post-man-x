<template>
	<el-dropdown
		trigger="click"
		@command="handleWorkspaceChange"
	>
		<div class="workspace-selector">
			<span class="workspace-name">{{ currentWorkspace }}</span>
			<el-icon><ArrowDown /></el-icon>
		</div>
		<template #dropdown>
			<el-dropdown-menu>
				<el-dropdown-item
					v-for="workspace in workspaces"
					:key="workspace.id"
					:command="workspace.id"
				>
					<el-icon><FolderOpened /></el-icon>
					{{ workspace.name }}
				</el-dropdown-item>
				<el-dropdown-item
					divided
					command="create"
				>
					<el-icon><Plus /></el-icon>
					Create Workspace
				</el-dropdown-item>
				<el-dropdown-item command="manage">
					<el-icon><Management /></el-icon>
					Manage Workspaces
				</el-dropdown-item>
			</el-dropdown-menu>
		</template>
	</el-dropdown>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import {
		ArrowDown,
		FolderOpened,
		Plus,
		Management,
	} from "@element-plus/icons-vue";
	import { useRouter } from "vue-router";
	const router = useRouter();
	interface Workspace {
		id: string;
		name: string;
		description?: string;
	}

	const currentWorkspace = ref("Default Workspace");
	const workspaces = ref<Workspace[]>([
		{ id: "default", name: "Default Workspace" },
		{ id: "team", name: "Team Workspace" },
	]);

	const handleWorkspaceChange = (command: string) => {
		if (command === "create") {
			// 触发创建工作空间事件
			router.push("/workspace-setup");
		} else if (command === "manage") {
			// 触发管理工作空间事件
		} else {
			const workspace = workspaces.value.find((w) => w.id === command);
			if (workspace) {
				currentWorkspace.value = workspace.name;
			}
		}
	};
</script>

<style scoped>
	.workspace-selector {
		background-color: var(--background);
		color: var(--text-color);
	}

	.workspace-selector:hover {
		border-color: var(--primary-color);
	}

	.workspace-list {
		background-color: var(--background);
		border: 1px solid var(--border-color);
		box-shadow: var(--shadow-base);
	}

	.workspace-item {
		color: var(--text-color);
	}

	.workspace-item:hover {
		background-color: var(--hover-color);
	}

	.workspace-item.active {
		background-color: var(--selected-color);
		color: var(--primary-color);
	}
</style>
