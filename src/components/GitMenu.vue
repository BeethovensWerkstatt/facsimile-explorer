<template>
  <div class="dropdown">
    <button class="btn btn-link dropdown-toggle" tabindex="0">
      <!--GitHub --><i class="icon icon-menu"></i>
    </button>
    <ul class="menu gitMenu">
      <li class="menu-item">
        <div v-if="ghUserName">
          <div class="tile tile-centered">
            <div class="tile-icon"><img class="avatar" :src="ghUserAvatar" :alt="ghUserName"></div>
            <div class="tile-content">{{ ghUserName }}</div>
          </div>
          <button @click="logout()" class="customBtn btn btn-link">
            Logout
          </button>
        </div>
        <div class="tile tile-centered" v-else>
          <div class="tile-icon"><img class="avatar" src="/Octocat.jpg" alt="GitHub"></div>
          <div class="tile-content"><button @click="login()" class="customBtn btn btn-link">Login</button></div>
        </div>
      </li>
      <!--
      <li class="menu-item">

      </li>
      <li class="divider" data-content="Repository"></li>

      <li class="menu-item">
        <a href="#">
          BeethovensWerkstatt
          <!-/- the repo – we could hard-code some of this… -/->
        </a>
      </li>
      <li class="menu-item">
        <a href="#">
          data
          <!-/- the repo -/->
        </a>
      </li>
      <li class="menu-item">
        <a href="#">
          dev
          <!-/- the branch -/->
        </a>
      </li>
      <li class="menu-item">
        <a href="#">
          D-BNba_HCB_Mh_60.xml
          <!-/- a click could open a filepicker component within that repo -/->
        </a>
      </li>
    -->
      <li class="divider" data-content="Data"></li>

      <!--<li class="menu-item">
        <a href="#">
          <i class="icon icon-refresh"></i> Fetch updates
        </a>
      </li>
      <li class="menu-item">
        <a href="#">
          <i class="icon icon-upload"></i> Commit changes
        </a>
      </li>-->
      <li class="menu-item">
        <button class="customBtn btn btn-link" @click="importGH()">
          <i class="icon icon-download"></i> Fetch from Github
       </button>
      </li>
      <li class="menu-item">
        <button class="customBtn btn btn-link" @click="commitGH()">
          <i class="icon icon-upload"></i> Commit to Github
       </button>
      </li>
      <!--<li class="menu-item">
        <button class="customBtn btn btn-link" @click="importIIIF()">
          <i class="icon icon-upload"></i> Import IIIF Manifest
       </button>
      </li>
      <li class="menu-item">
        <button class="customBtn btn btn-link" @click="loadXML()">
          <i class="icon icon-upload"></i> Load XML
        </button>
      </li>-->
      <li class="menu-item">
        <button class="customBtn btn btn-link" :disabled=!hasXML @click="downloadXML()">
          <i class="icon icon-download"></i> Download XML
        </button>
      </li>
      <li class="divider" data-content="Actions"></li>
      <li class="menu-item">
        <button class="customBtn btn btn-link" :disabled=!isReady @click="showOverview()">
          <i class="icon icon-copy"></i> Document Overview
       </button>
      </li>
    </ul>
  </div>
</template>

<script>
import { computed, inject, onMounted } from '@vue/runtime-core'
import { useStore } from 'vuex'
import fileDownload from 'js-file-download'
import { GH_ACCESS_TOKEN } from '@/store/octokit'
import CLIENT_ID from '@/clientID'

export default {
  name: 'GitMenu',
  props: {
  },
  setup (props) {
    const store = useStore()

    const $cookies = inject('$cookies')

    const isReady = computed(() => store.getters.isReady)
    const hasXML = computed(() => store.getters.hasXML)
    const xmlDocumentCode = computed(() => store.getters.xmlDocumentCode)
    const xmlFilename = computed(() => 'annotatedMEI.xml')
    // eslint-disable-next-line camelcase
    const gh_user = computed(() => store.getters.gh_user)
    const isAuthenticated = computed(() => store.getters.isAuthenticated)
    const ghUserName = computed(() => gh_user.value?.login)
    const ghUserAvatar = computed(() => gh_user.value?.avatar_url)

    const importGH = () => store.dispatch('loadContent', {})
    const commitGH = () => store.dispatch('setModal', 'commitmei')
    const importIIIF = () => store.dispatch('setModal', 'iiif')
    const loadXML = () => store.dispatch('setModal', 'loadxml')
    const downloadXML = () => {
      const xml = xmlDocumentCode()
      if (xml !== null) {
        const data = new Blob([xml], { type: 'text/xml' })
        fileDownload(data, xmlFilename.value)
      }
    }
    const showOverview = () => store.dispatch('setModal', 'overview')
    const login = () => {
      // this page will open /authorize?code=<GH_CODE> on success
      const url = `https://github.com/login/oauth/authorize?scope=repo&client_id=${CLIENT_ID}`
      window.open(url, '_self')
    }
    const logout = () => {
      store.dispatch('logout', {
        remove: () => {
          console.log('remove ' + GH_ACCESS_TOKEN)
          $cookies.remove(GH_ACCESS_TOKEN, '/')
          window.location.reload(true)
        }
      })
    }

    onMounted(() => {
      // console.log('CLIENT_ID=' + JSON.stringify(process.env, '', 2))
      // console.log(document.cookie)
      if (!isAuthenticated.value) {
        const auth = $cookies.get(GH_ACCESS_TOKEN)
        if (auth) {
          // console.log(GH_ACCESS_TOKEN, auth)
          store.commit('SET_ACCESS_TOKEN', { auth })
        }
      }
    })

    return {
      isReady,
      hasXML,
      gh_user,
      isAuthenticated,
      ghUserName,
      ghUserAvatar,
      importGH,
      commitGH,
      importIIIF,
      loadXML,
      downloadXML,
      showOverview,
      login,
      logout
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

// This will determine the width of the menu
$gitMenuOffset: -200px;

.customBtn.btn.btn-link {
   text-align: left;
   margin: 0;
   padding: 0;
   border: none;
}

.btn.dropdown-toggle, .btn.dropdown-toggle:active, .btn.dropdown-toggle:hover, .btn.dropdown-toggle:focus {
  color: $lightFontColor;
  border: none;
  box-shadow: none;
}

.gitMenu {
  width: calc( abs($gitMenuOffset) + 100px);
  left: $gitMenuOffset !important;

  color: $darkFontColor;
  font-weight: 300;

  .icon {
    font-size: .7rem;
    position: relative;
    top: -1px;
    padding-right: 5px;
  }
}
</style>
