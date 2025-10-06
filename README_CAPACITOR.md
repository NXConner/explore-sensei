# Capacitor Mobile App Setup - Asphalt OS

This project is configured to run as a native Android mobile app using Capacitor.

## Building Android APK

### Prerequisites
- Node.js and npm installed
- Android Studio installed
- Java JDK 17 or higher

### Step-by-Step Build Process

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Web Assets**
   ```bash
   npm run build
   ```

3. **Add Android Platform** (if not already added)
   ```bash
   npx cap add android
   ```

4. **Sync Capacitor**
   ```bash
   npx cap sync android
   ```

5. **Open in Android Studio**
   ```bash
   npx cap open android
   ```

6. **Build APK in Android Studio**
   - Once Android Studio opens, wait for Gradle sync to complete
   - Go to `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - The APK will be generated in: `android/app/build/outputs/apk/debug/app-debug.apk`

### Alternative: Build APK via Command Line

If you prefer command line:

```bash
cd android
./gradlew assembleDebug
cd ..
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Building Release APK (Production)

1. **Generate Signing Key**
   ```bash
   keytool -genkey -v -keystore asphalt-os-release.keystore -alias asphalt-os -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Signing in Android Studio**
   - Go to `Build` → `Generate Signed Bundle / APK`
   - Select `APK`
   - Choose your keystore file and enter credentials
   - Select `release` build variant
   - Click `Finish`

3. **Release APK Location**
   - `android/app/build/outputs/apk/release/app-release.apk`

### Optimizations for Mobile

The app includes mobile-specific optimizations:
- Responsive layout for all screen sizes
- Touch-optimized UI controls
- Smooth animations and transitions
- Efficient map rendering
- Offline capability structure

### Testing on Physical Device

1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect device via USB
4. Run: `npx cap run android`

### Common Issues

**Gradle Build Failed:**
- Check Java version: `java -version` (should be 17+)
- Update Android Studio to latest version
- Sync Gradle files in Android Studio

**App Crashes on Launch:**
- Check Android logs: `npx cap run android --target=<device-id> --livereload`
- Verify all dependencies are installed
- Clear app data and reinstall

### Live Reload for Development

For development with live reload:
```bash
npx cap run android --livereload --external
```

This allows you to see changes instantly on your device without rebuilding.

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

1. Update `capacitor.config.ts` and remove the `server` section
2. Build and sync:
```bash
npm run build
npx cap sync android
npx cap open android
```

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio Guide](https://developer.android.com/studio/intro)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
