<template>
  <div id="explorer">
    <OpenSeadragonNavigator/>
    * Hier oder andernorts: Erzeugen MEI-Datei aus IIIF Manifest <br/>
    * Importieren des SVG für aktuelle Seite <br/>
    * "Formular" für einzelne Zeichen <br/>
    * annotorious-Plugin, um Rechtecke z.B. für Systeme zu erzeugen <br/>
    * Anbindung XML-Editor <br/>
    * <em>entweder</em>: Anbindung Git, <em>oder</em>: Up- und Download<br/>
  </div>
</template>

<script>
import OpenSeadragonNavigator from '@/components/OpenSeadragonNavigator.vue'

export default {
  name: 'ExplorerForm',
  components: {
    OpenSeadragonNavigator
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#explorer {

}
</style>
