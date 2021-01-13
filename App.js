import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);

  return (
    <View style={styles.container}>
      <Text>Wandrer (proto)</Text>
      <Text style={styles.subtitle}>made using Freesound</Text>
      <Text>CHANGE</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'khaki',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    color: 'teal',
  },
});
