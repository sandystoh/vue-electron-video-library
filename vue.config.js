module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  pluginOptions: {
    electronBuilder: {
      chainWebpackMainProcess: (config) => {
        config.plugin('define').tap(args => {
          args[0]['process.env.FLUENTFFMPEG_COV'] = false;
          return args;
        });
      },
      chainWebpackRendererProcess: config => {
        config.plugin('define').tap(args => {
          args[0]['process.env.FLUENTFFMPEG_COV'] = false;
          return args;
        });
      },
      nodeIntegration: true
    }
  }
}