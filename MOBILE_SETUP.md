# SkillsBets — Mobile Setup Guide

## Prerequisites

### iOS
- macOS with **Xcode 14+** installed ([App Store](https://apps.apple.com/app/xcode/id497799835))
- Xcode Command Line Tools: `xcode-select --install`
- A valid Apple Developer account (free for simulator, paid for device/App Store)

### Android
- **Android Studio** installed ([developer.android.com/studio](https://developer.android.com/studio))
- Android SDK with at least API Level 22 (Android 5.0)
- Java 17+ (bundled with Android Studio)

---

## First-time platform setup

After cloning the repo, generate the native projects (they are gitignored):

```bash
npm run build
npx cap add ios
npx cap add android
```

---

## Daily workflow

### Build & sync web assets to native

```bash
npm run mobile:build
```

This runs `vite build` then `npx cap sync` to copy the compiled web app and update native plugins.

### Open in Xcode (iOS)

```bash
npm run mobile:ios
```

In Xcode:
1. Select your target device or simulator.
2. Press **⌘R** to build and run.
3. For a real device, go to **Signing & Capabilities** and set your Team.

### Open in Android Studio (Android)

```bash
npm run mobile:android
```

In Android Studio:
1. Wait for Gradle sync to finish.
2. Select your emulator or connected device.
3. Press **▶ Run** (Shift+F10).

---

## Live reload (development)

The app is configured to load `https://skillsbets.net` directly via Capacitor's server URL. This means the native shell always points to production. To switch to a local dev server during development, temporarily edit `capacitor.config.ts`:

```ts
server: {
  url: 'http://YOUR_LOCAL_IP:5173',
  cleartext: true,
},
```

Then run `npx cap sync` and rebuild the native app.

---

## Publishing

### iOS (App Store)
1. In Xcode: **Product → Archive**
2. Upload via **Organizer → Distribute App**
3. Submit for review in App Store Connect

### Android (Google Play)
1. In Android Studio: **Build → Generate Signed Bundle/APK**
2. Choose **Android App Bundle (.aab)**
3. Upload to Google Play Console

---

## Useful commands

| Command | Description |
|---------|-------------|
| `npx cap sync` | Sync web assets + plugins to native projects |
| `npx cap copy` | Copy web assets only (faster, no plugin updates) |
| `npx cap open ios` | Open iOS project in Xcode |
| `npx cap open android` | Open Android project in Android Studio |
| `npx cap run ios` | Run on iOS simulator from CLI |
| `npx cap run android` | Run on Android emulator from CLI |
