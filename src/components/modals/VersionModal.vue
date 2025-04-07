<template>
  <div class="modal" :class="{ active }" id="version-modal">
    <a href="#close" @click="closeModal()" class="modal-overlay" aria-label="Close"></a>
    <div class="modal-container">
      <div class="modal-header">
        <a href="#close" @click="closeModal()" class="btn btn-clear float-right" aria-label="Close"></a>
        <div class="modal-title h5">Facsimile Explorer Version</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <table>
            <tr class="subject">
              <th>Subject</th>
              <td>{{ version.subject }}</td>
            </tr>
            <tr class="date">
              <th>Date</th>
              <td>{{ date }}</td>
            </tr>
            <tr>
              <th class="author">Author</th>
              <td>{{ version.author }}</td>
            </tr>
            <tr class="branch">
              <th>Branch</th>
              <td>{{ version.branch }}</td>
            </tr>
            <tr class="commit">
              <th>Commit</th>
              <td><a :href="commiturl" target="_blank" v-if="version.commit">{{ version.commit }}</a><template v-else>N/A</template></td>
            </tr>
          </table>
          <hr />
          <h5>Data Version</h5>
          <table>
            <tr class="subject">
              <td>Message</td>
              <td><a :href="commit?.html_url" target="_blank">{{ commit?.message || 'N/A' }} {{ commit?.sha }}</a></td>
            </tr>
            <tr>
              <th class="author">Author</th>
              <td>{{ commit?.author?.name || 'N/A' }}</td>
            </tr>
            <tr class="date">
              <th>Date</th>
              <td>{{ datadate }}</td>
            </tr>
            <tr class="branch">
              <th>Branch</th>
              <td>{{ config?.repository?.owner || '?' }} / {{ config?.repository?.repo || '?' }} / {{ config?.repository?.branch || '?' }}</td>
            </tr>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <div class="btn-group">
          <button class="btn btn-primary" @click="closeModal()">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { version } from '@/config'
import { mapGetters } from 'vuex'

export default {
  name: 'VersionModal',
  computed: {
    ...mapGetters(['commit', 'config']),
    active () {
      return this.$store.getters.modal === 'version'
    },
    date () {
      if (this.version.date) {
        const d = new Date(this.version.date)
        return d.toLocaleString()
      }
      return 'N/A'
    },
    commiturl () {
      return 'https://github.com/BeethovensWerkstatt/facsimile-explorer/commits/' + this.version.commit
    },
    datadate () {
      if (this.commit?.author?.date) {
        return new Date(this.commit.author.date).toLocaleString()
      }
      return 'N/A'
    }
  },
  data: () => ({
    version: {}
  }),
  mounted () {
    version.then(vrs => {
      this.version = vrs
    })
  },
  methods: {
    closeModal () {
      this.$store.dispatch('setModal', null)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

tr.subject {
  td {
    font-weight: bold;
  }
}
</style>
