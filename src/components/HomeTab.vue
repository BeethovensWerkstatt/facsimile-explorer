<template>
  <div class="appTab homeTab">
    <div class="externalMessages">
      <h1>Facsimile-Explorer</h1>
      <p>
        Diese Anwendung ist in Entwicklung. Auf den unterschiedlichen Seiten werden
        die einzelnen Schritte umgesetzt, um aus der Kombination von SVG-Shapes in
        Kombination mit einer annotierten Transkription eine diplomatische zu erstellen.
      </p>
    <div class="externalMessages"><SourceSelector :table="true" /></div>
    <!--<h2>Info</h2>
      <table class="table">
        <tr><td>Repository</td><td>{{ infoRepo }}</td></tr>
        <tr><td>Branch</td><td>{{ infoBranch }}</td></tr>
        <template v-if="!apiRateLimitReached">
          <tr><td>Commit</td><td><a :href="commitUrl"><code>{{ commitSha }}</code></a>, {{ authorName }}, {{ commitDate }}, {{  commitMessage }}</td></tr>
          <tr><td>Tree</td><td><code>{{ commitTreeSha }}</code></td></tr>
        </template>
        <template v-else>
          <tr><td>GitHub API Rate Limit Reached.</td><td></td></tr>
        </template>
      </table>-->
    </div>
    <!--
    <div class="internalMessages">
      <h1>Hallo Jan-Peter :)</h1>
      <p>
        Wir haben am Mittwoch vor Ostern noch ein wenig diskutiert, wie wir am besten
        mit den Seitendarstellungen in den linken Seitenleisten umgehen sollten. Die
        Frage ist dabei immer, was wir dort eigentlich anzeigen wollen: Notirungsbuch K
        oder die heutigen Dokumente. Ich versuche, hier mal die Überlegungen im Ergebnis
        festzuhalten und zu beschreiben, was ich auf den folgenden GUI-Mockups schon
        umzusetzen versucht habe.
      </p>
      <p>
        Einerseits gibt es die Sichtweise, dass wir ja immer nur die heutigen Dokumente
        bearbeiten, und daher dort auch immer nur die heutigen Dokumente mit ihren
        entsprechenden Seitenzahlen anzeigen können. Andererseits haben wir uns im
        Arbeitsablauf ja sehr daran gewöhnt, mit der Zählung von Notirungsbuch K zu
        arbeiten. In den Daten macht das ganze relativ wenig Unterschiede: Egal, welche
        Seitenzählung bzw. Ordnung wir in den Seitenleisten anbieten, die zu schreibenden
        Daten haben fest definierte Orte – i.d.R. in den Dateien der "neuen" Dokumente.
        Wir müssten also, wenn wir die Seitenleiste nach Notirungsbuch K sortieren,
        ohnehin intern ein Mapping auf die heutigen Dokumente vornehmen, wenn wir
        die mit dem Facsimile Explorer eingegebenen Daten abspeichern wollen.
      </p>
      <p>
        Im Ergebnis wollen wir daher eine Auswahl bieten: Wenn man den Facsimile Explorer
        nutzt, kann man auf jeder Seite aussuchen, anhand welches Dokuments die Inhalte
        aufbereitet gestellt werden sollen. Notirungsbuch K ist dabei einfach eine Option
        unter mehreren. Letztlich werden die Daten dann ohnehin am passenden Ort abgelegt,
        und diese Zuordnung muss ohnehin im Hintergrund passieren. Wir können aus
        pragmatischen Gründen erstmal nur mit dem Zugang über Notirungsbuch beginnen, aber
        der Aufwand sollte nicht so dramatisch sein – das ist aber bislang nur eine
        Arbeitshypothese. Ich versuche, die Mockups auf den folgenden Seiten schonmal
        entsprechend anzupassen.
      </p>
      <p>
        Viel Soaß beim Basteln – und diese Absätze können natürlich wieder verschwinden ;-)
      </p>
    </div>
    -->
  </div>
</template>

<script>
import SourceSelector from '@/components/shared/SourceSelector.vue'
// import SystemListingEntry from '@/components/SystemListingEntry.vue'
// import config from '@/config.json'

export default {
  name: 'HomeTab',
  components: {
    SourceSelector
  },
  methods: {
  },
  computed: {
    sources () {
      return this.$store.getters.sources
    },
    infoRepo: () => {
      const config = this.$store.getters.config
      return `${config.repository.owner} / ${config.repository.repo}`
    },
    infoBranch: () => {
      const config = this.$store.getters.config
      return config.repository.branch
    },
    infoCommit () {
      return this.$store.getters.commit
    },
    apiRateLimitReached () {
      const commit = this.$store.getters.commit
      return !commit || commit.documentation_url === 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting'
    },
    authorName () {
      const commit = this.$store.getters.commit
      if (!commit) {
        return commit
      }
      return commit?.author?.name
    },
    commitMessage () {
      const commit = this.$store.getters.commit
      if (!commit) {
        return ''
      }
      return commit?.message
    },
    commitDate () {
      const commit = this.$store.getters.commit
      if (!commit) {
        return ''
      }
      return new Date(commit?.author?.date).toLocaleString()
    },
    commitUrl () {
      const commit = this.$store.getters.commit
      if (!commit) {
        return ''
      }
      return commit?.html_url
    },
    commitSha () {
      const commit = this.$store.getters.commit
      if (!commit) {
        return ''
      }
      return commit?.sha
    },
    commitTreeSha () {
      const commit = this.$store.getters.commit
      if (!commit) {
        return ''
      }
      return commit?.tree?.sha
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.appTab {
  background: linear-gradient(to bottom, lighten($mainBackgroundColor, 10%), darken($mainBackgroundColor, 2%));
  height: calc(100vh - $totalHeaderHeight);
}

.externalMessages {
  padding: 1rem;
}

.internalMessages {
  padding: 1rem;
  font-style: italic;
  h1 {
    font-size: 1.1rem;
    font-weight: 700;
  }
}

</style>
