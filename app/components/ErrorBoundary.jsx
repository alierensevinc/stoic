import React from "react";
import {Pressable, Text, View} from "react-native";
import {recordCrashlyticsError} from "utils/telemetry";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError() {
        return {hasError: true};
    }

    componentDidCatch(error, info) {
        recordCrashlyticsError(error, info?.componentStack || "ErrorBoundary");
    }

    handleRetry = () => {
        this.setState({hasError: false});
    };

    render() {
        if (this.state.hasError) {
            return (
                <View
                    className="flex-1 items-center justify-center p-8"
                    style={{backgroundColor: "#151b24"}}
                >
                    <Text
                        className="text-xl text-center mb-3"
                        style={{color: "#f4f6fc", fontFamily: "Montserrat-Medium"}}
                    >
                        Something disturbed the tranquility
                    </Text>
                    <Text
                        className="text-sm text-center mb-6"
                        style={{color: "#c3c5ca", fontFamily: "Montserrat-Regular"}}
                    >
                        &ldquo;You have power over your mind — not outside events.&rdquo;
                    </Text>
                    <Pressable
                        onPress={this.handleRetry}
                        accessibilityRole="button"
                        accessibilityLabel="Try again"
                        className="px-6 py-3 rounded-full"
                        style={{backgroundColor: "#f4f6fc"}}
                    >
                        <Text
                            style={{
                                color: "#151b24",
                                fontFamily: "Montserrat-Medium",
                            }}
                        >
                            Try Again
                        </Text>
                    </Pressable>
                </View>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
