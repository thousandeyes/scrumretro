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

const { wsApi } = require("./.settings/secrets.json");

export default {
  head: {
    title: "lol scrum retro",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "wow such serverless"
      }
    ]
  },

  srcDir: "client/",

  modules: ["@nuxt/http", "@nuxtjs/toast"],
  buildModules: ["@nuxt/typescript-build"],

  render: {
    compressor: false
  },

  css: ["~/assets/style.css"],

  publicRuntimeConfig: {
    stage: process.env.LAMBDA_ENV || "dev",
    websocketUrl: wsApi[process.env.LAMBDA_ENV || "dev"]
  }
};
