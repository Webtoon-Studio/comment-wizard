import { resolve } from "path";
import CopyPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugion from "mini-css-extract-plugin";
import { Configuration } from "webpack";
import pjson from "./package.json";
import { TbFlagSearch } from "react-icons/tb";

// content, absoluteFrom
const transform = (content: Buffer, _: string) => {
  var manifest = JSON.parse(content.toString());
  manifest.version = pjson.version; // version control from one source
  var transformed = JSON.stringify(manifest, null, 2);
  return transformed;
};

const config = function (env: any, argv: any): Configuration {
  return {
    mode: argv.mode ?? "development",
    context: resolve(__dirname, "src"),
    entry: {
      worker: "./worker.js",
      webtoon: "./webtoon.js",
      content: "./content.js",
      incom: "./incom/index.tsx",
    },
    module: {
      rules: [
        {
          test: /incom\\.+\.tsx?$/,
          exclude: [/node_modules/],
          use: [
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: /\.jsx?$/,
          exclude: [/node_modules/],
          use: ["babel-loader"],
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugion.loader, "css-loader", "postcss-loader"],
        },
      ],
    },
    resolve: {
      alias: {
        "@assets": resolve(__dirname, "src/assets"),
        "@incom": resolve(__dirname, "src/incom"),
        "@root": resolve(__dirname),
      },
      extensions: [".js", ".jsx", ".ts", ".tsx"],
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
            from: "manifest.json",
            to: "manifest.json",
            transform,
          },
          {
            from: "assets/*",
            to: "[path][name][ext]",
            globOptions: {
              gitignore: true,
              ignore: ["**/*.(js|css)"],
            },
          },
        ],
      }),
    ],
  };
};

export default config;
