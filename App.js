import { StatusBar } from 'expo-status-bar';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import MapView from 'react-native-maps';

export default function App() {
  const [sound, setSound] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [soundLoadMsg, setSoundLoadMsg] = useState('Waiting to play...');

  //todo check playing in background, lock screen/menu notifications
  async function playSound() {
    setSoundLoadMsg('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(
      //* for playing sound files stored in assets
      // require('./assets/FFX_arp_sound.mp3'),
      //* for playing sounds from URL (below route returned by freesound api > 'previews')
      //todo make dynamic based on API requests using fetched location
      { uri: 'https://freesound.org/data/previews/401/401145_1821057-lq.mp3' },
    );
    setSound(sound);

    await sound.playAsync();
    setSoundLoadMsg('Playing Sound');
  }

  function stopSound() {
    if (sound) {
      sound.stopAsync();
      //! not sure if necessary, related to unloading
      setSound(null);
    }
  }

  //todo look at when unloading comes into effect
  useEffect(() => {
    //* sets audio to continue playing when app is in background
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
    });
    return sound
      ? () => {
          setSoundLoadMsg('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  //todo seperate into components
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
  //todo look at updating map displays
  let locationText = 'Fetching location...';
  if (errorMsg) {
    locationText = errorMsg;
  } else if (location) {
    let { longitude, latitude } = location.coords;
    locationText = 'You are at ' + latitude + ', ' + longitude;
  }

  //todo set up navigation
  return (
    <View style={styles.container}>
      <Text>Wandrer (proto)</Text>
      <Text style={styles.subtitle}>made using Freesound</Text>
      <Text>{locationText}</Text>
      <Text style={styles.soundload}>{soundLoadMsg}</Text>
      <Button color="darkseagreen" title="Play" onPress={playSound} />
      <Text>::::::</Text>
      <Button color="maroon" title="Stop" onPress={stopSound} />
      <Text>~~~~~~~</Text>
      <MapView style={styles.map} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'darkkhaki',
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
  map: {
    width: Dimensions.get('window').width * 0.85,
    height: Dimensions.get('window').height * 0.4,
  },
});
