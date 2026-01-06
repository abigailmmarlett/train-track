# Apple Watch Companion Experience

## Overview

The Apple Watch companion app provides a **display-only** experience that mirrors the active timer from the iPhone app. It shows the current section, remaining time, and a circular countdown ring - all with a large, glanceable UI perfect for workout scenarios.

## Features

### Display Elements
- **Current Section Label**: Large, bold text showing which workout section is active (e.g., "Warm Up", "Exercise", "Cool Down")
- **Remaining Time**: Digital countdown timer in mm:ss format with monospaced digits
- **Circular Progress Ring**: Visual countdown indicator that empties as time progresses
- **Haptic Feedback**: Subtle wrist tap when transitioning between sections

### Design Philosophy
- **Display-Only**: No controls on the watch - all interaction happens on iPhone
- **Glanceable**: Large text and simple layout for quick checks during workouts
- **Minimalist**: Black background with high-contrast white text and blue accent
- **Always Synced**: Real-time updates from iPhone without user intervention

## Communication Architecture

### Approach: WatchConnectivity Framework

We use Apple's native **WatchConnectivity** framework for iPhone-to-Watch communication. This is the recommended approach for companion watchOS apps.

#### Why WatchConnectivity?

1. **Built for this use case**: Designed specifically for companion apps
2. **Efficient**: Background updates without draining battery
3. **Reliable**: Handles connection state automatically
4. **Simple**: One-way data flow from iPhone to Watch
5. **Native**: No third-party dependencies needed

#### Communication Flow

```
┌─────────────┐         WatchConnectivity          ┌─────────────┐
│   iPhone    │ ──────────────────────────────────>│ Apple Watch │
│             │    sendMessage() + updateContext()  │             │
│ React Native│                                     │   SwiftUI   │
│   Timer     │                                     │     UI      │
└─────────────┘                                     └─────────────┘
      │                                                    │
      │ useWatchSync hook                                 │
      │ sends state updates                               │
      │                                                    │
      v                                                    v
┌─────────────┐                                     ┌─────────────┐
│   Native    │                                     │   Watch     │
│   Bridge    │                                     │  Manager    │
└─────────────┘                                     └─────────────┘
```

### Data Sent to Watch

On every timer update, the iPhone sends:

```typescript
{
  currentLabel: string,      // e.g., "Exercise", "Rest", "Complete"
  remainingSeconds: number,  // e.g., 45, 30, 0
  progress: number,          // 0.0 to 1.0 (for ring animation)
  isCompleted: boolean       // true when sequence finishes
}
```

### Implementation Details

#### iPhone Side (React Native)

1. **useWatchSync Hook** (`src/hooks/useWatchSync.ts`)
   - React hook that monitors timer state
   - Sends updates to native bridge when state changes
   - Only active on iOS platform

2. **Native Bridge** (`ios/TrainTrack/WatchConnectivityBridge.swift/m`)
   - Exposes native WatchConnectivity to React Native
   - Simple method: `sendTimerState()`

3. **iOS WatchConnectivity Manager** (`ios/TrainTrack/WatchConnectivityManager.swift`)
   - Manages WCSession lifecycle
   - Sends messages via `sendMessage()` for immediate delivery
   - Uses `updateApplicationContext()` for persistence

#### Watch Side (Native SwiftUI)

1. **WatchConnectivityManager** (`ios/TrainTrackWatch WatchKit Extension/WatchConnectivityManager.swift`)
   - Receives messages from iPhone
   - Updates @Published properties for UI reactivity
   - Triggers haptic feedback on section changes
   - Handles connection state

2. **ContentView** (`ios/TrainTrackWatch WatchKit Extension/ContentView.swift`)
   - SwiftUI view with circular progress ring
   - Large, glanceable typography
   - Automatically updates when data changes
   - Shows "Waiting for iPhone" when disconnected

### Communication Methods

**Two methods work together**:

1. **sendMessage()**: Immediate delivery when Watch is reachable
   - Fast updates during active timer
   - Requires both devices to be active
   - Falls back gracefully if unreachable

2. **updateApplicationContext()**: Persistent state transfer
   - Delivers even when Watch is sleeping
   - Latest state always available when Watch wakes
   - Background updates without battery impact

This **dual approach** ensures:
- Real-time updates during workouts
- Correct state when glancing at Watch
- No dropped updates if connection is intermittent

### Why Not Over-Engineered?

