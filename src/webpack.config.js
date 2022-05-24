// Copyright (C) 2022 Cisco Systems, Inc. and its affiliates
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
