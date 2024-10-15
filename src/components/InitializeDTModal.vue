<template>

  <div class="modal" :class="{ active }" id="select-dt-systems-modal">
    <a href="#close" @click="closeModal()" class="modal-overlay" aria-label="Close"></a>
    <div class="modal-container">
      <div class="modal-header">
        <a href="#close" @click="closeModal()" class="btn btn-clear float-right" aria-label="Close"></a>
        <div class="modal-title h5">Select Systems to include in DT</div>
      </div>
      <div class="modal-body">
        <div>
          <label for="dtsystemcount">Anzahl Systeme: </label>
          <input type="number" :model="systemcount" min="1" :max="Math.max(1, rastrumcount)" ref="systemcount" id="dtsystemcount" />
          <button class="btn" @click="$refs.systemcount.value = guessSystems()"><i class="icon icon-refresh"></i></button>
        </div>
        <div>
          Systems
          <button class="btn btn-clear" @click="rastrums = guessRastrums()"></button>
        </div>
        <div v-for="(rastrum, i) in rastrumsOnCurrentPage" :key="i">
          <span class="sysnum">{{ i+1 }}.:</span>
          <input type="checkbox" :checked="rastrums[i + 1]" @change="toggle(i + 1, rastrum)" :ref="'sel-' + rastrum.id" />
          {{ `${rastrum.x}, ${rastrum.y}` }}<!-- <code>{{ rastrum.id }}</code> -->
        </div>
        <!-- <div>{{ rastrumlist }}</div> -->
      </div>
      <div class="modal-footer">
        <div class="btn-group">
          <button class="btn" @click="closeModal()">Cancel</button>
          <button class="btn btn-primary" @click="main()">Select</button>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'InitializeDTModal',
  components: {
  },
  props: {
  },
  watch: {
    active () {
      if (this.active) {
        // start with at least 1 system
        if (this.systemcount === 0 || !this.$refs.systemcount.value) {
          this.systemcount = this.guessSystems()
          this.$refs.systemcount.value = this.guessSystems()
        }
        // if nothing is selected yet guess rastrums
        if (this.rastrumcount === 0) {
          this.rastrums = this.guessRastrums()
        }
      }
    },
    activeWritingZone () {
      // clear selections if WZ is changed
      this.rastrums = this.guessRastrums()
      const systemcount = this.guessSystems()
      this.systemcount = systemcount
      this.$refs.systemcount.value = systemcount
    }
  },
  data: () => ({
    systemcount: 0,
    rastrums: {}
  }),
  methods: {
    closeModal () {
      this.$store.dispatch('setModal', null)
    },
    toggle (i, rastrum) {
      if (this.rastrums[i]) {
        delete this.rastrums[i]
      } else {
        this.rastrums[i] = rastrum
      }
    },
    main () {
      console.log(this.systemcount, this.rastrumlist)
      this.$store.dispatch('setModal', null)
    },
    guessRastrums () {
      const rastrums = {}
      const affectedStaves = this.$store.getters.activeDiploTransAffectedStaves
      // console.log(affectedStaves)
      for (const { n, rastrum } of affectedStaves) {
        // console.log(n, rastrum.id)
        rastrums[n] = rastrum
      }
      return rastrums
    },
    guessSystems () {
      const annotatedTranscript = this.$store.getters.annotatedTranscriptForCurrentWz
      // console.log(annotatedTranscript)
      const staffs = annotatedTranscript?.querySelectorAll('staffDef')
      // console.log(staffs)
      return staffs?.length || 1
    }
  },
  computed: {
    ...mapGetters(['rastrumsOnCurrentPage', 'activeWritingZone']),
    active () {
      return this.$store.getters.modal === 'initializeDT'
    },
    rastrumlist () {
      return Object.keys(this.rastrums).filter(k => this.rastrums[k]).map(k => +k)
    },
    rastrumcount () {
      return this.rastrumlist.length
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/css/_variables.scss';

.sysnum {
  display: inline-block;
  width: 2em;
  text-align: right;
}

</style>
