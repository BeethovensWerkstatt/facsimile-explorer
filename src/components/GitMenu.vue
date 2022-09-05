<template>
  <div class="dropdown">
    <button class="btn btn-link dropdown-toggle" tabindex="0">
      <!--GitHub --><i class="icon icon-menu"></i>
    </button>
    <ul class="menu gitMenu">
      <li class="menu-item">
        <div class="tile tile-centered" v-if="ghUserName">
          <div class="tile-icon"><img class="avatar" :src="ghUserAvatar" :alt="ghUserName"></div>
          <div class="tile-content">{{ ghUserName }}</div>
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
        <button class="customBtn btn btn-link" @click="importIIIF()">
          <i class="icon icon-upload"></i> Import IIIF Manifest
       </button>
      </li>
      <li class="menu-item">
        <button class="customBtn btn btn-link" @click="loadXML()">
          <i class="icon icon-upload"></i> Load XML
        </button>
      </li>
      <li class="menu-item">
        <button class="customBtn btn btn-link" @click="downloadXML()">
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
import { mapGetters } from 'vuex'
import fileDownload from 'js-file-download'

export default {
  name: 'GitMenu',
  props: {
  },
  computed: {
    ...mapGetters(['isReady', 'gh_user']),
    ghUserName () {
      return this.gh_user?.login
    },
    ghUserAvatar () {
      return this.gh_user?.avatar_url
    },
    xmlFilename () {
      // TODO create filename from signature
      return 'annotatedMEI.xml'
    }
  },
  methods: {
    xmlDataUrl () {
      const xml = this.$store.getters.xmlDocumentCode()
      if (xml !== null) {
        return 'data:text/xml,' + encodeURIComponent(xml)
      }
      return '#'
    },
    importIIIF () {
      this.$store.dispatch('setModal', 'iiif')
    },
    loadXML () {
      this.$store.dispatch('setModal', 'loadxml')
    },
    downloadXML () {
      const xml = this.$store.getters.xmlDocumentCode()
      if (xml !== null) {
        const data = new Blob([xml], {
          type: 'text/xml'
        })
        fileDownload(data, this.xmlFilename)
      }
    },
    showOverview () {
      this.$store.dispatch('setModal', 'overview')
    },
    login () {
      console.log('login ...')
    },
    logout () {
      console.log('logout ...')
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
