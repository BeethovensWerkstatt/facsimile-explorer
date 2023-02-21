<template>
  <div class="appTab homeTab">
    <div v-if="isAuthenticated">

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

  },
  computed: {
    ...mapGetters(['isAuthenticated']),
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
