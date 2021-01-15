import { StatusBar } from 'expo-status-bar';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  Dimensions,
  FlatList,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import MapView, { Marker, Polyline } from 'react-native-maps';
import mapStyle from './mapstyle';

export default function App() {
  const [sound, setSound] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [soundLoadMsg, setSoundLoadMsg] = useState('Waiting to play...');
  const [markerCoord, setMarkerCoord] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });
  const [mapTrail, setMapTrail] = useState([markerCoord]);
  //? For storing fetched data
  const [postsFromAPI, setPostsFromAPI] = useState([]);

  //? fetch data from mock api
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleFetchPosts = useCallback(async () => {
    const result = await fetch('https://jsonplaceholder.typicode.com/posts');
    const posts = await result.json();
    if (result.ok) {
      setPostsFromAPI(posts);
    }
  });

  //? used to access methods on the MapView component (for animation)
  const mapView = useRef(null);

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

  function handleMarkerDrag(e) {
    const newCoords = e.nativeEvent.coordinate;
    setMarkerCoord(newCoords);
    //? draw "trail" on map recording movement history of the marker & mapping to Polyline component
    setMapTrail([...mapTrail, newCoords]);
  }

  function mapAnimateNavigation() {
    mapView.current.animateToRegion(
      {
        latitude: 36.28825,
        longitude: -122.9324,
        latitudeDelta: 0.0422,
        longitudeDelta: 0.0922,
      },
      2000,
    );
  }

  //? used to conditionally render items from fetched array
  //todo replace with sounds from Freesound API
  function renderOnePost({ item, index }) {
    if (index === 1) {
      return (
        <View>
          <Text>{item.id}</Text>
          <Text></Text>
        </View>
      );
    } else {
      return;
    }
  }

  //todo set up navigation
  return (
    <View style={styles.container}>
      <Text>Wandrer (proto)</Text>
      <Text style={styles.subtitle}>made using Freesound</Text>
      <Text>{locationText}</Text>
      <Text style={styles.soundload}>{soundLoadMsg}</Text>
      <View style={styles.buttons}>
        <Button color="darkseagreen" title="Play" onPress={playSound} />
        <Text>{'         '}</Text>
        <Button color="maroon" title="Stop" onPress={stopSound} />
        <Text>{'         '}</Text>
        <Button
          id="horaldo"
          color="blue"
          title="Move Map"
          //  jumps map refion and marker to this location
          // onPress={() => setMarkerCoord({
          //     latitude: 38.78825,
          //     longitude: -121.4324,
          //   })
          // }
          onPress={mapAnimateNavigation}
        />
        <Text>{'         '}</Text>
        <Button title="API" color="peru" onPress={handleFetchPosts} />
      </View>
      <Text>{''}</Text>
      <Text>{''}</Text>
      <MapView
        ref={mapView}
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          // these delta values are used to avoid stretching the map, only the largest one is used
          latitudeDelta: 0.0422,
          longitudeDelta: 0.0922,
        }}
        region={{
          ...markerCoord,
          latitudeDelta: 0.0422,
          longitudeDelta: 0.0322,
        }}
        customMapStyle={mapStyle}
        // showsUserLocation-true // NOTE - fails silently, other dependencies
      >
        <Marker
          draggable
          coordinate={{
            latitude: markerCoord.latitude,
            longitude: markerCoord.longitude,
          }}
          onDragEnd={handleMarkerDrag}
        />
        <Polyline coordinates={mapTrail} />
      </MapView>
      {/* Get and print coordinates of marker when moved */}
      <Text>
        Marker at: {markerCoord.latitude}, {markerCoord.longitude}
      </Text>
      <FlatList
        data={postsFromAPI}
        keyExtractor={(item) => item.id + ''} // NOTE: id expects string
        renderItem={renderOnePost}
      />
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
  buttons: {
    flexDirection: 'row',
  },
  map: {
    width: Dimensions.get('window').width * 0.85,
    height: Dimensions.get('window').height * 0.5,
    marginBottom: 10,
  },
});
