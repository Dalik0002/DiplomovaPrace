// file: app.config.js
export default {
expo: {
name: "DrinkMakerRN",
slug: "drinkmaker-rn",
scheme: "drinkmaker",
version: "1.0.0",
orientation: "portrait",
icon: "./assets/icon.png",
userInterfaceStyle: "automatic",
// Splash BEZ obrázku, ať to nespadne, dokud nepřidáš soubor
splash: { resizeMode: "contain", backgroundColor: "#28092b" },
assetBundlePatterns: ["**/*"],
ios: { supportsTablet: true },
android: { adaptiveIcon: { foregroundImage: "./assets/adaptive-icon.png", backgroundColor: "#ffffff" } },
web: { bundler: "webpack", favicon: "./assets/favicon.png" },
extra: {
// nastav si IP RPi:
apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.111:8000",
},
},
};