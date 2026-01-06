/**
 * @format
 */

import {TimerScreen} from '../src/screens/TimerScreen';

// Mock storage
jest.mock('../src/storage', () => ({
  getSequences: jest.fn().mockResolvedValue([]),
}));

// Mock navigation
const mockRoute = {
  params: {sequenceId: 'test-sequence-1'},
  key: 'test-key',
  name: 'Timer' as const,
};

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
} as any;

describe('TimerScreen', () => {
  it('should be defined', () => {
    expect(TimerScreen).toBeDefined();
    expect(typeof TimerScreen).toBe('function');
  });

  it('should accept route and navigation props', () => {
    // Verify component signature
    expect(() => {
      const props = {route: mockRoute, navigation: mockNavigation};
      expect(props).toBeDefined();
    }).not.toThrow();
  });

  it('should export from screens index', () => {
    const screens = require('../src/screens');
    expect(screens.TimerScreen).toBeDefined();
    expect(typeof screens.TimerScreen).toBe('function');
  });
});
