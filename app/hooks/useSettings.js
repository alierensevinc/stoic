import { useState, useContext, useEffect } from "react";
import { ThemeContext } from "context/ThemeContext";
import { useQuoteStore } from "store/quoteStore";
import { useNavigation } from "@react-navigation/native";

export const useSettings = () => {
  const { theme } = useContext(ThemeContext);
  const { fetchQuotes, loadQuotesFromArchive } = useQuoteStore();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const refreshQuotes = async () => {
    setIsLoading(true);
    try {
      await fetchQuotes();
    } catch (error) {
      console.error("Error refreshing quotes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadArchivedQuotes = () => {
    loadQuotesFromArchive();
  };

  const navigateToHome = () => {
    navigation.navigate("Home");
  };

  return {
    theme,
    isLoading,
    refreshQuotes,
    loadArchivedQuotes,
    navigateToHome,
  };
};
