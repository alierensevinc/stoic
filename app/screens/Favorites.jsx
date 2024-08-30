import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";
import { useFavoriteStore } from "../store/favoriteStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SwipeListView } from "react-native-swipe-list-view";

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const { theme } = React.useContext(ThemeContext);
  const { favorites, removeFavorite } = useFavoriteStore();

  const shareQuote = async (item) => {
    try {
      await Share.share({
        message: `"${item.q}" - ${item.a}`,
      });
    } catch (error) {
      console.error("Error sharing quote:", error);
      Alert.alert("Error", "Unable to share the quote. Please try again.");
    }
  };

  const confirmDelete = (item) => {
    Alert.alert(
      "Delete Quote",
      "Are you sure you want to remove this quote from favorites?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeFavorite(item),
        },
      ]
    );
  };

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

  const renderHiddenItem = ({ item }) => (
    <View style={[styles.rowBack, { backgroundColor: theme.backgroundColor }]}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnShare]}
        onPress={() => shareQuote(item)}
      >
        <Ionicons name="share-outline" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnDelete]}
        onPress={() => confirmDelete(item)}
      >
        <Ionicons name="trash-outline" size={24} color="white" />
      </TouchableOpacity>
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
      {favorites.length > 0 ? (
        <SwipeListView
          data={favorites}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-150}
          disableRightSwipe
          keyExtractor={(item) => item.q}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={[styles.emptyText, { color: theme.textColor }]}>
          No favorite quotes yet. Add some from the home screen!
        </Text>
      )}
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
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  rowBack: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
  },
  backRightBtn: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: 75,
  },
  backRightBtnShare: {
    right: 75,
  },
  backRightBtnDelete: {
    right: 0,
  },
});

export default FavoritesScreen;
