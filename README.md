# Train Track

A React Native application built with TypeScript, iOS-first, and prepared for future Apple Watch integration.

## Features

- ✅ React Native with TypeScript
- ✅ Clean project structure
- ✅ React Navigation for screen navigation
- ✅ Dark mode support with custom theme system
- ✅ iOS-first development approach
- ✅ Prepared for Apple Watch integration

## Project Structure

```
src/
├── screens/        # Screen components
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── navigation/     # Navigation configuration
├── storage/        # Data persistence utilities
├── theme/          # Theme definitions (light/dark)
└── types/          # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js >= 20
- iOS development environment (Xcode, CocoaPods)
- React Native CLI

### Installation

1. Clone the repository:
```bash
git clone https://github.com/abigailmmarlett/train-track.git
cd train-track
```

2. Install dependencies:
```bash
npm install
```

3. Install iOS dependencies:
```bash
cd ios && pod install && cd ..
```

### Running the App

#### iOS
```bash
npm run ios
```

#### Android
```bash
npm run android
```

### Development Scripts

- `npm start` - Start Metro bundler
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Theme System

The app includes a built-in theme system that automatically adapts to the device's appearance (light/dark mode).

Use the `useTheme` hook in your components:

```typescript
import {useTheme} from './src/hooks';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <View style={{backgroundColor: theme.colors.background}}>
      <Text style={{color: theme.colors.text}}>Hello World</Text>
    </View>
  );
}
```

## Apple Watch Integration

This project is prepared for future Apple Watch integration. See [docs/APPLE_WATCH.md](docs/APPLE_WATCH.md) for more information.

## License

Private
