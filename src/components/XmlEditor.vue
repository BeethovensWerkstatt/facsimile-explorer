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
      const re = /<.* (xml:)?id="([^"]+)"/g
      const ro = []
      const s = state.doc.toString()
      let m
      while ((m = re.exec(s)) !== null) {
        ro.push({ from: m.indices[0][0], to: m.indices[0][1] })
      }
      // console.log(ro)
      return ro
    }
  },
  computed: {
    code: {
      get () {
        return this.$store.getters.xmlSnippet({ filePath: this.filePath, id: this.id })
      },
      set (val) {
        // console.log('changing editor to ', val)
        this.$store.dispatch('modifyXml', { filePath: this.filePath, id: this.id, val })
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
