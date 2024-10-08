<template>
  <RouterView v-slot="{ Component, layout }">
    <component :is="layout || 'default'">
      <component :is="Component" />
    </component>
  </RouterView>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>
