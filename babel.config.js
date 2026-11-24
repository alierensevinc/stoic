module.exports = function (api) {
    api.cache(true);

    return {
        presets: ["babel-preset-expo"],
        plugins: [
            "nativewind/babel",
            [
                "module-resolver",
                {
                    root: ["./app"],
                    alias: {
                        "@": "./app",
                        components: "./app/components",
                        context: "./app/context",
                        hooks: "./app/hooks",
                        navigation: "./app/navigation",
                        screens: "./app/screens",
                        store: "./app/store",
                        utils: "./app/utils",
                    },
                },
            ],
            // Must be last: react-native-reanimated 4 moved worklet compilation
            // into react-native-worklets.
            "react-native-worklets/plugin",
        ],
    };
};
