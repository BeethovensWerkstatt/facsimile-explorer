<template>
  <div id="xmlContainer">
    <Codemirror
      v-model="code"
      placeholder=""
      :autofocus="true"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="extensions"
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
  data: () => {
    const extensions = [xml(), oneDark]
    return {
      extensions,
      log: console.log
    }
  },
  methods: {
  },
  computed: {
    code: {
      get () {
        return this.$store.getters.xmlCode
      },
      set (val) {
        // console.log('changing editor to ', val)
        this.$store.dispatch('setXmlByEditor', val)
      }
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
