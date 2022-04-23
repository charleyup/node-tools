import json from 'rollup-plugin-json'
import pkg from './package.json'
const name = pkg.name
export default {
    input: './src/index.mjs',
    output: [
        {
            name: name,
            file: `dist/${name}.js`,
            format: 'cjs'
        },
        {
            name: name,
            file: `dist/${name}.mjs`,
            format: 'esm'
        }
    ],
    plugins: [
        json()
    ]
}