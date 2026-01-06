import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../hooks';

export function HomeScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Text style={[styles.title, {color: theme.colors.text}]}>
        Train Track
      </Text>
      <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
        Welcome to your iOS-first app
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
});
