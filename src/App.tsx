import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { AppwriteProvider } from './appwrite/AppwriteContext'; // Import Appwrite Provider
import Router from './routes/Router'; // Import Router which manages navigation


export default function App() {
  return (
    <AppwriteProvider>
      {/* The AppwriteProvider wraps the Router so the context is available to all components */}
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        {/* Router handles navigation between AppStack and AuthStack */}
        <Router />
      </View>
    </AppwriteProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D32', // Set background color for the app
  },
});
