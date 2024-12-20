<template>
	<el-dropdown
		trigger="click"
		@command="handleWorkspaceChange"
	>
		<div class="workspace-selector el-dropdown-link">
			<span class="workspace-name">{{
				workspaceStore.currentWorkspaceInfo.name
			}}</span>
			<el-icon><ArrowDown /></el-icon>
		</div>
		<template #dropdown>
			<el-dropdown-menu>
				<el-dropdown-item
					v-for="workspace in workspaceStore.workspaceList"
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
	import { useWorkspaceStore } from "@/stores/workspace";
	import { onMounted } from "vue";

	const workspaceStore = useWorkspaceStore();

	onMounted(() => {
		workspaceStore.handleGetAllWorkspaceList();
	});

	const handleWorkspaceChange = (command: string) => {
		if (command === "create") {
			// 触发创建工作空间事件
			router.push("/workspace-setup");
		} else if (command === "manage") {
			// 触发管理工作空间事件
		} else {
			const workspace = workspaceStore.workspaceList.find(
				(w) => w.id === command
			);
			if (workspace) {
				workspaceStore.currentWorkspaceInfo.id = workspace.id;
				workspaceStore.currentWorkspaceInfo.name = workspace.name;
			}
		}
	};
</script>

<style scoped>
	.workspace-selector {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 12px;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s ease;
		color: var(--text-secondary);
	}

	.workspace-selector:hover {
		background-color: var(--surface-2);
		color: var(--text);
	}

	.workspace-name {
		font-size: 13px;
		font-weight: 500;
	}

	:deep(.el-dropdown-menu) {
		background-color: var(--surface-1) !important;
		border-color: var(--border) !important;

		.el-dropdown-menu__item {
			color: var(--text-secondary);

			.el-icon {
				margin-right: 8px;
				color: var(--text-secondary);
			}

			&:hover {
				background-color: var(--surface-2);
				color: var(--text);

				.el-icon {
					color: var(--text);
				}
			}

			&.is-active {
				color: var(--el-color-primary);
				background-color: var(--surface-2);

				.el-icon {
					color: var(--el-color-primary);
				}
			}
		}

		.el-dropdown-menu__item.el-dropdown-menu__item--divided {
			border-top-color: var(--border);
		}
	}

	.el-icon {
		font-size: 14px;
		transition: transform 0.2s ease;
	}

	.workspace-selector:hover .el-icon {
		transform: translateY(2px);
	}
</style>
