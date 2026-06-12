module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "react-native-worklets/plugin",
        {
          bundleMode: true,
          // other options...
          workletizableModules: ["remend"], // add this line
        },
      ],
    ],
  };
};
