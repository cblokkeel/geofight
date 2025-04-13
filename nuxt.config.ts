// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },

	modules: ["@nuxt/ui", "@pinia/nuxt"],

	css: ["~/assets/css/main.css"],

	future: {
		compatibilityVersion: 4,
	},

	compatibilityDate: "2024-11-27",

    devServer: {
        port: Number(process.env.PORT) || 3000,
    },

    runtimeConfig: {
        MONGODB_URI: process.env.MONGODB_URI,
    },
});
