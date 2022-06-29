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
      @change="log('change', $event)"
      @focus="log('focus', $event)"
      @blur="log('blur', $event)"
    />
  </div>
</template>

<script>
import { Codemirror } from 'vue-codemirror'
// import { javascript } from '@codemirror/lang-javascript'
import { xml } from '@codemirror/lang-xml'
import { oneDark } from '@codemirror/theme-one-dark'

// import { EditorState } from '@codemirror/state'

export default {
  name: 'XmlEditor',
  components: {
    Codemirror
  },
  data: () => ({ // only to allow `log(...)` in @functions in 11-14
    log: console.log
  }),
  methods: {
  },
  computed: {
    code: {
      get () {
        return this.$store.getters.xmlCode
      },
      set (val) {
        this.$store.dispatch('setXmlCode', val)
      }
    }
  },
  created () {
    const code = this.$store.getters.xmlCode // ref('console.log(\'Hello, world!\')')
    const extensions = [xml(), oneDark]

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
