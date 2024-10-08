import { useContext } from "react";
import { ThemeContext } from "context/ThemeContext";
import { useNavigation } from "@react-navigation/native";

export const useSettings = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  return {
    theme,
    navigation,
  };
};
