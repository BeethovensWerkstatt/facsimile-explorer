<template>
  <div class="modal modal-lg" :class="{ active }" id="version-modal">
    <a href="#close" @click="closeModal()" class="modal-overlay" aria-label="Close"></a>
    <div class="modal-container">
      <div class="modal-header">
        <a href="#close" @click="closeModal()" class="btn btn-clear float-right" aria-label="Close"></a>
        <div class="modal-title h5">Facsimile Explorer Version</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <table>
            <tr>
              <th>Subject</th>
              <td>{{ version.subject }}</td>
            </tr>
            <tr>
              <th>Date</th>
              <td>{{ version.date }}</td>
            </tr>
            <tr>
              <th>Author</th>
              <td>{{ version.author }}</td>
            </tr>
            <tr>
              <th>Branch</th>
              <td>{{ version.branch }}</td>
            </tr>
            <tr>
              <th>Commit</th>
              <td>{{ version.commit }}</td>
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

export default {
  name: 'VersionModal',
  computed: {
    active () {
      return this.$store.getters.modal === 'version'
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
.pagesRow {
   border-bottom: $lightBorder;
}

.modal-body {
  img {
    width: 100%;
    max-width: 600px;
  }
}

.modal-footer {
  .preview-info {
    display: flex;
    width: 100%;
    div {
      width: 50%;
      text-align: left;

      font-size: .7rem;
      font-weight: 300;

      &.transcription {
         font-size: .9rem;
      }

      &.unavailable {
         color: #aaaaaa;
      }
    }
  }
}
</style>
