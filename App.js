import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      //* check whether app is running on phone or emulator
      if (Platform.OS === 'android' && !Constants.isDevice) {
        setErrorMsg(
          'Sorry, this will not work in an Android emulator. Try it on your device!',
        );
        return;
      }
      //* set error message and return if permission denied
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Sorry, permission to access location was denied');
        return;
      }
      //* fetch location
      let location = await Location.getLastKnownPositionAsync({});
      setLocation(location);
    })();
  }, []);

  let locationText = 'Fetching location...';
  if (errorMsg) {
    locationText = errorMsg;
  } else if (location) {
    let { longitude, latitude } = location.coords;
    locationText = 'You are at ' + longitude + ',' + latitude;
  }

  return (
    <View style={styles.container}>
      <Text>Wandrer (proto)</Text>
      <Text style={styles.subtitle}>made using Freesound</Text>
      <Text>{locationText}</Text>
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
