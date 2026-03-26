<script setup lang="ts">
import { AdminLayout } from '@winuel/shared-ui'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<template>
  <AdminLayout :user-store="userStore">
    <router-view />
  </AdminLayout>
</template>