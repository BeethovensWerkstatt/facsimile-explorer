<template>
  <div id="xmlContainer">
    <Codemirror
      v-model="code"
      placeholder=""
      :autofocus="true"
      :indent-with-tab="true"
      :tab-size="2"
      :disabled="disabled"
      :extensions="extensions"
      @ready="handleReady"
      v-if="filePath && id"
      @change="lock=true"
      @focus="lock=true"
    />
  </div>
</template>

<script>
import { Codemirror } from 'vue-codemirror'
import { EditorView } from '@codemirror/view'
// import { javascript } from '@codemirror/lang-javascript'
import { xml } from '@codemirror/lang-xml'
import { oneDark } from '@codemirror/theme-one-dark'
import readOnlyRangesExtension from 'codemirror-readonly-ranges'

// import { EditorState } from '@codemirror/state'

export default {
  name: 'XmlEditor',
  props: {
    filePath: String,
    id: String
  },
  components: {
    Codemirror
  },
  data () {
    const extensions = [xml(), oneDark, EditorView.lineWrapping, readOnlyRangesExtension(this.readOnly)]
    return {
      extensions,
      log: console.log,
      view: null
    }
  },
  methods: {
    handleReady (payload) {
      this.view = payload.view
    },
    readOnly (state) {
      // console.log('read only ...')
      const ro = []
      if (this.lock) {
        try {
          // look for locked attributes
          // eslint-disable-next-line no-empty-character-class
          const re = /((xmlns|(xml:)?id|facs)="([^"]+)")/gd
          const s = state.doc.toString()
          let m
          while ((m = re.exec(s)) !== null) {
            const indices = m.indices
            if (indices) {
              // add indices of attribute to list of locked ranges
              ro.push({ from: indices[1][0], to: indices[1][1] })
            }
          }
          // console.log('read only:', ro)
        } catch (e) {
          console.error(e)
        }
      }
      return ro
    }
  },
  computed: {
    code: {
      get () {
        const snippet = this.$store.getters.xmlSnippet({ filePath: this.filePath, id: this.id })
        return snippet
      },
      set (val) {
        // console.log('changing editor to ', val)
        this.$store.dispatch('modifyXml', { filePath: this.filePath, id: this.id, val })
      }
    },
    lock: {
      get () {
        return this.$store.getters.xmlReadOnlyLock
      },
      set (val) {
        this.$store.dispatch('setXmlReadOnlyLock', val)
      }
    },
    disabled () {
      return this.code === ''
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

#xmlContainer {
  overflow-y: auto;
  overflow-x: auto;
  width: 100%;
  height: 100%;
}

</style>
