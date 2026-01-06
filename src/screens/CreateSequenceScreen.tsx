import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {useTheme} from '../hooks';
import {getSequences, addSequence, updateSequence} from '../storage';
import type {TimerSequence, TimerBlock, RootStackParamList} from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = NativeStackScreenProps<
  RootStackParamList,
  'CreateSequence'
>['route'];

export function CreateSequenceScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const sequenceId = route.params?.sequenceId;
  const isEditMode = !!sequenceId;

  const [sequenceName, setSequenceName] = useState('');
  const [blocks, setBlocks] = useState<TimerBlock[]>([]);

  // Load existing sequence if in edit mode
  useEffect(() => {
    const loadSequence = async () => {
      try {
        const sequences = await getSequences();
        const sequence = sequences.find(s => s.id === sequenceId);
        if (sequence) {
          setSequenceName(sequence.name);
          setBlocks(sequence.blocks);
        }
      } catch (error) {
        console.error('Error loading sequence:', error);
        Alert.alert('Error', 'Failed to load sequence');
      }
    };

    if (isEditMode) {
      loadSequence();
    }
  }, [isEditMode, sequenceId]);

  const handleAddBlock = () => {
    const newBlock: TimerBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: '',
      durationSeconds: 60, // Default to 1 minute
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleRemoveBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
  };

  const handleMoveBlockUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [
      newBlocks[index],
      newBlocks[index - 1],
    ];
    setBlocks(newBlocks);
  };

  const handleMoveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [
      newBlocks[index + 1],
      newBlocks[index],
    ];
    setBlocks(newBlocks);
  };

  const handleUpdateBlockLabel = (blockId: string, label: string) => {
    setBlocks(
      blocks.map(b => (b.id === blockId ? {...b, label} : b)),
    );
  };

  const handleUpdateBlockDuration = (blockId: string, minutes: string) => {
    // Parse minutes and convert to seconds
    const minutesValue = parseFloat(minutes);
    if (!isNaN(minutesValue) && minutesValue >= 0) {
      setBlocks(
        blocks.map(b =>
          b.id === blockId
            ? {...b, durationSeconds: Math.round(minutesValue * 60)}
            : b,
        ),
      );
    }
  };

  const validateInputs = (): boolean => {
    if (!sequenceName.trim()) {
      Alert.alert('Validation Error', 'Please enter a sequence name');
      return false;
    }

    if (blocks.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one timer block');
      return false;
    }

    for (const block of blocks) {
      if (!block.label.trim()) {
        Alert.alert('Validation Error', 'All blocks must have a label');
        return false;
      }
      if (block.durationSeconds <= 0) {
        Alert.alert(
          'Validation Error',
          'All blocks must have a duration greater than 0',
        );
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      const sequence: TimerSequence = {
        id: isEditMode ? sequenceId : `seq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: sequenceName.trim(),
        blocks: blocks,
      };

      if (isEditMode) {
        await updateSequence(sequence);
        Alert.alert('Success', 'Sequence updated successfully');
      } else {
        await addSequence(sequence);
        Alert.alert('Success', 'Sequence created successfully');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving sequence:', error);
      Alert.alert('Error', 'Failed to save sequence');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            {color: theme.colors.text},
            theme.typography.h1,
          ]}>
          {isEditMode ? 'Edit Sequence' : 'Create Sequence'}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Sequence Name Input */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionLabel,
              {color: theme.colors.text},
              theme.typography.h3,
            ]}>
            Sequence Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
              theme.typography.body,
            ]}
            placeholder="Enter sequence name"
            placeholderTextColor={theme.colors.textSecondary}
            value={sequenceName}
            onChangeText={setSequenceName}
            autoCapitalize="words"
          />
        </View>

        {/* Timer Blocks */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionLabel,
              {color: theme.colors.text},
              theme.typography.h3,
            ]}>
            Timer Blocks
          </Text>

          {blocks.map((block, index) => (
            <View
              key={block.id}
              style={[
                styles.blockContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <View style={styles.blockInputs}>
                <TextInput
                  style={[
                    styles.blockLabelInput,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                    theme.typography.body,
                  ]}
                  placeholder="Block label"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={block.label}
                  onChangeText={text => handleUpdateBlockLabel(block.id, text)}
                  autoCapitalize="words"
                />
                <TextInput
                  style={[
                    styles.blockDurationInput,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                    theme.typography.body,
                  ]}
                  placeholder="Minutes"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={
                    block.durationSeconds > 0
                      ? (block.durationSeconds / 60).toString()
                      : ''
                  }
                  onChangeText={text =>
                    handleUpdateBlockDuration(block.id, text)
                  }
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.blockActions}>
                <TouchableOpacity
                  onPress={() => handleMoveBlockUp(index)}
                  disabled={index === 0}
                  style={styles.actionButton}>
                  <Text
                    style={[
                      styles.actionButtonText,
                      {
                        color:
                          index === 0
                            ? theme.colors.textSecondary
                            : theme.colors.primary,
                      },
                    ]}>
                    ↑
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleMoveBlockDown(index)}
                  disabled={index === blocks.length - 1}
                  style={styles.actionButton}>
                  <Text
                    style={[
                      styles.actionButtonText,
                      {
                        color:
                          index === blocks.length - 1
                            ? theme.colors.textSecondary
                            : theme.colors.primary,
                      },
                    ]}>
                    ↓
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRemoveBlock(block.id)}
                  style={styles.actionButton}>
                  <Text
                    style={[
                      styles.actionButtonText,
                      {color: theme.colors.error},
                    ]}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[
              styles.addBlockButton,
              {borderColor: theme.colors.border},
            ]}
            onPress={handleAddBlock}>
            <Text
              style={[
                styles.addBlockButtonText,
                {color: theme.colors.primary},
                theme.typography.h3,
              ]}>
              + Add Block
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.cancelButton,
            {borderColor: theme.colors.border},
          ]}
          onPress={handleCancel}>
          <Text
            style={[
              styles.buttonText,
              {color: theme.colors.text},
              theme.typography.h3,
            ]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.saveButton,
            {backgroundColor: theme.colors.primary},
          ]}
          onPress={handleSave}>
          <Text
            style={[
              styles.buttonText,
              styles.saveButtonText,
              theme.typography.h3,
            ]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  blockContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  blockInputs: {
    gap: 12,
  },
  blockLabelInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  blockDurationInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  blockActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  addBlockButton: {
    borderWidth: 2,
    borderRadius: 12,
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
  },
  addBlockButtonText: {
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
});
