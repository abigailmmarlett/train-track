import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../hooks';
import {getSequences, saveSequences} from '../storage';
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

  const handleEditPress = (sequence: TimerSequence) => {
    navigation.navigate('CreateSequence', {sequenceId: sequence.id});
  };

  const handleCreatePress = () => {
    navigation.navigate('CreateSequence');
  };

  const handleLoadSampleData = async () => {
    const sampleSequences: TimerSequence[] = [
      {
        id: '1',
        name: 'Quick Workout',
        blocks: [
          {id: 'b1', label: 'Warm Up', durationSeconds: 180},
          {id: 'b2', label: 'Exercise', durationSeconds: 300},
          {id: 'b3', label: 'Cool Down', durationSeconds: 120},
        ],
      },
      {
        id: '2',
        name: 'HIIT Training',
        blocks: [
          {id: 'b1', label: 'Warm Up', durationSeconds: 300},
          {id: 'b2', label: 'Sprint', durationSeconds: 30},
          {id: 'b3', label: 'Rest', durationSeconds: 30},
          {id: 'b4', label: 'Sprint', durationSeconds: 30},
          {id: 'b5', label: 'Rest', durationSeconds: 30},
          {id: 'b6', label: 'Sprint', durationSeconds: 30},
          {id: 'b7', label: 'Cool Down', durationSeconds: 300},
        ],
      },
      {
        id: '3',
        name: 'Long Run',
        blocks: [
          {id: 'b1', label: 'Warm Up', durationSeconds: 600},
          {id: 'b2', label: 'Run', durationSeconds: 3600},
          {id: 'b3', label: 'Cool Down', durationSeconds: 600},
        ],
      },
      {
        id: '4',
        name: 'Meditation',
        blocks: [
          {id: 'b1', label: 'Breathing', durationSeconds: 300},
          {id: 'b2', label: 'Meditation', durationSeconds: 1200},
        ],
      },
    ];

    try {
      await saveSequences(sampleSequences);
      Alert.alert('Success', 'Sample sequences loaded!');
      loadSequences();
    } catch (err) {
      Alert.alert('Error', 'Failed to load sample data');
      console.error('Error loading sample data:', err);
    }
  };

  const renderSequenceItem = ({item}: {item: TimerSequence}) => {
    const totalDuration = calculateTotalDuration(item);
    const formattedDuration = formatDuration(totalDuration);

    return (
      <View
        style={[
          styles.sequenceItem,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}>
        <TouchableOpacity
          style={styles.sequenceMainContent}
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
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditPress(item)}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.editButtonText,
              {color: theme.colors.primary},
            ]}>
            Edit
          </Text>
        </TouchableOpacity>
      </View>
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
      <TouchableOpacity
        style={[
          styles.sampleDataButton,
          {borderColor: theme.colors.border},
        ]}
        onPress={handleLoadSampleData}>
        <Text
          style={[
            styles.sampleDataButtonText,
            {color: theme.colors.primary},
          ]}>
          Load Sample Data
        </Text>
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  sequenceMainContent: {
    flex: 1,
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
  editButton: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0, 0, 0, 0.05)',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  sampleDataButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  sampleDataButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
    // White text is iOS standard for primary buttons in both light and dark modes
    // The theme doesn't currently define an "onPrimary" color
    color: '#FFFFFF',
  },
  loader: {
    flex: 1,
  },
});
