<script setup lang="ts">
import { AdminLayout } from '@cloudlink/shared-ui'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<template>
  <AdminLayout :user-store="userStore">
    <router-view />
  </AdminLayout>
</template>