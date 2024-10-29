export const bookmarkScreenInterpolator = ({current}) => {
    const progress = current.progress;

    const opacity = progress.interpolate({
        inputRange: [0, 0.5],
        outputRange: [0, 1],
    });

    const scale = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1],
    });

    return {
        cardStyle: {
            opacity,
            transform: [{scale}],
            transformOrigin: "bottom left",
        },
    };
};

export const settingsScreenInterpolator = ({current}) => {
    const progress = current.progress;

    const opacity = progress.interpolate({
        inputRange: [0, 0.5],
        outputRange: [0, 1],
    });

    const scale = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1],
    });

    return {
        cardStyle: {
            opacity,
            transform: [{scale}],
            transformOrigin: "top left",
        },
    };
};