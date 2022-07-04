<template>

  <header class="navbar appHeader">
    <section class="navbar-section">
      <span class="navbar-brand mr-2">Facsimile Explorer</span>
      <span class="docTitle">{{docTitle}}</span>
      <!--<a href="..." class="btn btn-link">Docs</a>
      <a href="..." class="btn btn-link">GitHub</a>-->
    </section>
    <section class="navbar-section">
      <div class="loading" v-if="isLoading"></div>
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

const truncate = function (fullStr, strLen, separator) {
  if (fullStr.length <= strLen) return fullStr
  separator = separator || '…'
  const sepLen = separator.length
  const charsToShow = strLen - sepLen
  const frontChars = Math.ceil(charsToShow / 2)
  const backChars = Math.floor(charsToShow / 2)

  return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars)
}

export default {
  name: 'AppHeader',
  components: {
    GitMenu
  },
  computed: {
    docTitle () {
      const title = this.$store.getters.title
      const page = this.$store.getters.page(this.$store.getters.currentPageZeroBased).label

      if (title !== '' && page !== -1) {
        return truncate(title, 40) + ', page ' + page
      } else {
        return ''
      }
    },
    isLoading () {
      return this.$store.getters.loading || this.$store.getters.processing
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

  .loading {
    margin-right: 1rem;
    &:after {
      border-top-color: #e5e5e500;
      border-right-color: #e5e5e533;
      border-bottom-color: #e5e5e566;
      border-left-color: #e5e5e5;
    }
  }
}
</style>
