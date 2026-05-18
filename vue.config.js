const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [

    ],
    resolve: {
      alias: {
        jsdom: false
      },
      // configuration options
      fallback: {
        path: false, // require.resolve('path-browserify')
        fs: false,
        util: false,
        child_process: false,
        http: false,
        https: false,
        url: false,
        vm: false,
        os: false,
        stream: false,
        zlib: false,
        crypto: false,
        assert: false,
        net: false,
        tls: false,
        constants: false
      }
    }
  }
})
