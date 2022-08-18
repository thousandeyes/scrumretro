// Copyright 2022 Cisco Systems, Inc. and its affiliates
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const path = require("path");

const ROOT_PATH = path.resolve(__dirname, "..");

module.exports = {
  context: ROOT_PATH,
  mode: "production",
  devtool: "source-map",
  target: "node",
  entry: "./src/handler.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"],
    modules: ["node_modules", path.resolve(ROOT_PATH, "src")]
  },
  externals: {
    "nuxt-start": "commonjs2 nuxt-start"
  },
  output: {
    filename: "handler.js",
    path: path.resolve(ROOT_PATH, "dist"),
    library: "handler",
    libraryTarget: "commonjs2"
  },
  optimization: {
    minimize: false
  }
};
