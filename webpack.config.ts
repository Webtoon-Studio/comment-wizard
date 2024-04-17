import { resolve } from "path";
import CopyPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugion from "mini-css-extract-plugin";
import webpack from "webpack";
import pjson from "./package.json";

const transform = (content: Buffer, absoluteFrom: string) => {
  var manifest = JSON.parse(content.toString());
  manifest.version = pjson.version; // version control from one source
  var transformed = JSON.stringify(manifest, null, 2);
  return transformed;
};

const config: webpack.Configuration = {
  entry: {
    worker: "./src/worker.js",
    webtoon: "./src/webtoon.js",
    content: "./src/content.js",
    inject: "./src/inject.js",
  },
  module: {
    rules: [
      {
        test: /(inject|content)\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /inject\.css$/,
        use: [MiniCssExtractPlugion.loader, "css-loader", "postcss-loader"],
      },
    ],
  },
  resolve: {
    extensions: ["*", ".js", ".jsx"],
  },
  output: {
    filename: "[name].js",
    path: resolve(__dirname, "dist"),
    // clean: true
  },
  devtool: false,
  cache: true,
  plugins: [
    new MiniCssExtractPlugion({
      filename: "./assets/[name].css",
      // chunkFilename: "./assets/inject.css"
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "src/manifest.json",
          to: "manifest.json",
          transform,
        },
        {
          from: "assets/*",
          to: "[path][name][ext]",
          context: "src",
          globOptions: {
            gitignore: true,
            ignore: ["**/*.(js|css)"],
          },
        },
      ],
    }),
  ],
};

export default config;
