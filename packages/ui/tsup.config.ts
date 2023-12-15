import {defineConfig} from 'tsup'

export default defineConfig({
    entry: ["src/index.tsx"],
    outDir: 'dist',
    dts: true,
    clean: true
})