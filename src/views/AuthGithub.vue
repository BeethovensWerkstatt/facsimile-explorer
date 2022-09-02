<template>
  <div>
    <code>{{ code }}</code>
    <!-- <pre><code>{{ JSON.stringify( user ) }}</code></pre> -->
  </div>
</template>

<script>

// import { Octokit } from '@octokit/rest'

export default {
  name: 'AuthGithub',
  data: () => ({
    code: '',
    user: {}
  }),
  mounted () {
    this.code = this.$route.query.code
    this.$store.dispatch('authenticate', this.code)
    this.$router.push('/')
  }
}
</script>
