import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';

// Disable warning popups on device to ensure smooth production testing
LogBox.ignoreAllLogs(true);
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
  'Animated: `useNativeDriver` is not supported',
]);

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <AppNavigator />
        </View>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E131F',
  },
});
