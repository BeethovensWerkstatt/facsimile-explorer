<template>
  <div>
    <header class="navbar appHeader">
      <section class="navbar-section">
        <span class=""><a href="https://beethovens-werkstatt.de" target="_blank" rel="noreferrer nofollow"><img class="bwLogo" src="/bw_logo.png" alt="Beethovens Werkstatt"></a></span>
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
    <div class="appTabs">
      <ul class="tab">
        <li class="tab-item">
          <a href="#"><img class="home" src="/home.png"></a>
        </li>
        <li class="tab-item">
          <a href="#" class="active">Pages / SVG</a>
        </li>
        <li class="tab-item">
          <a href="#">Systems</a>
        </li>
        <li class="tab-item">
          <a href="#">Writing Zones</a>
        </li>
        <li class="tab-item">
          <a href="#">Diplomatic Transcripts</a>
        </li>
      </ul>
    </div>
  </div>
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
      const page = this.$store.getters.page(this.$store.getters.currentPageZeroBased)?.label

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

  .bwLogo {
    width: 100px;
    margin-top: 10px;
    margin-right: 1rem;
  }

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

.appTabs {
  background: linear-gradient(to bottom, lighten($darkBackgroundColor, 20%), lighten($darkBackgroundColor, 2%));

  ul.tab {
    margin: 0;

    .tab-item a {
      background-color: #ffffff66;
      border-radius: 5px;
      padding: .2rem .8rem .1rem .8rem;
      margin: .1rem;

      &:focus {
        color: unset;
      }

      &:hover {
        color: #ffffff;
      }

      &.active {
        background-color: #ffffff;
        border-bottom-color: #ffffff;
        border-radius: 5px 5px 0 0;
        margin-bottom: 0;
        padding-bottom: .2rem;
        color: #333333;
        font-weight: 500;
      }

      .home {
        height: .8rem;
        position: relative;
        top: .15rem;
      }

    }
  }
}
</style>
