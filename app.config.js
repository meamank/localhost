const { withAppBuildGradle } = require("@expo/config-plugins");

// 1. Create a custom config plugin
const withDebugApplicationIdSuffix = (config) => {
  return withAppBuildGradle(config, async (config) => {
    const buildGradle = config.modResults.contents;

    // 2. Safely inject the suffix into the debug block if it doesn't exist
    if (!buildGradle.includes('applicationIdSuffix ".dev"')) {
      config.modResults.contents = buildGradle.replace(
        /debug\s*\{/,
        'debug {\n            applicationIdSuffix ".dev"',
      );
    }

    return config;
  });
};

// const IS_DEV = process.env.APP_VARIANT === "development";

export default ({ config }) => {
  return {
    ...config,
    name: "LocalHost",
    slug: "localhost",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/icon.png",
    scheme: "localhost",
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.sherlock18.nirvah",
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./src/assets/images/android-icon-foreground.png",
        backgroundImage: "./src/assets/images/android-icon-background.png",
        monochromeImage: "./src/assets/images/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
      package: "com.sherlock18.nirvah",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./src/assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./src/assets/images/splash-icon.png",
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "react-native-nano-icons",
        {
          iconSets: [
            {
              inputDir: "./src/assets/icons",
            },
          ],
        },
      ],
      "expo-sqlite",
      "expo-asset",
      "expo-build-properties",
      withDebugApplicationIdSuffix,
    ],
    experiments: {
      typedRoutes: true,
    },
  };
};
