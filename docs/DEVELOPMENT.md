# Development Guide

## Project Overview

Train Track is an iOS-first React Native application built with TypeScript. The project is structured for scalability and maintainability.

## Architecture

### Folder Structure

- **`src/screens/`** - Full screen components that are navigated to
- **`src/components/`** - Reusable UI components
- **`src/hooks/`** - Custom React hooks
- **`src/navigation/`** - React Navigation setup and configuration
- **`src/storage/`** - Local data persistence utilities
- **`src/theme/`** - Theme definitions (light and dark modes)
- **`src/types/`** - TypeScript type definitions

### Key Technologies

- **React Native 0.83.1** - Mobile framework
- **TypeScript 5.8.3** - Type safety
- **React Navigation 7** - Navigation library
- **React Native Screens** - Native screen components for better performance

## Development Workflow

### Setting Up Your Environment

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install iOS Pods** (macOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Start Metro Bundler**
   ```bash
   npm start
   ```

4. **Run on iOS** (macOS only)
   ```bash
   npm run ios
   ```

### Code Quality

- **Linting**: Run `npm run lint` to check for code style issues
- **Testing**: Run `npm test` to execute tests
- **TypeScript**: Run `npx tsc --noEmit` to check for type errors

### Theme System

The app uses a custom theme system that automatically adapts to the device's color scheme (light/dark mode).

#### Using the Theme

```typescript
import {useTheme} from './src/hooks';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <View style={{backgroundColor: theme.colors.background}}>
      <Text style={{color: theme.colors.text}}>Hello</Text>
    </View>
  );
}
```

#### Theme Properties

```typescript
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  spacing: {
    xs: number;  // 4
    sm: number;  // 8
    md: number;  // 16
    lg: number;  // 24
    xl: number;  // 32
  };
  borderRadius: {
    sm: number;  // 4
    md: number;  // 8
    lg: number;  // 16
  };
  typography: {
    h1: { fontSize: number; fontWeight: string; };
    h2: { fontSize: number; fontWeight: string; };
    h3: { fontSize: number; fontWeight: string; };
    body: { fontSize: number; fontWeight: string; };
    caption: { fontSize: number; fontWeight: string; };
  };
}
```

## Navigation

The app uses React Navigation with a stack navigator. To add a new screen:

1. Create the screen component in `src/screens/`
2. Export it from `src/screens/index.ts`
3. Add the screen type to `src/types/navigation.ts`
4. Add the screen to the navigator in `src/navigation/RootNavigator.tsx`

Example:

```typescript
// src/types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  NewScreen: { userId: string };  // Add this
};

// src/navigation/RootNavigator.tsx
<Stack.Screen name="NewScreen" component={NewScreen} />
```

## Best Practices

1. **TypeScript**: Always use proper types, avoid `any`
2. **Hooks**: Create custom hooks for reusable logic
3. **Components**: Keep components small and focused
4. **Styling**: Use the theme system for consistent styling
5. **Navigation**: Use typed navigation helpers
6. **Testing**: Write tests for critical business logic

## iOS-First Approach

This project is optimized for iOS:
- Uses iOS design patterns
- Optimized for iOS performance
- Prepared for watchOS integration
- Uses native iOS components where possible

## Future Enhancements

- Apple Watch companion app
- Local storage implementation
- Additional screens and features
- Backend integration (when needed)
