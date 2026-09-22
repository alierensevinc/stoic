module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
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
