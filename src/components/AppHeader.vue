<template>

  <header class="navbar appHeader">
    <section class="navbar-section">
      <span class="navbar-brand mr-2">Facsimile Explorer</span>
      <span class="docTitle">{{docTitle}}</span>
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
  },
  computed: {
    docTitle () {
      const title = this.$store.getters.title
      const page = this.$store.getters.currentPageOneBased

      if (title !== '' && page !== -1) {
        return title + ', page ' + page
      } else {
        return ''
      }
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

  .docTitle {
    font-size: .7rem;
    font-weight: 700;
    padding-top: .2rem;
  }
}
</style>
