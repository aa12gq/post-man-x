<template>
	<div
		class="register max-w-md mx-auto p-6 border border-gray-300 rounded-lg"
	>
		<h1 class="text-2xl font-bold mb-4">注册</h1>
		<el-form>
			<el-form-item label="用户名">
				<el-input
					v-model="userStore.registerForm.username"
					placeholder="请输入用户名"
				/>
			</el-form-item>
			<el-form-item label="密码">
				<el-input
					v-model="userStore.registerForm.password"
					type="password"
					placeholder="请输入密码"
				/>
			</el-form-item>
			<el-button
				type="primary"
				native-type="submit"
				@click="userStore.handleRegister()"
				>注册</el-button
			>
		</el-form>
	</div>
</template>

<script setup lang="ts">
	import { useUserStore } from "../stores/user";

	const userStore = useUserStore();
</script>

<style scoped>
	/* Tailwind CSS 已经在全局引入 */
</style>
