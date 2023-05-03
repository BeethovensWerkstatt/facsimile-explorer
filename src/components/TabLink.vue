<template>
  <router-link :to="tabLink" v-if="tabLink" :class="{ active: tab === $route.params.modus }"><slot>{{ tab }}</slot></router-link>
  <span v-else><slot>{{ tab }}</slot></span>
</template>

<script>
export default {
  name: 'TabLink',
  props: {
    tab: {
      type: String,
      required: true
    }
  },
  computed: {
    tabLink () {
      const source = this.$route.params.source
      if (source) {
        return {
          name: 'modus',
          params: {
            source,
            modus: this.tab
          }
        }
      }
      return undefined
    }
  }
}
</script>

<style lang="scss" scoped>
.active {
  background-color: #ffffff;
  border-bottom: 3px solid #ffffff;
  border-radius: 5px 5px 0 0;
  margin-bottom: 0;
  padding-bottom: .2rem;
  color: #333333;
  font-weight: 500;
  outline: none;

  &:focus {
    outline: none;
  }
}
</style>
