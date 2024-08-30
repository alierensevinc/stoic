import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";
import { useFavoriteStore } from "../store/favoriteStore";
import Ionicons from "@expo/vector-icons/Ionicons";

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const { theme } = React.useContext(ThemeContext);
  const { favorites } = useFavoriteStore();

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.quoteContainer,
        { backgroundColor: theme.backgroundColor },
      ]}
    >
      <Text style={[styles.quoteText, { color: theme.textColor }]}>
        {item.q}
      </Text>
      <Text style={[styles.authorText, { color: theme.textColor }]}>
        - {item.a}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color={theme.buttonColor} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.textColor }]}>
        Favorite Quotes
      </Text>
      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => item.q}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
  quoteContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  quoteText: {
    fontSize: 18,
    marginBottom: 10,
  },
  authorText: {
    fontSize: 14,
    textAlign: "right",
    fontStyle: "italic",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 1,
  },
});

export default FavoritesScreen;
