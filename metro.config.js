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

// Supabase pulls in @opentelemetry packages that use dynamic import()
// expressions incompatible with Hermes. Return empty modules for all of them.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("@opentelemetry/")) {
    return { type: "empty" };
  }
  return originalResolveRequest
    ? originalResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
