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

  modules: ["@nuxt/http"],
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
