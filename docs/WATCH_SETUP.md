# Apple Watch Target Setup Instructions

This guide explains how to add the watchOS targets to the Xcode project.

## Important Note

The Watch app code is included in this repository, but the **Xcode project targets** need to be manually added in Xcode. This is because Xcode project files (`.pbxproj`) are complex binary files that are best modified through the Xcode GUI.

## Files Included

All the necessary Swift code and resources are already in place:

```
ios/
├── TrainTrack/
│   ├── WatchConnectivityManager.swift      ✅ iOS Watch manager
│   ├── WatchConnectivityBridge.swift       ✅ React Native bridge
│   └── WatchConnectivityBridge.m           ✅ Bridge export
│
├── TrainTrackWatch WatchKit App/
│   ├── Assets.xcassets/                    ✅ App icons
│   └── Info.plist                          ✅ App metadata
│
└── TrainTrackWatch WatchKit Extension/
    ├── TrainTrackWatchApp.swift           ✅ App entry point
    ├── ContentView.swift                   ✅ Main UI
    ├── WatchConnectivityManager.swift      ✅ Watch manager
    └── Info.plist                          ✅ Extension metadata
```

## Setup Steps

### 1. Open Project in Xcode

```bash
cd ios
open TrainTrack.xcodeproj
```

### 2. Add Watch App Target

1. In Xcode, go to **File → New → Target**
2. Choose **watchOS → Watch App**
3. Configure:
   - Product Name: `TrainTrackWatch WatchKit App`
   - Bundle Identifier: `org.traintrack.TrainTrack.watchkitapp`
   - Language: Swift
   - User Interface: SwiftUI
   - Include Notification Scene: No
4. Click **Finish**
5. When prompted to activate scheme, click **Activate**

### 3. Link Existing Watch App Files

1. In Project Navigator, find `TrainTrackWatch WatchKit App` group
2. Delete the auto-generated files (keep the group)
3. Right-click the group → **Add Files to "TrainTrack"**
4. Navigate to `ios/TrainTrackWatch WatchKit App/`
5. Select all files and folders
6. **Important**: Uncheck "Copy items if needed" (files are already in place)
7. Target Membership: Check only `TrainTrackWatch WatchKit App`
8. Click **Add**

### 4. Link Watch Extension Files

1. Find `TrainTrackWatch WatchKit Extension` group
2. Delete auto-generated files (keep the group)
3. Right-click group → **Add Files to "TrainTrack"**
4. Navigate to `ios/TrainTrackWatch WatchKit Extension/`
5. Select all `.swift` files and `Info.plist`
6. Uncheck "Copy items if needed"
7. Target Membership: Check only `TrainTrackWatch WatchKit Extension`
8. Click **Add**

### 5. Link iOS Watch Connectivity Files

1. In Project Navigator, find `TrainTrack` group
2. Right-click → **Add Files to "TrainTrack"**
3. Select:
   - `WatchConnectivityManager.swift`
   - `WatchConnectivityBridge.swift`
   - `WatchConnectivityBridge.m`
4. Uncheck "Copy items if needed"
5. Target Membership: Check only `TrainTrack`
6. Click **Add**

### 6. Configure Build Settings

#### For iOS App Target (`TrainTrack`):

1. Select project → `TrainTrack` target
2. **General** tab:
   - Deployment Info → Deployment Target: iOS 14.0 or later
3. **Build Settings** tab:
   - Search "Swift Objc"
   - **Objective-C Bridging Header**: Leave as is (auto-generated)
   - **Defines Module**: Yes
4. **Build Phases** tab:
   - Verify `WatchConnectivityBridge.m` is in "Compile Sources"
   - Verify `.swift` files are in "Compile Sources"

#### For Watch App Target:

1. Select `TrainTrackWatch WatchKit App` target
2. **General** tab:
   - Deployment Info → Deployment Target: watchOS 8.0 or later
   - Bundle Identifier: `org.traintrack.TrainTrack.watchkitapp`
3. **Info** tab:
   - Verify `WKApplication` is set to `YES`

#### For Watch Extension Target:

1. Select `TrainTrackWatch WatchKit Extension` target
2. **General** tab:
   - Deployment Target: watchOS 8.0 or later
   - Bundle Identifier: `org.traintrack.TrainTrack.watchkitapp.watchkitextension`
3. **Build Settings**:
   - **Skip Install**: NO
   - **Defines Module**: Yes
4. **Frameworks & Libraries**:
   - Verify WatchConnectivity.framework is linked (should be automatic)

### 7. Configure Schemes

1. Product → Scheme → Edit Scheme
2. Create new scheme for Watch app if needed
3. Ensure Watch app scheme builds both Extension and App targets

### 8. Set up Capabilities (if needed)

If you see signing errors:

1. Select project → `TrainTrack` target → **Signing & Capabilities**
2. Enable **App Groups** (optional, for shared data)
3. Repeat for Watch targets if needed

### 9. Build and Test

#### Build iOS App:
```bash
# In terminal
npx react-native run-ios
```

#### Build Watch App:
1. In Xcode, select Watch scheme
2. Select paired simulator or device
3. Click Run (⌘R)

Or from terminal:
```bash
cd ios
xcodebuild -workspace TrainTrack.xcworkspace \
           -scheme "TrainTrackWatch WatchKit App" \
           -destination 'platform=watchOS Simulator,name=Apple Watch Series 9 (45mm)'
```

## Verification

After setup, verify:

- [ ] All files show no errors in Xcode
- [ ] iOS app builds successfully
- [ ] Watch app builds successfully
- [ ] Running iOS app allows Watch app to install
- [ ] Watch app shows "Waiting for iPhone" when launched
- [ ] Starting timer on iPhone updates Watch display
- [ ] Section changes trigger haptic feedback on Watch

## Troubleshooting

### "No such module 'WatchConnectivity'"
- Verify target is set to iOS/watchOS (not macOS)
- Clean build folder (⇧⌘K) and rebuild

### Bridge not found errors
- Check `WatchConnectivityBridge.m` is in iOS target's "Compile Sources"
- Verify `@objc` attributes in Swift files

### Watch app doesn't install
- Ensure Watch app target has iOS app as dependency
- Check Bundle IDs follow pattern: `app`, `app.watchkitapp`, `app.watchkitapp.watchkitextension`

### Files appear red in Xcode
- Right-click → Show in Finder
- Verify file is at expected location
- Right-click → Get Info → verify Target Membership

## Alternative: Manual Project File Editing

If you're comfortable with `.pbxproj` files, you can manually add the targets. However, this is **not recommended** as it's error-prone. The GUI method above is safer.

## Need Help?

See [WATCH_COMPANION.md](./WATCH_COMPANION.md) for architecture details and troubleshooting.
