// @ts-check
/** @type {import("prettier").Config & import('prettier-plugin-tailwindcss').PluginOptions}} */
export default {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/App.css",
  tailwindFunctions: ["cva", "cn"],
};
