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
