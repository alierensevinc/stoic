module.exports = function (api) {
  api.cache(true);

  // There is no plain `.env` file in this project — only .env.development,
  // .env.production and .env.test. Without this, react-native-dotenv's
  // hardcoded ".env" path would silently resolve every @env import to
  // undefined in release builds (NODE_ENV=production), which is where the
  // real AdMob unit IDs (only used when `!__DEV__`) actually matter.
  const envFile =
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : process.env.NODE_ENV === "test"
      ? ".env.test"
      : ".env.development";

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: envFile,
        },
      ],
      [
        "module-resolver",
        {
          root: ["./app"],
          alias: {
            "@": "./app",
            components: "./app/components",
            context: "./app/context",
            helpers: "./app/helpers",
            hooks: "./app/hooks",
            navigation: "./app/navigation",
            screens: "./app/screens",
            store: "./app/store",
            styles: "./app/styles",
            utils: "./app/utils",
            underscore: "lodash",
          },
        },
      ],
      // Must be last: react-native-reanimated 4 moved worklet compilation
      // into react-native-worklets (reanimated/plugin is re-exported but deprecated).
      "react-native-worklets/plugin",
    ],
  };
};
