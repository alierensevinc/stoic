const {withAppDelegate} = require("@expo/config-plugins");
const {mergeContents} = require("@expo/config-plugins/build/utils/generateCode");

const CONFIGURE_CALL = "FirebaseApp.configure()";

/**
 * @react-native-firebase/app's own config plugin can't find an insertion
 * point in Expo SDK 57's scene-lifecycle AppDelegate.swift template (it
 * anchors on `self.moduleName = "..."`, which that template no longer has),
 * so it silently skips adding `FirebaseApp.configure()` and Firebase never
 * initializes at runtime. This plugin adds the call directly, anchored on
 * the `ReactNativeDelegate()` instantiation that the new template does have.
 * Remove this once react-native-firebase ships native scene-lifecycle support.
 */
const withFirebaseSceneFix = (config) => {
    return withAppDelegate(config, (config) => {
        if (config.modResults.language !== "swift") {
            return config;
        }

        if (config.modResults.contents.includes(CONFIGURE_CALL)) {
            return config;
        }

        const anchor = /let delegate = ReactNativeDelegate\(\)/;
        if (!anchor.test(config.modResults.contents)) {
            return config;
        }

        config.modResults.contents = mergeContents({
            tag: "stoic-firebase-scene-fix",
            src: config.modResults.contents,
            newSrc: `    ${CONFIGURE_CALL}`,
            anchor,
            offset: 0,
            comment: "//",
        }).contents;

        return config;
    });
};

module.exports = withFirebaseSceneFix;
