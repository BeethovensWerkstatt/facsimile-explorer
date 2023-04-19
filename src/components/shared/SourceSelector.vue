<template>
  <div class="sourceSelector">
    <div :class="{ dropdown: !table }">
      <button class="btn btn-link dropdown-toggle" tabindex="0">
        {{currentDocumentName}} <i class="icon icon-caret"></i>
      </button>
      <!-- menu component -->
      <ul class="menu">
        <!-- menu header text -->
        <li class="divider" data-content="Modern Documents"></li>
        <li class="menu-item" v-for="(doc, d) in availableModernDocuments" :key="d">
          <a href="#" @click.prevent="openDocument(doc)">{{doc.label}}</a>
        </li>

        <li class="divider" data-content="Reconstructions"></li>
        <li class="menu-item" v-for="(doc, d) in availableReconstructionDocuments" :key="d">
          <a href="#" @click.prevent="openDocument(doc)">{{doc.label}}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
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

  },
  methods: {
    openDocument (doc) {
      this.$store.dispatch('loadContent', doc)
      console.log(this.table)
      if (this.table) {
        this.$store.dispatch('openTab', 'pages')
      }
    }
  },
  computed: {
    ...mapGetters(['sources', 'filepath']),
    currentDocumentName () {
      console.log(this.filepath, this.availableDocuments)
      const cursrc = this.availableDocuments.filter(s => s.path === this.filepath)
      if (cursrc.length > 0) return cursrc[0].label
      return 'N/A'
    },
    availableDocuments () {
      return this.sources.map(s => ({
        ...s,
        id: s.name.replaceAll(' ', '_'),
        label: s.name.replaceAll('_', ' ')
      }))
    },
    availableModernDocuments () {
      // TODO: Diese IDs sind vorläufig!!!
      // console.log(this.sources)
      /*
      return [{ id: 'E', label: 'Engelmann' },
        { id: 'L', label: 'Landsberg 8' },
        { id: 'B', label: 'BSk 21' },
        { id: 'G', label: 'Grasnick 20b' },
        { id: 'F', label: 'BN fond français 12.756' },
        { id: 'Ms96', label: 'Ms. 96' },
        { id: 'Ms57', label: 'Ms. 57(2)' }
      ]
      */
      return this.availableDocuments.filter(s => s.id !== 'Notirungsbuch_K')
    },
    availableReconstructionDocuments () {
      // return [{ id: 'NotK', label: 'Notirungsbuch K' }]
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
