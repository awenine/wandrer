import { StatusBar } from 'expo-status-bar';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  Dimensions,
  FlatList,
  ScrollView,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import MapView, { Marker, Polyline } from 'react-native-maps';
import mapStyle from './mapstyle';
import APIsounds from './mockAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { set } from 'react-native-reanimated';

const Main = () => {
  const [sound, setSound] = useState(null);
  const [location, setLocation] = useState({
    // default if location not yet loaded...
    latitude: 37.78825,
    longitude: -122.4324,
  });
  const [errorMsg, setErrorMsg] = useState(null);
  const [soundLoadMsg, setSoundLoadMsg] = useState('Waiting to play...');
  const [markerCoord, setMarkerCoord] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });
  const [mapTrail, setMapTrail] = useState([markerCoord]);
  //? For storing fetched data
  const [postsFromAPI, setPostsFromAPI] = useState([]);
  //? Random number to grab specific post from postsFromAPI
  const [randNum, setRandNum] = useState(0);
  //? Quote to store locally
  const [quote, setQuote] = useState();

  //? mock api of fetched sounds
  const [playlist, setPlaylist] = useState(APIsounds.results);
  //? current song/track
  const [currentTrack, setCurrentTrack] = useState(null);
  //? history of visited locations
  const [locationHistory, setLocationHistory] = useState([]);

  //? tally for storing & retrieving history
  const [tally, setTally] = useState(0);

  //? fetch data from mock api
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleFetchPosts = useCallback(async () => {
    console.log('handling...');
    const result = await fetch('https://jsonplaceholder.typicode.com/posts');
    const posts = await result.json();
    if (result.ok) {
      setPostsFromAPI(posts);
    }
    setRandNum(Math.floor(Math.random() * postsFromAPI.length));
  });

  //? used to access methods on the MapView component (for animation)
  const mapView = useRef(null);

  //* sound continues to play in background but no lockscreen solution found
  async function playSound(soundLink) {
    setSoundLoadMsg('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(
      //* for playing sounds from URL (below route returned by freesound api > 'previews')
      { uri: soundLink.previews['preview-lq-mp3'] },
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

  //? Location settup
  useEffect(() => {
    (async () => {
      //* check whether app is running on phone or emulator
      if (Platform.OS === 'android' && !Constants.isDevice) {
        setErrorMsg(
          'Sorry, geolocation will not work in an Android emulator. Try it on your device!',
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
      let result = await Location.getLastKnownPositionAsync({});
      if (result) {
        let { longitude, latitude } = result.coords;
        setLocation({ longitude, latitude });
      }
    })();
  }, []);

  // const handleFetchPosts = useCallback(async () => {
  //   console.log('handling...');
  //   const result = await fetch('https://jsonplaceholder.typicode.com/posts');
  //   const posts = await result.json();
  //   if (result.ok) {
  //     setPostsFromAPI(posts);
  //   }
  //   setRandNum(Math.floor(Math.random() * postsFromAPI.length));
  // });

  function handleMarkerDrag(e) {
    const newCoords = e.nativeEvent.coordinate;
    setMarkerCoord(newCoords);
    //? draw "trail" on map recording movement history of the marker & mapping to Polyline component
    setMapTrail([...mapTrail, newCoords]);
  }

  function mapAnimateNavigation(region) {
    console.log(region);
    mapView.current.animateToRegion(
      {
        ...region,
        latitudeDelta: 0.0422,
        longitudeDelta: 0.0922,
      },
      2000,
    );
  }

  //? used to conditionally render items from fetched array
  //todo replace with sounds from Freesound API
  function renderOnePost({ item, index }, number) {
    if (index === number) {
      return (
        <View>
          <Text>{item.title}</Text>
          <Text></Text>
        </View>
      );
    } else {
      return;
    }
  }

  //todo how to best create unique id for each item saved? id_date?
  //? use to save to storage
  async function saveToStorage(key, item) {
    const trackJSON = JSON.stringify(item);
    try {
      await AsyncStorage.setItem(key, trackJSON);
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert(error);
    }
  }

  //? Load from localstorage on startup
  async function loadFromStorage() {
    try {
      const trackJSON = await AsyncStorage.getItem(tally.toString());
      if (trackJSON) {
        const track = JSON.parse(trackJSON);
        setQuote(track.name);
      }
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert(error);
    }
  }

  function nextLocation() {
    // set a random number within 0-playlist.length-1
    //todo check if playlist empty, if so re-fetch
    const trackNum = Math.floor(Math.random() * playlist.length);
    // check item in playlist[random number]
    setCurrentTrack(playlist[trackNum]);
    setPlaylist(playlist.filter((_, i) => i !== trackNum));
    // increments the tally of stored tracks
    setTally((currentTally) => currentTally + 1);
    // stores track using tally as key
    // storeTrackToHistory(selectedTrack);
    if (currentTrack !== null) {
      let newCoords = currentTrack.geotag.split(' ').map((coord) => +coord);
      setLocation({ latitude: newCoords[0], longitude: newCoords[1] });
    }
  }

  useEffect(() => {
    if (currentTrack !== null) {
      storeTrackToHistory(currentTrack);
    }
    saveToStorage('storedTally', tally);
    loadFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tally]);

  function storeTrackToHistory(track) {
    console.log('tally: ', tally);
    const item = { ...track, datePlayed: Date.now() };
    const key = tally.toString();
    saveToStorage(key, item);
  }

  function handleMoveCamera(destination) {
    nextLocation();
    mapAnimateNavigation(destination);
  }

  return (
    <View style={styles.container}>
      {/* MAP */}
      <MapView
        ref={mapView}
        style={styles.map}
        initialRegion={{
          //* keep as initial region and look at how updated
          ...location,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}
        // accesses seperate mapstyle.js file for customising the maps appearance
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
      {/* SCROLLING CONTAINER FOR MUSIC PLAYER (currently sandbox for testing) */}
      <ScrollView>
        <Button
          id="Move Camera"
          color="orchid"
          title="Next Location"
          onPress={() => handleMoveCamera(location)} //* Now animates to next location
        />
        <Text>Current track ~ {currentTrack ? currentTrack.name : ''}</Text>
        <Text>Wandrer (proto)</Text>
        <Text style={styles.subtitle}>made using Freesound</Text>
        <Text style={styles.soundload}>{soundLoadMsg}</Text>
        <View style={styles.buttons}>
          <Button
            color="darkseagreen"
            title="Play"
            onPress={() => playSound(currentTrack)}
          />
          <Text>{'         '}</Text>
          <Button color="maroon" title="Stop" onPress={stopSound} />
          <Text>{'         '}</Text>
          <Button
            id="horaldo"
            color="blue"
            title="Move Map"
            onPress={() => mapAnimateNavigation(location)} //! needs to be a callback (?)
          />
          <Text>{'         '}</Text>
          <Button title="API" color="peru" onPress={handleFetchPosts} />
        </View>
        <Text>{''}</Text>
        {/* Get and print coordinates of marker when moved */}
        <Text>
          Marker at: {markerCoord.latitude}, {markerCoord.longitude}
        </Text>
        {/* <FlatList
          style={styles.flatlist}
          data={postsFromAPI}
          keyExtractor={(item) => item.id + ''} // NOTE: id expects string
          renderItem={({ item, index }) =>
            renderOnePost({ item, index }, randNum)
          }
        /> */}
        {/* For testing local storage (for favourites) */}
        {/* <TextInput
          style={styles.input}
          onChangeText={(text) => setQuote(text)}
        /> */}
        {/* <Button color="teal" title="Save this quote" onPress={saveToStorage} /> */}
        <Text>{''}</Text>
        <Text>Current tally in local storage: {quote}</Text>
        <StatusBar style="auto" />
      </ScrollView>
    </View>
  );
};

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
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.7,
    marginBottom: 10,
  },
  flatlist: {
    height: Dimensions.get('window').height * 0.2,
    marginVertical: 5,
  },
  input: {
    alignSelf: 'stretch',
    height: 50,
    fontSize: 24,
    backgroundColor: 'antiquewhite',
    marginVertical: 5,
  },
});

export default Main;
