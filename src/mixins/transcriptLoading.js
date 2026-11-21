/**
 * Mixin for tabs that show a writing zone with its annotated and diplomatic transcript next to the facsimile.
 * Makes sure SVG, AT and DTs of the current page are loaded, whenever the page or writing zone changes.
 */
export default {
  methods: {
    verifySvgAvailable () {
      const svgPath = this.$store.getters.currentSvgPath
      const svg = this.$store.getters.svgForCurrentPage
      if (svgPath !== null && !svg) {
        this.$store.dispatch('loadSvgFile', {
          path: svgPath
        })
      }
    },
    verifyAnnotTransLoaded () {
      const atPath = this.$store.getters.currentWzAtPath
      const at = this.$store.getters.annotatedTranscriptForCurrentWzPrepared
      if (this.$store.getters.availableAnnotatedTranscripts.indexOf(atPath) !== -1 && !at) {
        this.$store.dispatch('loadXmlFile', {
          path: atPath
        })
      }

      if (atPath && !at) {
        const atSymlinkForCurrentWz = this.$store.getters.resolvedAtSymlinkForCurrentWz
        if (atSymlinkForCurrentWz !== null) {
          const symlinkedDom = this.$store.getters.documentByPath(atSymlinkForCurrentWz)
          if (!symlinkedDom) {
            this.$store.dispatch('loadXmlFile', {
              path: atSymlinkForCurrentWz
            })
          }
        }
      }
    },
    verifyDiploTransLoaded () {
      const availableDiplomaticTranscripts = this.$store.getters.availableDiplomaticTranscripts

      if (!this.$store.getters.currentSvgPath) {
        return false
      }

      const refPath = this.$store.getters.currentSvgPath.slice(0, -4).replace('/svg/', '/diplomaticTranscripts/') + '_wz'
      availableDiplomaticTranscripts.filter((path) => path.startsWith(refPath)).forEach((path) => {
        if (!this.$store.getters.documentByPath(path)) {
          this.$store.dispatch('loadXmlFile', { path })
        }
      })
    }
  },
  created () {
    this.unwatchSvgVerification = this.$store.watch((state, getters) => getters.currentSvgPath,
      () => this.verifySvgAvailable())

    this.unwatchAnnotTransVerification = this.$store.watch((state, getters) => getters.currentWzAtPath,
      () => this.verifyAnnotTransLoaded())

    this.unwatchAtSymlinkVerification = this.$store.watch((state, getters) => getters.resolvedAtSymlinkForCurrentWz,
      () => this.verifyAnnotTransLoaded())

    this.unwatchDiploTransVerification = this.$store.watch((state, getters) => getters.diplomaticTranscriptsOnCurrentPage,
      () => this.verifyDiploTransLoaded())

    this.verifySvgAvailable()
    this.verifyAnnotTransLoaded()
    this.verifyDiploTransLoaded()
  },
  beforeUnmount () {
    this.unwatchSvgVerification()
    this.unwatchAnnotTransVerification()
    this.unwatchAtSymlinkVerification()
    this.unwatchDiploTransVerification()
  }
}
