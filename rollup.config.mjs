import { babel } from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "component.js",
  output: {
    file: "compiled.js",
    format: "iife",
  },
  plugins: [
    resolve({
      browser: true,
      dedupe: ["atomico"],
    }),
    commonjs(),
    babel(),
  ],
};
