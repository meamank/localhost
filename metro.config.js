const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const {
  getBundleModeMetroConfig,
} = require("react-native-worklets/bundleMode");

let config = getDefaultConfig(__dirname);
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ["require", "import"];
config.watchFolders.push(
  require("path").resolve(
    __dirname,
    "node_modules/react-native-worklets/.worklets",
  ),
);

config = getBundleModeMetroConfig(config);

const bundleModeResolver = config.resolver.resolveRequest;
// The react-native-nano-icons npm package is missing commonjs files and its exports map is broken.
// We force Metro to resolve to the fully populated ESM module folder.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react-native-nano-icons") {
    return {
      type: "sourceFile",
      filePath: require("path").resolve(
        __dirname,
        "node_modules/react-native-nano-icons/lib/module/index.js",
      ),
    };
  }
  // Delegate everything else to the worklets bundleMode resolver if available,
  // otherwise fall back to the default Metro resolver.
  if (bundleModeResolver) {
    return bundleModeResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// your metro modifications

module.exports = withUniwindConfig(config, {
  // relative path to your global.css file (from previous step)
  cssEntryFile: "./global.css",
  // (optional) path where we gonna auto-generate typings
  // defaults to project's root
  dtsFile: "./src/uniwind-types.d.ts",
});
