import {Text} from "react-native";

const EmptyState = ({text, color}) => (
    <Text className="text-base text-center mt-5" style={{color}}>
        {text}
    </Text>
);

export default EmptyState;
