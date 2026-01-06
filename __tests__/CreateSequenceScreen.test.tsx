/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {CreateSequenceScreen} from '../src/screens/CreateSequenceScreen';
import * as storage from '../src/storage';

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
  navigate: mockNavigate,
};

const mockRoute = {
  params: undefined,
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
}));

// Mock storage
jest.mock('../src/storage', () => ({
  getSequences: jest.fn(),
  addSequence: jest.fn(),
  updateSequence: jest.fn(),
}));

// Mock theme hook
jest.mock('../src/hooks', () => ({
  useTheme: () => ({
    colors: {
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#000000',
      textSecondary: '#666666',
      border: '#E0E0E0',
      primary: '#007AFF',
      error: '#FF3B30',
    },
    typography: {
      h1: {fontSize: 32, fontWeight: '700'},
      h2: {fontSize: 24, fontWeight: '600'},
      h3: {fontSize: 18, fontWeight: '600'},
      body: {fontSize: 16, fontWeight: '400'},
    },
  }),
}));

describe('CreateSequenceScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (storage.getSequences as jest.Mock).mockResolvedValue([]);
    (storage.addSequence as jest.Mock).mockResolvedValue(undefined);
    (storage.updateSequence as jest.Mock).mockResolvedValue(undefined);
  });

  it('renders correctly in create mode', async () => {
    await ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<CreateSequenceScreen />);
    });
  });

  it('renders correctly in edit mode', async () => {
    mockRoute.params = {sequenceId: 'seq-123'};
    (storage.getSequences as jest.Mock).mockResolvedValue([
      {
        id: 'seq-123',
        name: 'Test Sequence',
        blocks: [
          {id: 'b1', label: 'Block 1', durationSeconds: 60},
        ],
      },
    ]);

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<CreateSequenceScreen />);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    mockRoute.params = undefined;
  });
});
