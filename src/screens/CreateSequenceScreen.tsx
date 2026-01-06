import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../hooks';

export function CreateSequenceScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Text style={[styles.title, {color: theme.colors.text}]}>
        Create Sequence
      </Text>
      <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
        This screen will allow creating new sequences
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
});
