<template>
  <div v-if="routeAuthenticate || authenticated()">
    <router-view v-if="routeAuthenticate || initComplete" />
    <div v-else class="loading">loading ...</div>
  </div>
  <div v-else>
    <div class="externalMessages">Sie müssen sich zuerst bei GitHub <a :href="authurl">authentifizieren</a>!</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CLIENT_ID from '@/clientID'

export default {
  name: 'FacsimileExplorer',
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'initComplete'
    ]),
    routeAuthenticate () {
      return this.$route.name === 'authenticate'
    },
    authurl: () => `https://github.com/login/oauth/authorize?scope=repo&client_id=${CLIENT_ID}`
  },
  methods: {
    authenticated () {
      if (!this.isAuthenticated) {
        this.$store.dispatch('checkAuthenticate')
      }
      return this.isAuthenticated
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
