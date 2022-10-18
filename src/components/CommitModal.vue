<template>

  <div class="modal" :class="{ active }" id="commit-gh-modal">
    <a href="#close" @click="closeModal()" class="modal-overlay" aria-label="Close"></a>
    <div class="modal-container">
      <div class="modal-header">
        <a href="#close" @click="closeModal()" class="btn btn-clear float-right" aria-label="Close"></a>
        <div class="modal-title h5">Commit {{ filepath }}</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <textarea placeholder="commit message" class="commit-message" v-model="message"></textarea>
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
import store from '@/store'

export default {
  name: 'CommitModal',
  data: () => ({
    message: `update "${store.getters.filepath}" ...`
  }),
  components: {
  },
  methods: {
    closeModal () {
      this.$store.dispatch('setModal', null)
    },
    main () {
      const message = this.message
      const callback = this.closeModal
      this.$store.dispatch('saveContent', { message, callback })
    }
  },
  computed: {
    ...mapGetters(['filepath']),
    active () {
      return this.$store.getters.modal === 'commitmei'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.commit-message {
  width: 100%;
}

</style>
