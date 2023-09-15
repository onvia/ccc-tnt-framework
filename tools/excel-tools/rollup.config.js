

let path = require("path");
const commonjs = require('@rollup/plugin-commonjs')
const typescript = require('rollup-plugin-typescript2')
let json = require("@rollup/plugin-json").default;


const override = { compilerOptions: { module: 'ESNext' } }
module.exports = {
    input: "./src/index.ts",

    output: {
        file: path.resolve(__dirname, "./dist/index.js"),
        sourcemap: false,
        format: "umd",
    },

    plugins: [
        typescript({ tsconfig: './tsconfig.json', tsconfigOverride: override }),
        json(),
        commonjs(),
    ]
}
