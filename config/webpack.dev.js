const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  // devtool: "inline-source-map",
  devServer: {
    liveReload: true,
    writeToDisk: true,
    host: "0.0.0.0",
    https: true,
    inline: false,
  },
  plugins: [new CleanWebpackPlugin()],
};
