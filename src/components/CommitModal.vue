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

          <template v-if="!completed">
            <label>Commit Message</label>
            <textarea placeholder="commit message" class="commitMessage" v-model="message" :disabled="committing"></textarea>
            <p>Please adjust the above Commit Message if necessary.</p>
          </template>

          <div class="statusMessage" v-if="committing">
            <h1>Sending Commit ...</h1>
            <div class="loading loading-lg"></div>
          </div>

          <div class="statusMessage success" v-if="commitSuccess">
            <h1>Changes successfully committed.</h1>
            <p>Your changes have been successfully committed. You may close this modal
            and continue your work.</p>
          </div>

          <div class="statusMessage merged" v-if="commitMerged">
            <h1>Changes successfully merged.</h1>
            <p>While there have been other changes to the data while you worked, it was possible
            to store you're changes. However, it is recommended to reload the app in order to
            fetch the changes from other users.</p>
          </div>

          <div class="statusMessage conflicts" v-if="commitConflicts">
            <h1>Conflicts</h1>
            <p>As you worked, user <b>{{ conflictingUser }}</b> has committed other changes to the
            data. It was not possible to integrate your changes into the latest state available
            on GitHub. However, we have uploaded your changes to GitHub and created a Pull Request
            for you. If you navigate to
            <b><a :href="prUrl" target="_blank" rel="nofollow noreferrer">{{prUrl}}</a></b>, you
            may resolve those conflicts manually, and then merge the Pull Request. Please delete
            the branch afterwards. We apologize for the inconvenience. If you need assistance,
            please contact your friendly support. Many thanks!</p>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <div class="btn-group">
          <button class="btn" @click="closeModal()" :disabled="committing">Cancel</button>
          <button class="btn btn-primary" @click="main()" :disabled="committing">{{ completed ? 'Close' : 'Commit' }}</button>
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
      this.$store.dispatch('resetCommitResults')
    },
    main () {
      if (this.completed) {
        this.closeModal()
      } else {
        this.$store.dispatch('prepareGitCommit')
      }
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
    ...mapGetters(['changedFiles', 'changesNeedBranching', 'commit', 'committing']),
    commitSuccess () {
      return this.$store.getters.commitResults.status === 'success'
    },
    commitMerged () {
      return this.$store.getters.commitResults.status === 'merged'
    },
    commitConflicts () {
      return this.$store.getters.commitResults.status === 'conflicts'
    },
    completed () {
      return this.$store.getters.commitResults.status !== 'uncommitted'
    },
    status () {
      return this.$store.getters.commitResults.status
    },
    conflictingUser () {
      return this.$store.getters.commitResults.conflictingUser
    },
    prUrl () {
      return this.$store.getters.commitResults.prUrl
    }
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

.statusMessage {
  margin: .8rem 0;
  h1 {
    font-size: .9rem;
  }
}

</style>