We deliberately avoided:
- ❌ Two-way communication (Watch doesn't need to control timer)
- ❌ Complex state synchronization (one-way is simpler)
- ❌ React Native Watch library (native Swift is cleaner)
- ❌ Custom networking (WatchConnectivity handles it)
- ❌ Background tasks (framework manages background delivery)

## Haptic Feedback

**Trigger**: When section label changes (e.g., "Warm Up" → "Exercise")

**Type**: `.notification` haptic (subtle, distinct)

**Implementation**: 
```swift
WKInterfaceDevice.current().play(.notification)
```

This provides tactile confirmation without checking the screen.

## Project Structure

```
ios/
├── TrainTrack/
│   ├── WatchConnectivityManager.swift      # iOS-side manager
│   ├── WatchConnectivityBridge.swift       # React Native bridge
│   └── WatchConnectivityBridge.m           # Bridge export
│
├── TrainTrackWatch WatchKit App/
│   └── Info.plist                          # Watch app metadata
│
└── TrainTrackWatch WatchKit Extension/
    ├── TrainTrackWatchApp.swift           # App entry point
    ├── ContentView.swift                   # Main UI
    ├── WatchConnectivityManager.swift      # Watch-side manager
    └── Info.plist                          # Extension metadata

src/hooks/
└── useWatchSync.ts                         # React Native hook
```

## Building and Testing

### Prerequisites
- Xcode 15.0+
- watchOS SDK
- iOS device and Apple Watch (for testing on real hardware)

### Setup

1. **Add Watch targets to Xcode project**:
   - Open `ios/TrainTrack.xcodeproj` in Xcode
   - Add "Watch App" target
   - Add "Watch Extension" target
   - Link targets with main app

2. **Configure Bundle IDs**:
   - App: `org.traintrack.TrainTrack`
   - Watch App: `org.traintrack.TrainTrack.watchkitapp`
   - Watch Extension: `org.traintrack.TrainTrack.watchkitapp.watchkitextension`

3. **Enable WatchConnectivity**:
   - Already implemented in native code
   - No additional setup needed

### Testing

**On Simulator**:
- Limited - WatchConnectivity requires real devices
- UI can be previewed in Watch simulator

**On Real Devices**:
1. Pair Apple Watch with iPhone
2. Build and run app on iPhone
3. Watch app installs automatically
4. Start a timer sequence
5. Check Watch - should show synced state
6. Verify haptic feedback on section changes

## User Experience

### Typical Workout Flow

1. **Start**: User opens iPhone app and starts a workout sequence
2. **Glance**: User checks Watch to see remaining time without unlocking iPhone
3. **Feedback**: User feels haptic tap when section changes
4. **Complete**: Watch shows "Complete" when workout ends

### Connection States

**Connected**: 
- Shows timer state
- Updates in real-time
- Haptic feedback works

**Disconnected**:
- Shows "Waiting for iPhone" message
- Reconnects automatically when in range
- Catches up to current state on reconnection

## Future Enhancements (Out of Scope)

These are intentionally **not included** to avoid over-engineering:

- Watch-side controls (play/pause/skip)
- Complications
- Standalone Watch app
- Historical workout data
- Custom haptic patterns
- Watch-to-iPhone notifications
- Background workout sessions
- HealthKit integration

The current implementation focuses on **one thing well**: displaying the active timer state.

## Troubleshooting

**Watch not receiving updates?**
- Ensure devices are paired and nearby
- Check Bluetooth is enabled
- Verify app is running on iPhone
- Restart both devices if needed

**Haptic not working?**
- Check Watch is not in Silent Mode
- Verify Haptic Strength in Watch settings
- Ensure section is actually changing (not same label)

**UI not updating?**
- Check connection indicator
- Force quit and restart Watch app
- Verify timer is running on iPhone

## Technical Notes

- **SwiftUI**: Watch UI built entirely in SwiftUI for modern, declarative approach
- **Combine**: Uses `@Published` properties for reactive UI updates
- **Type Safety**: All native code is strongly typed in Swift
- **Error Handling**: Graceful degradation when Watch unavailable
- **Battery**: Minimal impact - WatchConnectivity is designed for efficiency
- **iOS 14+**: Minimum deployment target for compatibility

## Summary

The Apple Watch companion experience is:
- ✅ **Simple**: Display-only, no complex controls
- ✅ **Effective**: Shows exactly what's needed during workouts
- ✅ **Reliable**: Uses Apple's native communication framework
- ✅ **Glanceable**: Large UI elements for quick checks
- ✅ **Minimal**: One-way data flow, no over-engineering

This design prioritizes **user value** (quick timer glances during workouts) over **feature complexity**.
