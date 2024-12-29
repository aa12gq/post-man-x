<template>
	<div class="flex h-screen">
		<div class="w-[400px] p-5 bg-surface-1">
			<h2 class="text-center text-lg mb-2">Create your workspace</h2>
			<p
				v-if="workspaceStore.createWorkspacePage === 'blank'"
				class="text-center text-sm mb-5"
			>
				Get the most out of your workspace with a template.
			</p>
			<div class="mt-5">
				<div
					v-if="workspaceStore.createWorkspacePage === 'blank'"
					class="flex items-center p-3 cursor-pointer border border-border rounded mb-2 transition-colors duration-200"
					:class="{
						'bg-primary-light border-primary-color':
							selectedTemplate === 'blank',
					}"
					@click="selectTemplate('blank')"
				>
					<el-icon :component="Document" />
					<span class="flex-grow ml-2 text-xs text-text-color"
						>Blank workspace</span
					>
					<span class="flex items-center">
						<input
							type="radio"
							:checked="selectedTemplate === 'blank'"
							class="pointer-events-none"
						/>
					</span>
				</div>
				<div v-else>
					<el-form label-position="top">
						<el-form-item label="Name">
							<el-input
								type="text"
								size="large"
								id="workspace-name"
								v-model="workspaceStore.createWorkSpaceName"
								placeholder="Enter workspace name"
							/>
						</el-form-item>
					</el-form>
				</div>
			</div>
			<div class="flex items-center text-center my-5 text-sm font-bold">
				<span v-if="workspaceStore.createWorkspacePage === 'blank'">
					Explore our templates
				</span>
				<span v-else> Who can access your workspace? </span>
			</div>
			<div
				v-if="workspaceStore.createWorkspacePage === 'blank'"
				class="mt-5"
			>
				<div
					v-for="template in templates"
					:key="template.id"
					class="flex items-center p-3 cursor-pointer border border-border rounded mb-2 transition-colors duration-200"
					:class="{
						'bg-primary-light border-primary-color':
							selectedTemplate === template.id,
					}"
					@click="selectTemplate(template.id)"
				>
					<!-- <el-icon :component="template.icon" /> -->
					<span class="flex-grow ml-2 text-xs text-text-color">{{
						template.name
					}}</span>
					<span class="flex items-center">
						<input
							type="radio"
							:checked="selectedTemplate === template.id"
							class="pointer-events-none"
						/>
					</span>
				</div>
			</div>
			<div
				v-else
				class="mt-5"
			>
				<div
					v-for="access in accessselected"
					:key="access.id"
					class="flex items-center p-3 cursor-pointer border border-border-color rounded mb-2 transition-colors duration-200"
					:class="{
						'bg-primary-light border-primary-color':
							selectedAccess === access.id,
					}"
					@click="selectAccess(access.id)"
				>
					<!-- <el-icon :component="access.icon" /> -->
					<span class="flex-grow ml-2 text-sm text-text-color">{{
						access.name
					}}</span>
					<span class="flex items-center">
						<input
							type="radio"
							:checked="selectedAccess === access.id"
							class="pointer-events-none"
						/>
					</span>
				</div>
			</div>

			<div class="flex items-center justify-between mt-5">
				<div class="text-xs text-gray-500">
					Step
					{{ workspaceStore.createWorkspacePage === "blank" ? 1 : 2 }}
					of 2
				</div>
				<div class="flex">
					<el-button
						@click="
							cancelOrBack(workspaceStore.createWorkspacePage)
						"
						class="ml-2 px-4 py-2 text-sm border-none rounded cursor-pointer text-text-color hover:bg-secondary-button-hover-color"
					>
						{{
							workspaceStore.createWorkspacePage === "blank"
								? "Cancel"
								: "Back"
						}}
					</el-button>
					<el-button
						:disabled="
							!workspaceStore.createWorkSpaceName &&
							workspaceStore.createWorkspacePage === 'init'
						"
						@click="nextStepOrCreate"
						class="ml-2 px-4 py-2 text-sm border-none rounded cursor-pointer text-primary-light bg-primary hover:text-primary-light"
					>
						{{
							workspaceStore.createWorkspacePage === "blank"
								? "Next"
								: "Create"
						}}
					</el-button>
				</div>
			</div>
		</div>
		<div class="flex-grow">
			<!-- Right panel content -->
		</div>
	</div>
</template>

<script setup lang="ts">
	import { Connection, Document, Monitor } from "@element-plus/icons-vue";
	import { ref, watchEffect } from "vue";
	import { useWorkspaceStore } from "../stores/workspace";
	const workspaceStore = useWorkspaceStore();

	const templates = [
		{
			id: "apiDev",
			name: "API development",
			icon: Connection,
			description: "Template for API development.",
		},
		{
			id: "apiTest",
			name: "API testing",
			icon: Monitor,
			description: "Template for API testing.",
		},
		{
			id: "incident",
			name: "Incident response",
			icon: Document,
			description: "Template for incident response.",
		},
		{
			id: "cloud",
			name: "Cloud infrastructure management",
			icon: Connection,
			description: "Template for cloud infrastructure management.",
		},
		{
			id: "apiDemos",
			name: "API demos",
			icon: Monitor,
			description: "Template for API demos.",
		},
		{
			id: "apiSecurity",
			name: "API security",
			icon: Document,
			description: "Template for API security.",
		},
		{
			id: "partner",
			name: "Partner Collaboration",
			icon: Connection,
			description: "Template for partner collaboration.",
		},
	];

	// 模版
	const selectedTemplate = ref("blank");
	// 模版名称
	const selectedTemplateName = ref("");
	// 模版描述
	const selectedTemplateDescription = ref("");

	watchEffect(() => {
		const template = templates.find((t) => t.id === selectedTemplate.value);
		selectedTemplateName.value = template?.name || "";
		selectedTemplateDescription.value = template?.description || "";
	});

	// 选择模板
	const selectTemplate = (id: string) => {
		selectedTemplate.value = id;
	};

	const accessselected = [
		{
			id: "1",
			name: "Only me",
			// icon: User,
			description: "Personal.",
		},
		{
			id: "2",
			name: "Only invited team members",
			// icon: Lock,
			description: "Private",
		},
		{
			id: "3",
			name: "Everyone",
			// icon: Users,
			description: "Public",
		},
		{
			id: "4",
			name: "Only invited team members",
			// icon: Lock,
			description: "Private",
		},
	];

	const selectedAccess = ref("1");

	const selectAccess = (id: string) => {
		selectedAccess.value = id;
	};

	const cancelOrBack = (step: string) => {
		if (step === "blank") {
			workspaceStore.setCreateWorkspacePage("cancel");
		} else {
			workspaceStore.setCreateWorkspacePage("blank");
		}
	};

	const nextStepOrCreate = () => {

	};
</script>
