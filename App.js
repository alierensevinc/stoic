import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MMKV } from "react-native-mmkv";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import moment from "moment";
import { create } from "zustand";

const useStore = create((set) => ({
  quotes: [],
  setQuotes: (newQuotes) => set({ quotes: newQuotes }),
}));

export default function App() {
  const { quotes, setQuotes } = useStore();
  const storage = new MMKV();

  // Function to get and save new quotes
  const getQuotes = async () => {
    try {
      const response = await axios.get("https://zenquotes.io/api/quotes/");
      const quotes = response.data;
      const quotesObject = {
        date: moment().format("YYYY-MM-DD"),
        quotes,
      };
      storage.set("quotes", JSON.stringify(quotesObject));
      setQuotes(quotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
    }
  };

  useEffect(() => {
    const quotesString = storage.getString("quotes");
    if (quotesString) {
      const quotesObject = JSON.parse(quotesString);
      if (quotesObject.date !== moment().format("YYYY-MM-DD")) {
        getQuotes();
      } else {
        setQuotes(quotesObject.quotes);
      }
    } else {
      getQuotes();
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text>{quotes.length > 0 ? quotes[0].q : "Loading..."}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "##eeeedd",
    alignItems: "center",
    justifyContent: "center",
  },
});
