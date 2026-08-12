const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// pnpm hoists packages as symlinks; Metro needs to follow them and
// know to look in the project-root node_modules for resolution.
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
];

config.watchFolders = [
  path.resolve(__dirname, "node_modules"),
];

// @supabase/supabase-js@2.106+ ships an ESM build (index.mjs) that contains
// `import(OTEL_PKG)` — a dynamic import with a variable — which Hermes cannot
// compile. Force Metro to use the CJS build (index.cjs) which uses require()
// instead and is safe for Hermes.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "@supabase/supabase-js") {
    return {
      type: "sourceFile",
      filePath: path.resolve(__dirname, "node_modules/@supabase/supabase-js/dist/index.cjs"),
    };
  }
  return originalResolveRequest
    ? originalResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
