import { resolve } from "path";
import CopyPlugin from "copy-webpack-plugin";
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
  },
  output: {
    filename: "[name].js",
    path: resolve(__dirname, "dist"),
    // clean: true
  },
  devtool: false,
  cache: true,
  plugins: [
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
            ignore: ["**/*.js"],
          },
        },
      ],
    }),
  ],
};

export default config;
