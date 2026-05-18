module.exports = function (api) {
  api.cache(() => process.env.NODE_ENV);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: { "@": "./src" },
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        },
      ],
      "react-native-worklets/plugin",
    ],
  };
};
