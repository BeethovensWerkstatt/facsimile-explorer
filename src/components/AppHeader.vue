<template>

  <header class="navbar appHeader">
    <section class="navbar-section">
      <span class="navbar-brand mr-2">Facsimile Explorer</span>
      <!--<a href="..." class="btn btn-link">Docs</a>
      <a href="..." class="btn btn-link">GitHub</a>-->
    </section>
    <section class="navbar-section">
      <button class="btn btn-link" @click="testData()">test data</button>
      <GitMenu/>
      <!--<div class="input-group input-inline">
        <input class="form-input" type="text" placeholder="search">
        <button class="btn input-group-btn">Search</button>
      </div>-->
    </section>
  </header>

</template>

<script>
import GitMenu from '@/components/GitMenu.vue'

export default {
  name: 'AppHeader',
  components: {
    GitMenu
  },
  methods: {
    testData () {
      console.log('retrieving testdata')
      this.$store.dispatch('getTestData')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.appHeader {
  height: $appHeaderHeight;
  background: linear-gradient(to bottom, $darkBackgroundColor, darken($darkBackgroundColor, 20%));
  color: $lightFontColor;
  font-weight: 100;
  padding: 0 1rem 0 1rem;
}
</style>
