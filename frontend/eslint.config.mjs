import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals.map((config) => ({
    ...config,
    rules: Object.fromEntries(
      Object.entries(config.rules || {}).map(([key, val]) => {
        if (Array.isArray(val)) {
          return [key, ["off", ...val.slice(1)]];
        }
        return [key, "off"];
      })
    ),
  })),
  ...nextTs.map((config) => ({
    ...config,
    rules: Object.fromEntries(
      Object.entries(config.rules || {}).map(([key, val]) => {
        if (Array.isArray(val)) {
          return [key, ["off", ...val.slice(1)]];
        }
        return [key, "off"];
      })
    ),
  })),
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
