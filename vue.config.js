const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [

    ],
    resolve: {
      // configuration options
      fallback: {
        path: false, // require.resolve('path-browserify')
        fs: false
      }
    }
  }
})
