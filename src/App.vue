<template>
  <AppHeader/>
  <splitpanes class="mainSplitter default-theme">
    <pane size="70" min-size="40" @scroll="doScroll">
      <OpenSeadragonComponent/>
    </pane>
    <pane>
      <splitpanes horizontal @scroll="doScroll">
        <pane size="60" min-size="40" max-size="90">
          <ExplorerForm/>
        </pane>
        <pane @scroll="doScroll">
          <XmlEditor/>
        </pane>
      </splitpanes>
    </pane>
  </splitpanes>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'
import OpenSeadragonComponent from '@/components/OpenSeadragonComponent.vue'
import ExplorerForm from '@/components/ExplorerForm.vue'
import XmlEditor from '@/components/XmlEditor.vue'

import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

export default {
  name: 'App',
  components: {
    AppHeader,
    ExplorerForm,
    OpenSeadragonComponent,
    XmlEditor,
    Splitpanes,
    Pane
  },
  methods: {
    doScroll (e) {
      console.log(e)
    }
  }
}
</script>

<style lang="scss">
@import '@/css/_variables.scss';

#app {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.mainSplitter {
  height: calc(100% - $appHeaderHeight);
  background-color: $mainBackgroundColor;
}

</style>
