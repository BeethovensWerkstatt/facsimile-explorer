<template>
  <AppHeader/>
  <splitpanes class="mainSplitter default-theme">
    <pane size="70" min-size="40">
      <OpenSeadragonComponent/>
    </pane>
    <pane>
      <splitpanes horizontal>
        <pane size="60" min-size="40" max-size="90">
          <ExplorerForm/>
        </pane>
        <pane>
          Ich bin das XML…
        </pane>
      </splitpanes>
    </pane>
  </splitpanes>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'
import OpenSeadragonComponent from '@/components/OpenSeadragonComponent.vue'
import ExplorerForm from '@/components/ExplorerForm.vue'

import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

export default {
  name: 'App',
  components: {
    AppHeader,
    ExplorerForm,
    OpenSeadragonComponent,
    Splitpanes,
    Pane
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
