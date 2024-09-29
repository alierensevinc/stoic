import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }

    try {
      if (Constants.easConfig?.projectId) {
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId: Constants.easConfig.projectId,
          })
        ).data;
        console.log(token);
        alert(token);
      }
    } catch (error) {
      console.error("Error getting push token:", error);
    }
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}

export async function schedulePushNotification() {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got notification! 🔔",
        body: "Here is the notification body",
        data: { data: "goes here" },
      },
      trigger: { seconds: 3600 }, // 1 hour
    });
  } catch (error) {
    console.error("Error scheduling notification:", error);
  }
}
