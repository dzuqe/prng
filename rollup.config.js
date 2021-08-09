import ts from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from "@rollup/plugin-node-resolve";
import nodePolyfills from "rollup-plugin-node-polyfills";

export default {
  input: 'index.ts',
  output: {
    file: 'ui/client.js',
    format: 'es',
  },
  plugins: [
    commonjs({
        include: [ "./index.js", "node_modules/**" ],
        ignoreGlobal: false,
        sourceMap: false,
    }),

    nodeResolve({
        options: {
            jsnext: true,
        },
        browser: true,
        preferBuiltins: false,
    }),
    nodePolyfills(),
    json(),
    ts(),
  ]
};
