require("dotenv").config();
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtendedDefinePlugin = require("extended-define-webpack-plugin");

module.exports = {
  mode: "development",
  node: {
    fs: "empty",
  },
  entry: ["babel-polyfill", "./src/index.js"],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    publicPath: "/",
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    // new webpack.DefinePlugin({
    //     'process.env': {
    //         NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    //         API_HOST: JSON.stringify(process.env.API_HOST || "http://localhost:3000")
    //     }
    // }),
    new ExtendedDefinePlugin({
      __WLID__: process.env.WLID || "100",
      __INTERNAL_API_URL__:
        process.env.INTERNAL_API_URL || "http://localhost:3000",
      __AUDIENCE_API_URL__:
         process.env.AUDIENCE_API_URL || "https://qa-desk.rebid.co/audience",
      __NOTIFICATION_API_URL__:
        process.env.NOTIFICATION_API_URL || "https://dev-desk.rebid.co/notifications",
      __POSTBACK_TRACKING_URL__:
        process.env.POSTBACK_TRACKING_URL || "http://localhost:3008",
      __PUBLISHER_API_URL__:
        process.env.PUBLISHER_API_URL || "http://localhost:3002",
      __ADVERTISER_API_URL__:
        process.env.PUBLISHER_API_URL || "http://localhost:3002",
      __NOT_HAS_SUB_DOMAINS__: true,
      __DEV_MODE__: true,
      __ADMIN_DOMAIN__: "localhost",
      __TRAFF_DOMAIN__: process.env.TRAFF_DOMAIN || "localhost:3007",
      __TRAFF_DOMAIN_EU__: process.env.TRAFF_DOMAIN_EU || "need_determinate",
      __ROLLBAR_ACCESS_TOKEN__: process.env.ROLLBAR_ACCESS_TOKEN,
      __PENDO_KEY__:
        process.env.PENDO_KEY,
    }),
    new CopyWebpackPlugin([
      { from: "assets/images", to: "assets/images" },
      { from: "assets/files", to: "assets/files" },
      // {from: 'assets/fonts', to: 'assets/fonts'},
    ]),
  ],
  module: {
    rules: [
      {
        test: /\.(css|scss)/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|pdf|svg|jpg|gif)$/,
        use: ["file-loader"],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ["file-loader"],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "babel-preset-env",
              "babel-preset-react",
              "babel-preset-stage-3",
            ],
            plugins: ["babel-plugin-emotion"],
          },
        },
      },
    ],
  },
  devtool: "source-map",
  devServer: {
    hot: true,
    port: process.env.PORT || 3023,
    historyApiFallback: true,
    contentBase: path.join(__dirname, "dist"),
    headers: { "Access-Control-Allow-Origin": "*" },
  },
};
