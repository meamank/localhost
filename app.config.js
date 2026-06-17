const IS_DEV = process.env.APP_VARIANT === "development";

export default ({ config }) => {
  return {
    ...config,
    name: IS_DEV ? "LocalHost (Dev)" : config.name,
    slug: "localhost",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/icon.png",
    scheme: "localhost",
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet: true,
      bundleIdentifier: IS_DEV
        ? "com.sherlock18.nirvah.dev"
        : config.ios?.bundleIdentifier || "com.sherlock18.nirvah",
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./src/assets/images/android-icon-foreground.png",
        backgroundImage: "./src/assets/images/android-icon-background.png",
        monochromeImage: "./src/assets/images/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
      package: IS_DEV ? "com.sherlock18.nirvah.dev" : config.android?.package,
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
    ],
    experiments: {
      typedRoutes: true,
    },
  };
};
