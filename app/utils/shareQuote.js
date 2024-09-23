import * as Sharing from "expo-sharing";

export async function shareQuote(uri) {
  try {
    await Sharing.shareAsync("file://" + uri, {
      mimeType: "image/jpeg",
      dialogTitle: "Share this quote",
      UTI: "public.jpeg",
    });
  } catch (error) {
    console.error("Error sharing quote:", error);
  }
}
