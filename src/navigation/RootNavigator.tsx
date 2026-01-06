import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  HomeScreen,
  SequencesListScreen,
  TimerScreen,
  CreateSequenceScreen,
} from '../screens';
import {RootStackParamList} from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SequencesList"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SequencesList" component={SequencesListScreen} />
        <Stack.Screen name="Timer" component={TimerScreen} />
        <Stack.Screen name="CreateSequence" component={CreateSequenceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
