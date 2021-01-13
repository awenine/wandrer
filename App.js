import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';

export default function App() {
  const [sound, setSound] = useState();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [soundLoadMsg, setSoundLoadMsg] = useState('Waiting to play...');

  async function playSound() {
    setSoundLoadMsg('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(
      //* for playing sound files stored in assets
      // require('./assets/FFX_arp_sound.mp3'),
      //* for playing sounds from URL (below route returned by freesound api > 'previews')
      { uri: 'https://freesound.org/data/previews/401/401145_1821057-lq.mp3' },
    );
    setSound(sound);

    setSoundLoadMsg('Playing Sound');
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          setSoundLoadMsg('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  //? Location settup
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
  }, [sound]);

  //? Update location text
  let locationText = 'Fetching location...';
  if (errorMsg) {
    locationText = errorMsg;
  } else if (location) {
    let { longitude, latitude } = location.coords;
    locationText = 'You are at ' + latitude + ', ' + longitude;
  }

  return (
    <View style={styles.container}>
      <Text>Wandrer (proto)</Text>
      <Text style={styles.subtitle}>made using Freesound</Text>
      <Text>{locationText}</Text>
      <Text style={styles.soundload}>{soundLoadMsg}</Text>
      <Button title="Play stored sound" onPress={playSound} />
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
  soundload: {
    color: 'tomato',
    marginBottom: 10,
  },
});
