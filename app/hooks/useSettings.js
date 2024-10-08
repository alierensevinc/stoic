import { useContext } from "react";
import { ThemeContext } from "context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { useBookmarksStore } from "store/bookmarksStore";

export const useSettings = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const removeAllBookmarks = useBookmarksStore(
    (state) => state.removeAllBookmarks
  );

  return {
    theme,
    navigation,
    removeAllBookmarks,
  };
};
