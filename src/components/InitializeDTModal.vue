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
          <input type="number" v-model="systemcount" min="1" :max="Math.max(1, rastrumcount)" ref="systemcount" id="dtsystemcount" />
          <button class="btn" @click="$refs.systemcount.value = guessSystems()" title="set default systemcount">
            <i class="icon icon-refresh"></i>
          </button>
          <span class="scwarn" v-if="rastrumcount % systemcount !== 0">{{ rastrumcount }} mod {{ systemcount }} = {{ rastrumcount % systemcount }}</span>
        </div>
        <div>
          Systems
          <button class="btn" @click="rastrums = guessRastrums()" title="select default rastrum set">
            <i class="icon icon-refresh"></i>
          </button>
        </div>
        <div v-for="(rastrum, i) in rastrumsOnCurrentPage" :key="i" class="rastrum">
          <span class="sysnum">{{ i + 1 }}.:</span>
          <input type="checkbox" :checked="rastrums[i + 1]" @change="toggle(i + 1, rastrum)" :ref="'sel-' + rastrum.id" />
          <!-- <template  v-if="rastrums[i + 1]">
            <template v-for="r in systemcount" :key="'rwz-' + r">
              <input
                type="radio"
                :id="'rs-' + rastrum.id + '-' - r" :name="'rs-' + rastrum.id"
                :value="2"
                v-model="rlinks[i + 1]"
              />
              <label :for="'rs-' + r">{{ r }}</label>
            </template>
          </template> -->
          <!-- {{ `${rastrum.x}, ${rastrum.y}` }} <code>{{ rastrum.id }}</code> -->
        </div>
        <!-- <div>{{ rastrums }}</div> -->
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
  data: () => ({
    systemcount: 0,
    rastrums: {},
    rlinks: {}
  }),
  watch: {
    active () {
      if (this.active) {
        // start with at least 1 system
        const systemcount = this.guessSystems()
        this.systemcount = systemcount

        // if nothing is selected yet guess rastrums
        if (this.rastrumcount === 0) {
          this.rastrums = this.guessRastrums()
        }
        this.rastrumlist.forEach((r, i) => {
          if (!this.rlinks[r]) {
            this.rlinks[r] = (i % systemcount) + 1
          }
        })
      }
    },
    activeWritingZone () {
      // clear selections if WZ is changed
      this.systemcount = this.guessSystems()
      this.rastrums = this.guessRastrums()
    }
  },
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
      console.log('InitializeDTModal:', this.systemcount, this.rastrumlist, this.rastrumids)
      this.$store.dispatch('initializeDiploTrans', { systemcount: this.systemcount, rastrums: this.rastrumids })
      this.$store.dispatch('setModal', null)
    },
    guessSystems () {
      const annotatedTranscript = this.$store.getters.annotatedTranscriptForCurrentWz
      // console.log(annotatedTranscript)
      const staffs = annotatedTranscript?.querySelectorAll('staffDef')
      // console.log(staffs)
      return staffs?.length || 1
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
    }
  },
  computed: {
    ...mapGetters(['rastrumsOnCurrentPage', 'activeWritingZone']),
    active () {
      return this.$store.getters.modal === 'initializeDT'
    },
    rastrumids () {
      return Object.values(this.rastrums).filter(r => !!r).map(r => r.id)
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
  margin-right: 1ex;
}

.rastrum {
  input[type="radio"] {
    margin-left: 1ex;
  }
}

.scwarn {
  margin-left: 2ex;
  color: red;
  font-weight: bold;
}

</style>
