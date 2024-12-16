<template>
	<div class="workspace-creation">
		<div class="left-panel">
			<h2>Create your workspace</h2>
			<p>Get the most out of your workspace with a template.</p>
			<div class="template-list">
				<div
					class="template-item"
					:class="{ selected: selectedTemplate === 'blank' }"
					@click="selectTemplate('blank')"
				>
					<el-icon :component="Document" />
					<span class="template-name">Blank workspace</span>
					<span class="radio-button">
						<input
							type="radio"
							:checked="selectedTemplate === 'blank'"
						/>
					</span>
				</div>
			</div>
			<div class="divider">
				<span>Explore our templates</span>
			</div>
			<div class="template-list">
				<div
					v-for="template in templates"
					:key="template.id"
					class="template-item"
					:class="{ selected: selectedTemplate === template.id }"
					@click="selectTemplate(template.id)"
				>
					<el-icon :component="template.icon" />
					<span class="template-name">{{ template.name }}</span>
					<span class="radio-button">
						<input
							type="radio"
							:checked="selectedTemplate === template.id"
						/>
					</span>
				</div>
			</div>
			<div class="footer">
				<div class="step-info">Step 1 of 2</div>
				<div class="actions">
					<el-button
						@click="cancel"
						class="cancel-button"
					>
						Cancel
					</el-button>
					<el-button
						type="primary"
						@click="nextStep"
						class="next-button"
					>
						Next
					</el-button>
				</div>
			</div>
		</div>
		<div class="right-panel">
			<!-- Right panel content -->
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, watchEffect } from "vue";
	import { Document, Connection, Monitor } from "@element-plus/icons-vue";

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

	const selectedTemplate = ref("blank");
	const selectedTemplateName = ref("");
	const selectedTemplateDescription = ref("");

	watchEffect(() => {
		const template = templates.find((t) => t.id === selectedTemplate.value);
		selectedTemplateName.value = template?.name || "";
		selectedTemplateDescription.value = template?.description || "";
	});

	const selectTemplate = (id: string) => {
		selectedTemplate.value = id;
	};

	const cancel = () => {
		console.log("Cancel creation");
	};

	const nextStep = () => {
		console.log("Proceed to next step");
	};
</script>

<style scoped>
	.workspace-creation {
		display: flex;
		height: 100vh;
	}

	.left-panel {
		width: 400px; /* 固定宽度 */
		padding: 20px;
		background-color: var(--bg-color);
	}

	.right-panel {
		flex-grow: 1; /* 占据剩余宽度 */
		background-color: var(--bg-secondary);
	}

	.left-panel h2,
	.left-panel p {
		text-align: center;
		color: var(--text-color);
	}

	.left-panel h2 {
		font-size: 20px;
		margin-bottom: 10px;
	}

	.left-panel p {
		font-size: 13px;
		margin-bottom: 20px;
	}

	.template-list {
		margin-top: 20px;
	}

	.template-item {
		display: flex;
		align-items: center;
		padding: 10px;
		cursor: pointer;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		margin-bottom: 10px;
		transition: background-color 0.3s, border-color 0.3s;
	}

	.template-item.selected {
		background-color: var(--primary-light);
		border-color: var(--primary-color);
	}

	.template-item:hover {
		background-color: var(--hover-color);
		border-color: var(--border-hover-color);
	}

	.template-name {
		flex-grow: 1;
		margin-left: 10px;
		font-size: 14px;
		color: var(--text-color);
	}

	.radio-button {
		display: flex;
		align-items: center;
	}

	.radio-button input {
		pointer-events: none;
	}

	.divider {
		display: flex;
		align-items: center;
		text-align: center;
		margin: 20px 0;
	}

	.divider::before,
	.divider::after {
		content: "";
		flex: 1;
		border-bottom: 1px solid #ccc;
	}

	.divider:not(:empty)::before {
		margin-right: 10px;
	}

	.divider:not(:empty)::after {
		margin-left: 10px;
	}

	.footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 20px;
	}

	.step-info {
		font-size: 12px;
		color: #888;
	}

	.actions {
		display: flex;
	}

	.actions button {
		margin-left: 10px;
		padding: 8px 16px;
		font-size: 14px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.next-button:hover {
		background-color: var(--button-hover-bg);
	}
</style>
