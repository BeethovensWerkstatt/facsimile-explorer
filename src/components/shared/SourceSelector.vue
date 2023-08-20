<template>
  <div class="sourceSelector">
    <div :class="{ dropdown: !table }">
      <button class="btn btn-link dropdown-toggle" tabindex="0">
        {{currentDocumentName}} <i class="icon icon-caret"></i>
      </button>
      <!-- menu component -->
      <div v-if="allDocsLoaded">
        <ul class="menu">
          <!-- menu header text -->
          <li class="divider" data-content="Modern Documents"></li>

            <li class="menu-item" v-for="(doc, d) in availableModernDocuments" :key="d">
              <!-- <a href="#" @click.prevent="openDocument(doc)">{{doc?.label}}</a>-->
              <!-- <RouterLink :to="{ name: 'modus', params: { source: doc?.name, modus: $route.params.modus || 'pages' } }">{{  doc?.label  }}</RouterLink> -->
              <router-link :to="'/' + doc.name + '/pages?page=1'">{{doc.label}}</router-link>
            </li>
          <li class="divider" data-content="Reconstructions"></li>
          <li class="menu-item" v-for="(doc, d) in availableReconstructionDocuments" :key="d">
            <!-- <a href="#" @click.prevent="openDocument(doc)">{{doc?.label}}</a>-->
            <!-- <RouterLink :to="{ name: 'modus', params: { source: doc?.name, modus: $route.params.modus || 'pages' } }">{{  doc?.label  }}</RouterLink> -->
            <router-link :to="'/' + doc.name + '/pages?page=1'">{{doc.label}}</router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
// import { RouterLink } from 'vue-router'
import { mapGetters } from 'vuex'

export default {
  name: 'SourceSelector',
  props: {
    table: {
      type: Boolean,
      default: false
    }
  },
  components: {
    // RouterLink
  },
  methods: {
    openDocument (doc) {
      console.log('\n\nopenDocument', doc)
      this.$store.dispatch('loadContent', doc)
      console.log(doc.name, this.$route.params.modus || 'pages')
      this.$router.push({ name: 'modus', params: { source: doc.name, modus: this.$route.params.modus || 'pages' }, query: { page: 1 } })
      if (this.table) {
        this.$store.dispatch('setExplorerTab', 'pages')
      }
    }
  },
  computed: {
    ...mapGetters(['sources', 'filepath', 'allDocsLoaded']),
    currentDocumentName () {
      // console.log('\n\nFILEPATH: ' + this.$store.getters.filepath)
      // console.log(this.filepath, this.availableDocuments)
      const cursrc = this.availableDocuments.filter(s => s.path === this.filepath)
      if (cursrc.length > 0) return cursrc[0].label
      return 'N/A'
    },
    availableDocuments () {
      // console.log('SourceSelector: ' + this.sources.length + ' sources available')
      return this.sources.map(s => ({
        ...s,
        id: s.name.replaceAll(' ', '_'),
        label: s.name.replaceAll('_', ' ')
      }))
    },
    availableModernDocuments () {
      return this.availableDocuments.filter(s => s.id !== 'Notirungsbuch_K')
    },
    availableReconstructionDocuments () {
      return this.availableDocuments.filter(s => s.id === 'Notirungsbuch_K')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.menu {
  min-width: 240px;
}

</style>
