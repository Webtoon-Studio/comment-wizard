import { resolve } from "path";
import CopyPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugion from "mini-css-extract-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import pjson from "./package.json" assert {type: "json"};
import webpack from 'webpack';

const __dirname = resolve(import.meta.dirname);

const htmlPlugins = (_mode) => {
  const plugins = [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, "src/template.html"),
      filename: "popup/index.html",
      scriptLoading: "module",
      inject: "body",
      chunks: ["popup/index"],
    }),
    new HtmlWebpackPlugin({
      template: resolve(__dirname, "src/template.html"),
      filename: "incom/index.html",
      scriptLoading: "module",
      inject: "body",
      chunks: ["incom/index"],
    })
  ]
  return plugins;
}

const transform = (content, absoluteFrom) => {
  var manifest = JSON.parse(content.toString());
  manifest.version = pjson.version; // version control from one source
  var transformed = JSON.stringify(manifest, null, 2);
  return transformed;
};

const config = function (env, argv) {
  const mode = argv.mode ?? "development";
  return {
    mode,
    target: "web",
    entry: {
      worker: "./src/scripts/worker.ts",
      content: "./src/scripts/content.ts",
      "incom/index": "./src/features/incom/index.tsx",
      "popup/index": "./src/features/popup/index.tsx",
    },
    devtool: "inline-source-map",
    output: {
        filename: '[name].js',
        path: resolve(__dirname, 'build/src'),
        clean: true
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
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
          test: /\.css$/,
          exclude: /node_modules/,
          use: [MiniCssExtractPlugion.loader, "css-loader", "postcss-loader"],
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i, 
          type: 'asset/resource',
          generator: {
            filename: './imgs/[name][ext]'
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: './fonts/[name][ext]'
          }
        },
      ],
    },
    resolve: {
      alias: {
        "@root": resolve(__dirname),
        "@src": resolve(__dirname, "src"),
        "@asset": resolve(__dirname, "src/asset"),
        "@scripts": resolve(__dirname, "src/scripts"),
        "@shared": resolve(__dirname, "src/shared"),
        "@incom": resolve(__dirname, "src/features/incom"),
        "@popup": resolve(__dirname, "src/features/popup"),
      },
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    output: {
      filename: "[name].js",
      path: resolve(__dirname, "dist"),
      clean: true,
    },
    cache: true,
    plugins: [
      ...htmlPlugins(mode),
      new MiniCssExtractPlugion(),
      new CopyPlugin({
        patterns: [
          {
            from: "src/manifest.json",
            to: "manifest.json",
            transform,
          },
          {
            from: "src/asset/icon*.png",
            to: "asset/[name][ext]"
          }
        ],
      }),
      new webpack.DefinePlugin(mode==='development' ? {
        "import.meta.env.PROD": false,
        "import.meta.env.DEV": true
      } : {
        "import.meta.env.PROD": true,
        "import.meta.env.DEV": false
      })
    ],
  };
};

export default config;