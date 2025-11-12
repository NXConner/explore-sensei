import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.asphaltos.app",
  appName: "Asphalt OS",
  webDir: "dist",
  server: {
    url: "https://85d40e13-6694-4afc-9e47-167e8bd1ac0b.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    },
    // Android-specific optimizations
    minVersion: 22, // Android 5.1 (Lollipop)
    targetVersion: 34, // Android 14
    captureInput: true,
    webContentsDebuggingEnabled: false, // Disable in production
    // Performance optimizations
    backgroundColor: "#000000",
    // Splash screen configuration
    splashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      spinnerColor: "#FF8C00",
    },
    // Permissions
    permissions: [
      "ACCESS_NETWORK_STATE",
      "ACCESS_WIFI_STATE",
      "INTERNET",
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "ACCESS_BACKGROUND_LOCATION",
      "VIBRATE",
      "WAKE_LOCK",
    ],
  },
  ios: {
    // iOS optimizations (if needed in future)
    scheme: "asphaltos",
    contentInset: "automatic",
    scrollEnabled: true,
    backgroundColor: "#000000",
    preferredContentMode: "mobile",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      spinnerColor: "#FF8C00",
    },
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#000000",
    },
    App: {
      // Background mode configuration
      keepAliveEnabled: true,
    },
  },
};

export default config;
