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
  },
};

export default config;
