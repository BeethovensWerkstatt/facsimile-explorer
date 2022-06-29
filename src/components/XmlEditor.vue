<template>
  <div id="xmlContainer">
    <Codemirror
      v-model="code"
      placeholder="Code goes here..."
      :style="{ height: '400px' }"
      :autofocus="true"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="extensions"
      @ready="log('ready', $event)"
      @change="codeChange($event)"
      @focus="log('focus', $event)"
      @blur="log('blur', $event)"
    />
  </div>
</template>

<script>
import { Codemirror } from 'vue-codemirror'
// import { javascript } from '@codemirror/lang-javascript'
// import { oneDark } from '@codemirror/theme-one-dark'

// import { EditorState } from '@codemirror/state'

export default {
  name: 'XmlEditor',
  components: {
    Codemirror
  },
  methods: {
    codeChange: (val) => {
      console.log('hallo hier????')
      console.log(val)
      this.$store.dispatch('setXmlCode', val)
    }
  },
  /* computed: {
    code: {
      get: function () {
        this.$store.getters.xmlCode
      },
      set: function (val) {
        this.$store.dispatch('setXmlCode', val)
      }
    }
  }, */
  setup () {
    const code = 'hallo 2' // this.$store.getters.xmlCode // ref('console.log(\'Hello, world!\')')
    const extensions = [] // [javascript(), oneDark]

    return {
      code,
      extensions,
      log: console.log
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
