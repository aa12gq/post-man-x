<template>
	<div class="flex items-center justify-center min-h-screen bg-gray-100">
		<el-card class="w-96">
			<h2 class="text-center text-2xl font-bold mb-4">登录</h2>
			<el-form
				:model="userStore.loginForm"
				label-width="80px"
			>
				<el-form-item
					label="用户名"
					prop="username"
				>
					<el-input
						v-model="userStore.loginForm.username"
						placeholder="请输入用户名"
					></el-input>
				</el-form-item>
				<el-form-item
					label="密码"
					prop="password"
				>
					<el-input
						v-model="userStore.loginForm.password"
						type="password"
						placeholder="请输入密码"
					></el-input>
				</el-form-item>
				<el-form-item>
					<el-button
						type="primary"
						@click="userStore.handleLogin()"
						>登录</el-button
					>
				</el-form-item>
			</el-form>
		</el-card>
	</div>
</template>

<script setup lang="ts">
	import { useUserStore } from "../stores/user";

	const userStore = useUserStore();
</script>

<style scoped>
	/* 这里可以添加自定义样式 */
</style>
