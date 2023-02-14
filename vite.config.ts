import crossOriginIsolation from "vite-plugin-cross-origin-isolation";

export default {
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
};
