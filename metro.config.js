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

module.exports = config;
