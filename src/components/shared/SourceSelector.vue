<template>
  <div class="sourceSelector">
    <div class="dropdown">
      <button class="btn btn-link dropdown-toggle" tabindex="0">
        {{currentDocumentName}} <i class="icon icon-caret"></i>
      </button>
      <!-- menu component -->
      <ul class="menu">
        <!-- menu header text -->
        <li class="divider" data-content="Modern Documents"></li>
        <li class="menu-item" v-for="(doc, d) in availableModernDocuments" :key="d">
          <a href="#">{{doc.label}}</a>
        </li>

        <li class="divider" data-content="Reconstructions"></li>
        <li class="menu-item" v-for="(doc, d) in availableReconstructionDocuments" :key="d">
          <a href="#">{{doc.label}}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'

export default {
  name: 'SourceSelector',
  props: {

  },
  components: {

  },
  methods: {

  },
  computed: {
    currentDocumentName () {
      return 'Notirungsbuch K'
    },
    availableModernDocuments () {
      // TODO: Diese IDs sind vorläufig!!!
      return [{ id: 'E', label: 'Engelmann' },
        { id: 'L', label: 'Landsberg 8' },
        { id: 'B', label: 'BSk 21' },
        { id: 'G', label: 'Grasnick 20b' },
        { id: 'F', label: 'BN fond français 12.756' },
        { id: 'Ms96', label: 'Ms. 96' },
        { id: 'Ms57', label: 'Ms. 57(2)' }
      ]
    },
    availableReconstructionDocuments () {
      return [{ id: 'NotK', label: 'Notirungsbuch K' }]
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
