import {View} from "react-native";
import {styled} from "nativewind";

const Divider = ({color}) => {
    return <View className="my-2 mx-8" style={{backgroundColor: color}}/>;
};

export default styled(Divider);
