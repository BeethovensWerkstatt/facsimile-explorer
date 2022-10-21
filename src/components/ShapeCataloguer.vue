<template>
  <div class="shapeCataloguer">
     <div class="verticalTabContent">
        <div id="systemSelector">
           <label for="whichSystem">System</label>
           <select name="whichSystem" id="whichSystem" v-model="whichSystem">
             <option value="-1">inactive</option>
             <option v-for="i in systemCount" :key="i" :value="i">System {{i}}</option>
           </select>
        </div>
        <!--<ShapeTranscriber :type="activeTab" :system="whichSystem"/>-->
        <template v-if="activeTab === 'notes'">
           <h1>Notes</h1>
           <button @click="createElement('note')">Add Note</button>

           Duration
           <select name="noteDur" id="noteDur" v-model="noteDur">
             <option v-if="noteDur === 'unset'">unset</option>
             <option value="1">Whole</option>
             <option value="2">Half</option>
             <option value="4">Quarter</option>
             <option value="8">8th</option>
             <option value="16">16th</option>
             <option value="32">32nd</option>
             <option value="64">64th</option>
           </select>
           Location
           <input type="number" name="loc" id="loc" max="20" min="-10" v-model="loc"/>
           Stem Direction
           <select name="noteStemDir" id="noteStemDir" v-model="noteStemDir">
             <option value="unset" v-if="noteStemDir === 'unset'">unset</option>
             <option value="up">up</option>
             <option value="down">down</option>
           </select>
           Horizontal Position
           <input type="number" name="xPos" id="xPos" disabled v-if="xPos === -1"/>
           <input type="number" name="xPos" id="xPos" v-else v-model="xPos"/>
        </template>

        <template v-if="activeTab === 'accidental'">
           <h1>Accidentals</h1>
           <button @click="createElement('accid')">Add Accidental</button>

           Type
           <select name="accidType" id="accidType" v-model="accidType">
             <option v-if="accidType === 'unset'">unset</option>
             <option value="s">Sharp</option>
             <option value="f">Flat</option>
             <option value="n">Natural</option>
           </select>

           Location
           <input type="number" name="loc" id="loc" max="20" min="-10" v-model="loc"/>

           Horizontal Position
           <input type="number" name="xPos" id="xPos" disabled v-if="xPos === -1"/>
           <input type="number" name="xPos" id="xPos" v-else v-model="xPos"/>
        </template>

        <div>
           <h1>List</h1>
           <table class="table table-striped">
             <thead>
                <tr>
                   <th>
                      @coord.x1
                   </th>
                   <th v-if="activeTab === 'notes' || activeTab === 'rests'">
                      @dur
                   </th>
                   <th>
                      @loc
                   </th>
                   <th v-if="activeTab === 'notes'">
                      @stem.dir
                   </th>
                   <th>
                      # @facs
                   </th>
                </tr>
             </thead>
             <tbody>
               <tr v-for="(elem, e) in elementList" :key="e" :class="{active: elem.getAttribute('xml:id') === activeElementId}" :data-id="elem.getAttribute('xml:id')" :title="elem.getAttribute('xml:id')" @click="activateElement(elem.getAttribute('xml:id'))">
                 <td>
                    {{elem.getAttribute('coord.x1')}}
                 </td>
                 <td v-if="activeTab === 'notes' || activeTab === 'rests'">
                    {{elem.getAttribute('dur')}}
                 </td>
                 <td>
                    {{elem.getAttribute('loc')}}
                 </td>
                 <td v-if="activeTab === 'notes'">
                    {{elem.getAttribute('stem.dir')}}
                 </td>
                 <td>
                    {{(elem.hasAttribute('facs')) ? elem.getAttribute('facs').replace(/\s+/g,' ').trim().split(' ').length : 0}}
                 </td>
               </tr>
             </tbody>
           </table>
        </div>
     </div>
     <div class="verticalTab" :class="{active: activeTab === 'notes'}" @click="switchTab('notes')"><span class="colorProbe color1"></span>Notes</div>
     <div class="verticalTab" :class="{active: activeTab === 'accidental'}" @click="switchTab('accidental')"><span class="colorProbe color1a"></span>Accidentals</div>
     <div class="verticalTab" :class="{active: activeTab === 'rests'}" @click="switchTab('rests')"><span class="colorProbe color2"></span>Rests</div>
     <div class="verticalTab" :class="{active: activeTab === 'barlines'}" @click="switchTab('barlines')"><span class="colorProbe color3"></span>Barlines</div>
     <div class="verticalTab" :class="{active: activeTab === 'beams'}" @click="switchTab('beams')"><span class="colorProbe color4"></span>Beams</div>
     <div class="verticalTab" :class="{active: activeTab === 'dynamics'}" @click="switchTab('dynamics')"><span class="colorProbe color5"></span>Dynamics</div>
     <div class="verticalTab" :class="{active: activeTab === 'artic'}" @click="switchTab('artic')"><span class="colorProbe color6"></span>Articulation</div>
     <div class="verticalTab" :class="{active: activeTab === 'text'}" @click="switchTab('text')"><span class="colorProbe color7"></span>Text</div>
     <div class="verticalTab" :class="{active: activeTab === 'other'}" @click="switchTab('other')"><span class="colorProbe color8"></span>Other</div>
  </div>
