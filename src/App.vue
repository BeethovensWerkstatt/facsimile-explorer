<template>
  <div v-if="routeAuthenticate || authenticated()">
    <router-view v-if="routeAuthenticate || initComplete" />
    <div v-else class="loading">loading ...</div>
  </div>
  <div v-else>
    <div class="externalMessages" v-if="client_id">Sie müssen sich zuerst bei GitHub <a :href="authurl">authentifizieren</a>!</div>
    <div class="externalMessages" v-else>bitte warten ...</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CLIENT_ID from '@/clientID'

export default {
  name: 'FacsimileExplorer',
  data: () => ({
    client_id: null
  }),
  created () {
    CLIENT_ID.then(id => { this.client_id = id })
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'initComplete'
    ]),
    routeAuthenticate () {
      return this.$route.name === 'authenticate'
    },
    authurl () {
      const clientId = this.client_id
      return `https://github.com/login/oauth/authorize?scope=repo&client_id=${clientId}`
    }
  },
  methods: {
    authenticated () {
      // console.log('authenticated', this.isAuthenticated)
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
