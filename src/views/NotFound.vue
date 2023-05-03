<template>
  <AppHeader/>
  <div class="error _404">
    Die Seite <code>{{ $route.fullPath }}</code> wurde nicht gefunden!
    <button class="btn btn-link" @click.prevent.stop="() => $router.go(-1)">zurück</button>
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'

export default {
  name: 'NotFound',
  components: { AppHeader }
}
</script>

<style type="scss">
</style>
