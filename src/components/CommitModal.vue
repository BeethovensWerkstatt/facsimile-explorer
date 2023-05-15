<template>

  <div class="modal" :class="{ active }" id="commit-gh-modal">
    <a href="#close" @click="closeModal()" class="modal-overlay" aria-label="Close"></a>
    <div class="modal-container">
      <div class="modal-header">
        <a href="#close" @click="closeModal()" class="btn btn-clear float-right" aria-label="Close"></a>
        <div class="modal-title h5">Commit Changes to GitHub</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <label>Changed Files</label>
          <div class="filesBox">
            <div class="changedFile" v-for="(changedFile, i) in changedFiles" :key="i">{{changedFile}}</div>
          </div>

          <label>Commit Message</label>
          <textarea placeholder="commit message" class="commitMessage" v-model="message"></textarea>

          <!-- TODO: Natürlich muss die Bedingung hier andersrum lauten… -->
          <div class="branchWarning" v-if="!changesNeedBranching">
            <label>Warning</label>
            <div>This Commit may have conflicts with other recent changes on GitHub.
              When you commit, Facsimile Explorer will generate a new branch on
              GitHub, and will also create a Pull Request (PR). It is necessary to merge
              that PR to get your changes into the dataset. It is not possible to resolve
              this within Facsimile Explorer. Please commit now, and then get in touch
              with your technical support soon, to avoid any additional and potentially
              conflicting changes of the data you modified.</div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <div class="btn-group">
          <button class="btn" @click="closeModal()">Cancel</button>
          <button class="btn btn-primary" @click="main()">Commit</button>
        </div>
      </div>
    </div>
  </div>

</template>

<script>

import { mapGetters } from 'vuex'
// import store from '@/store'

export default {
  name: 'CommitModal',
  /* data: () => ({
    message: `update "${store.getters.filepath}" ...`
  }), */
  components: {
  },
  methods: {
    closeModal () {
      this.$store.dispatch('setModal', null)
    },
    main () {
      // const message = this.message
      // const callback = this.closeModal
      // this.$store.dispatch('saveContent', { message, callback })
      this.$store.dispatch('prepareGitCommit')
      this.$store.dispatch('setModal', null)
    }
  },
  computed: {
    active () {
      return this.$store.getters.modal === 'commitmei'
    },
    message: {
      get () {
        const proposedMessage = this.$store.getters.proposedCommitMessage
        const realMessage = this.$store.getters.commitMessage

        return realMessage !== null ? realMessage : proposedMessage
      },
      set (val) {
        // console.log('changing editor to ', val)
        this.$store.dispatch('setCommitMessage', val)
      }
    },
    ...mapGetters(['changedFiles', 'changesNeedBranching'])
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.modal-container {
  max-width: 900px;
}

.commitMessage {
  width: 100%;
}

.filesBox {
  background-color: #e5e5e5;
  border-radius: 5px;
  margin: 0 0 .8rem;
  .changedFile {
    font-family: monospace;
    font-size: 0.6rem;
    padding: .1rem .3rem;
    margin: .1rem;
  }
}

.branchWarning {
  margin-top: .8rem;
}

</style>