</template>

<script>
// import ShapeTranscriber from '@/components/ShapeTranscriber.vue'

export default {
  name: 'ShapeCataloguer',
  components: {
  },
  methods: {
    switchTab (val) {
      this.$store.dispatch('setCataloguerTab', val)
    },
    createElement (type) {
      if (this.activeTab !== -1) {
        this.$store.dispatch('createTranscriptionElement', { type, system: this.whichSystem })
      }
    },
    activateElement (id) {
      this.$store.dispatch('activateTranscriptionElement', id)
    }
  },
  computed: {
    activeTab () {
      return this.$store.getters.cataloguerTab
    },
    systemCount () {
      return this.$store.getters.systemsOnCurrentPage.length
    },
    activeElementId () {
      return this.$store.getters.activeElementId
    },
    activeElement () {
      return this.$store.getters.activeElement
    },
    elementList () {
      return this.$store.getters.relevantElementsByActiveSystem
    },
    whichSystem: {
      get () {
        return this.$store.getters.activeSystem
      },
      set (value) {
        this.$store.dispatch('setActiveSystem', value)
      }
    },
    noteDur: {
      get () {
        const elem = this.activeElement
        if (elem === null || !elem.hasAttribute('dur')) {
          return 'unset'
        }
        return elem.getAttribute('dur')
      },
      set (value) {
        this.$store.dispatch('setAttribute', { elemId: this.activeElementId, attName: 'dur', attValue: value })
      }
    },
    loc: {
      get () {
        const elem = this.activeElement
        if (elem === null || !elem.hasAttribute('loc')) {
          return 0
        }
        return elem.getAttribute('loc')
      },
      set (value) {
        this.$store.dispatch('setAttribute', { elemId: this.activeElementId, attName: 'loc', attValue: value })
      }
    },
    noteStemDir: {
      get () {
        const elem = this.activeElement
        if (elem === null || !elem.hasAttribute('stem.dir')) {
          return 'unset'
        }
        return elem.getAttribute('stem.dir')
      },
      set (value) {
        this.$store.dispatch('setAttribute', { elemId: this.activeElementId, attName: 'stem.dir', attValue: value })
      }
    },
    xPos: {
      get () {
        const elem = this.activeElement
        if (elem === null || !elem.hasAttribute('coord.x1')) {
          return -1
        }
        return elem.getAttribute('coord.x1')
      },
      set (value) {
        this.$store.dispatch('setAttribute', { elemId: this.activeElementId, attName: 'coord.x1', attValue: value })
      }
    },
    accidType: {
      get () {
        const elem = this.activeElement
        if (elem === null || !elem.hasAttribute('accid')) {
          return 'unset'
        }
        return elem.getAttribute('accid')
      },
      set (value) {
        this.$store.dispatch('setAttribute', { elemId: this.activeElementId, attName: 'accid', attValue: value })
      }
    }
    /*,
    selectionRect () {
      return this.$store.getters.selectionRect
    },
    systems () {
      return this.$store.getters.systemsOnCurrentPage
    } */
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.shapeCataloguer {
   min-height: calc(8 * 28.5px);
   overflow-y: scroll;
}

.verticalTabContent {
   float: right;
   width: 80%;
   height: 500px;
   border-left: $lightBorder;
   background-color: #ffffff;
   padding: .2rem;

   h1 {
      font-size: 1rem;
      font-weight: 500;
      margin: 0;
   }

   #whichSystem {
      float: right;
      &:before {
         content: 'System: ';
      }
   }

   table {

      tbody tr.active {
         background-color: $activeHighlightColor;
      }

      td {
         padding: 0 .2rem;
      }
   }
}

.verticalTab {
   width: 20%;
   background-color: #e5e5e5;
   padding: .1rem .3rem;
   border-bottom: $lightBorder;

   .colorProbe {
      margin: .1rem .3rem .1rem .1rem;
      width: 10px;
      height: 10px;
      border: $lightBorder;
      display: inline-block;
      position: relative;
      top: 2px;
      border-radius: 3px;

      &.color1 {
         background-color: $highlightColor01;
      }
      &.color1a {
         background-color: $highlightColor01a;
      }
      &.color2 {
         background-color: $highlightColor02;
      }
      &.color3 {
         background-color: $highlightColor03;
      }
      &.color4 {
         background-color: $highlightColor04;
      }
      &.color5 {
         background-color: $highlightColor05;
      }
      &.color6 {
         background-color: $highlightColor06;
      }
      &.color7 {
         background-color: $highlightColor07;
      }
      &.color8 {
         background-color: $highlightColor08;
      }
   }

   &.active {
      background-color: #ffffff;
      width: 20%;
   }
}
</style>
