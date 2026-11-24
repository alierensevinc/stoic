const {defineConfig} = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
    expoConfig,
    {
        ignores: [
            "dist/**",
            "node_modules/**",
            "ios/**",
            "android/**",
            ".expo/**",
            "picasso.pco/**",
        ],
        settings: {
            "import/resolver": {
                node: {
                    paths: ["app"],
                    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
                },
            },
        },
        rules: {
            "react/prop-types": "off",
            "import/namespace": "off",
        },
    },
]);
