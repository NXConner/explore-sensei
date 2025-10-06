# Capacitor Android Build Instructions

This project is now configured to build as an Android app using Capacitor.

## Prerequisites

1. **Node.js and npm** - Already installed
2. **Android Studio** - Download from https://developer.android.com/studio
3. **Java JDK 17** - Required for Android builds

## Initial Setup (One-time)

### 1. Install Capacitor CLI globally (optional but recommended)
```bash
npm install -g @capacitor/cli
```

### 2. Sync the project
After transferring to your GitHub repo and pulling locally:
```bash
npm install
npx cap sync android
```

This will:
- Create the `android/` folder with native Android project
- Copy your web assets to Android
- Update native dependencies

## Building the Android App

### Option 1: Android Studio (Recommended for first build)

1. Open Android Studio
2. Click "Open an existing project"
3. Navigate to the `android/` folder in your project
4. Wait for Gradle sync to complete
5. Click the green play button or use `Build > Build Bundle(s) / APK(s) > Build APK(s)`
6. Find your APK in `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Command Line

```bash
# Build the web app
npm run build

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

Or build directly:
```bash
cd android
./gradlew assembleDebug
```

APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

## Development Workflow

### 1. Live Reload (Hot reload from sandbox)
The app is configured to load from:
```
https://85d40e13-6694-4afc-9e47-167e8bd1ac0b.lovableproject.com
```

This means:
- Changes you make in Lovable appear instantly on the Android app
- No need to rebuild for every change
- Perfect for rapid development

### 2. Building for Production

When ready to deploy:

1. Update `capacitor.config.ts` and remove the `server` section:
```typescript
const config: CapacitorConfig = {
  appId: 'app.lovable.85d40e1366944afc9e47167e8bd1ac0b',
  appName: 'Asphalt OS',
  webDir: 'dist',
  // Remove server section for production
};
```

2. Build and sync:
```bash
npm run build
npx cap sync android
npx cap open android
```

3. In Android Studio:
   - Build > Generate Signed Bundle / APK
   - Follow the signing wizard

## Troubleshooting

### "SDK location not found"
Create `android/local.properties`:
```
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk  # macOS
# or
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk  # Windows
```

### Gradle errors
Update Android Studio and install recommended SDK components.

### App crashes on start
Check Android Logcat in Android Studio for error messages.

## Configuration

The app configuration is in `capacitor.config.ts`:
- **appId**: Unique identifier for your app
- **appName**: Display name
- **webDir**: Build output directory (dist)
- **server.url**: Development server (remove for production)

## Features Enabled

- ✅ Camera access (for photo uploads)
- ✅ Geolocation (for GPS features)
- ✅ Network access
- ✅ Internet permissions

## Next Steps

1. Test on physical device or emulator
2. Add app icon and splash screen
3. Configure signing for Play Store release
4. Add native features as needed via Capacitor plugins

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio Guide](https://developer.android.com/studio/intro)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
