import { defineConfig } from "tsup";
import { esbuildPluginVersionInjector } from "esbuild-plugin-version-injector";

export default defineConfig({
    dts: true,
    clean: true,
    entry: ["src/*.ts"],
    format: ["esm", "cjs"],
    outDir: "./dist",
    minify: false,
    skipNodeModulesBundle: true,
    sourcemap: true,
    target: "esnext",
    keepNames: true,
    splitting: false,
    shims: false,
    esbuildPlugins: [esbuildPluginVersionInjector()],
});
