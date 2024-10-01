module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-reanimated/plugin",
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
    ],
  };
};
