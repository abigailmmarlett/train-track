import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../hooks';
import {getSequences} from '../storage';
import type {TimerSequence, RootStackParamList} from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Calculate the total duration of a sequence in seconds
 */
function calculateTotalDuration(sequence: TimerSequence): number {
  return sequence.blocks.reduce((total, block) => total + block.durationSeconds, 0);
}

/**
 * Format seconds into a readable duration string (e.g., "5m 30s" or "1h 15m")
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}s`);
  }

  return parts.join(' ');
}

export function SequencesListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [sequences, setSequences] = useState<TimerSequence[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSequences = useCallback(async () => {
    try {
      setLoading(true);
      const loadedSequences = await getSequences();
      setSequences(loadedSequences);
    } catch (error) {
      console.error('Error loading sequences:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load sequences when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSequences();
    }, [loadSequences])
  );

  const handleSequencePress = (sequence: TimerSequence) => {
    navigation.navigate('Timer', {sequenceId: sequence.id});
  };

  const handleCreatePress = () => {
    navigation.navigate('CreateSequence');
  };

  const renderSequenceItem = ({item}: {item: TimerSequence}) => {
    const totalDuration = calculateTotalDuration(item);
    const formattedDuration = formatDuration(totalDuration);

    return (
      <TouchableOpacity
        style={[
          styles.sequenceItem,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() => handleSequencePress(item)}
        activeOpacity={0.7}>
        <View style={styles.sequenceContent}>
          <Text
            style={[
              styles.sequenceName,
              {color: theme.colors.text},
              theme.typography.h2,
            ]}
            numberOfLines={2}>
            {item.name}
          </Text>
          <Text
            style={[
              styles.sequenceDuration,
              {color: theme.colors.textSecondary},
              theme.typography.h3,
            ]}>
            {formattedDuration}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text
        style={[
          styles.emptyText,
          {color: theme.colors.textSecondary},
          theme.typography.h3,
        ]}>
        No sequences yet
      </Text>
      <Text
        style={[
          styles.emptySubtext,
          {color: theme.colors.textSecondary},
          theme.typography.body,
        ]}>
        Create your first workout sequence to get started
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View
        style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={styles.loader}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            {color: theme.colors.text},
            theme.typography.h1,
          ]}>
          Sequences
        </Text>
      </View>

      <FlatList
        data={sequences}
        renderItem={renderSequenceItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          sequences.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
      />

      <TouchableOpacity
        style={[
          styles.createButton,
          {backgroundColor: theme.colors.primary},
        ]}
        onPress={handleCreatePress}
        activeOpacity={0.8}>
        <Text
          style={[
            styles.createButtonText,
            styles.createButtonTextWhite,
            theme.typography.h3,
          ]}>
          Create New Sequence
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    marginBottom: 0,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  sequenceItem: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sequenceContent: {
    padding: 24,
  },
  sequenceName: {
    marginBottom: 8,
  },
  sequenceDuration: {
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 100,
  },
  emptyText: {
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    textAlign: 'center',
  },
  createButton: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonText: {
    fontWeight: '600',
  },
  createButtonTextWhite: {
    color: '#FFFFFF',
  },
  loader: {
    flex: 1,
  },
});
