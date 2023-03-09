<template>
  <div class="appTab homeTab">
    <div v-if="isAuthenticated">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>Filename</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(source, n) in sources" :key="n" @click="openDocument(source)">
            <td>{{ source.name }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      Sie müssen sich zuerst bei GitHub <a :href="authurl">authentifizieren</a>!
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CLIENT_ID from '@/clientID'
// import SystemListingEntry from '@/components/SystemListingEntry.vue'

export default {
  name: 'HomeTab',
  components: {

  },
  methods: {
    openDocument (source) {
      console.log('Opening File now: ' + source.path)
      this.$store.dispatch('loadContent', { path: source.path })
      this.$router.push({ name: 'modus', params: { source: source.name, page: 1, modus: 'pages' } })
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'sources']),
    authurl: () => `https://github.com/login/oauth/authorize?scope=repo&client_id=${CLIENT_ID}`
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.appTab {
  background: linear-gradient(to bottom, lighten($mainBackgroundColor, 10%), darken($mainBackgroundColor, 2%));
  height: calc(100vh - $totalHeaderHeight);
}

</style>
