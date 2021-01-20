import { StatusBar } from 'expo-status-bar';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  Dimensions,
  ScrollView,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline } from 'react-native-maps';
import mapStyle from './mapstyle';
import APIsounds from './mockAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TOKEN from './mockEnv';
import { TouchableOpacity } from 'react-native-gesture-handler';
import SvgPlayButton from './assets/icons/PlayButton';
import SvgStopButton from './assets/icons/StopButton';
import SvgSkipButton from './assets/icons/SkipButton';

const Main = () => {
  const [sound, setSound] = useState(null);
  const [location, setLocation] = useState({
    // default if location not yet loaded...
    latitude: 51.370593,
    longitude: -0.116573,
  });
  const [errorMsg, setErrorMsg] = useState(null); //! not using currently
  const [soundLoadMsg, setSoundLoadMsg] = useState('Waiting to play...');
  const [markerCoord, setMarkerCoord] = useState({
    latitude: 51.370593,
    longitude: -0.116573,
  });

  const [mapTrail, setMapTrail] = useState([]);
  //? Quote to store locally
  const [quote, setQuote] = useState();

  //? current tracks cued (defaults to mock API)
  const [playlist, setPlaylist] = useState(APIsounds.results);
  //? current song/track
  const [currentTrack, setCurrentTrack] = useState(null);

  //? tally for storing & retrieving history
  const [tally, setTally] = useState(0);

  const [currentMessage, setCurrentMessage] = useState('Waiting for sounds...');

  //? fetch data from api
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleFetchAPI = useCallback(async (radius) => {
    console.log('handling fetch...');
    console.log('Search Radius: ', radius);
    const route =
      'https://freesound.org/apiv2/search/text/?filter=%7B%21geofilt%20sfield=geotag%20pt=' +
      markerCoord.latitude +
      ',' +
      markerCoord.longitude +
      '%20d=' +
      radius.toString() + // radius of search results in km
      '%7D%20&fields=id,previews,name,description,username,geotag&token=' +
      TOKEN;
    const result = await fetch(route);
    const fetchedPlaylist = await result.json();
    if (result.ok) {
      if (fetchedPlaylist.count === 0) {
        //* ie no songs within range
        handleFetchAPI(radius * 5); // increase radius of search
      } else {
        await setPlaylist(fetchedPlaylist.results);
        setCurrentMessage(
          'Found ' + fetchedPlaylist.count + ' items within ' + radius + 'km',
        );
      }
    }
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
    sound.setOnPlaybackStatusUpdate(_onPlaybackStatusUpdate);
    setSound(sound);
    await sound.playAsync();
    setSoundLoadMsg('Playing Sound');
  }
  //? fires on current track ending, autoplaying next track
  function _onPlaybackStatusUpdate(playbackStatus) {
    if (playbackStatus.didJustFinish) {
      // The player has just finished playing and will stop.
      console.log('***NEXT TRACK***');
      nextLocation();
    }
  }

  function stopSound() {
    if (sound) {
      sound.stopAsync();
      setSound(null);
    }
  }

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
    // update current tally of stored items
    loadTallyFromStorage();
  }, []);

  function handleMapPress(e) {
    setLocation(e.nativeEvent.coordinate);
  }

  //? run whenever location changes
  useEffect(() => {
    mapAnimateNavigation(location);
    setMarkerCoord(location);
  }, [location]);

  function mapAnimateNavigation(region) {
    console.log(region);
    mapView.current.animateToRegion(
      {
        ...region,
        latitudeDelta: 0.0422,
        longitudeDelta: 0.0922,
      },
      1500,
    );
  }

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

  //? Load from localstorage when tally updated
  async function loadTallyFromStorage() {
    try {
      const itemsInHistory = await AsyncStorage.getItem('storedTally');
      if (itemsInHistory) {
        setTally(JSON.parse(itemsInHistory));
        // setTally(0); // used for hard reset of local storage
      }
      console.log('Tally set from storage to', itemsInHistory);
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert(error);
    }
  }

  //? Load tally from localstorage on startup
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

  async function nextLocation() {
    if (playlist.length === 0) {
      await handleFetchAPI(200);
      const check = await playlist;
      if (check.length !== 0) {
        nextLocation();
      }
    } else {
      const trackNum = Math.floor(Math.random() * playlist.length);
      setCurrentTrack(playlist[trackNum]);
      setPlaylist(playlist.filter((_, i) => i !== trackNum));
      setTally((currentTally) => currentTally + 1);
      //* tally triggers useEffect with other functions to maintain execution order
    }
  }

  useEffect(() => {
    if (currentTrack !== null) {
      // format coordinates
      let newCoords = currentTrack.geotag.split(' ').map((coord) => +coord);
      const newCoordObj = { latitude: newCoords[0], longitude: newCoords[1] };
      // set new location
      setLocation(newCoordObj);
      setMapTrail([...mapTrail, newCoordObj]);
      // autoplay next track
      playSound(currentTrack);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  useEffect(() => {
    if (currentTrack !== null) {
      storeTrackToHistory(currentTrack);
    }
    saveToStorage('storedTally', tally);
    loadFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tally]);

  function handlePlayButton(track) {
    if (track) {
      playSound(track);
    } else {
      handleFetchAPI(100);
      console.log('No track loaded');
    }
  }

  function storeTrackToHistory(track) {
    console.log('tally: ', tally);
    const item = { ...track, datePlayed: Date.now() };
    const key = tally.toString();
    saveToStorage(key, item);
  }

  // function consoleLogger() {
  //   console.log('tally = ', tally);
  //  clearStorage();
  //  loadTallyFromStorage();
  //  getAllKeys();
  // }

  //? clears local storage of all tracks and tally (FOR RESET)
  // const clearStorage = async () => {
  //   console.log('tally in clearStorage: ', tally);
  //   const slots = [...Array(tally)].map((_, i) => (i + 1).toString());
  //   console.log('slots: ', slots);
  //   const keys = [...slots, 'storedTally'];
  //   console.log('keys: ', keys);
  //   try {
  //     await AsyncStorage.multiRemove(keys)
  //   } catch (e) {
  //     // remove error
  //   }
  //   console.log('Storage cleared');
  // };

  //? retrieve keys in local storage (FOR RESET)
  // const getAllKeys = async () => {
  //   let keys = [];
  //   try {
  //     keys = await AsyncStorage.getAllKeys()
  //   } catch (e) {
  //     // read key error
  //   }
  //   console.log('keys: ', keys);
  //   // example console.log result:
  //   // ['@MyApp_user', '@MyApp_key']
  // };

  return (
    <View style={styles.container}>
      {/* MAP */}
      <View>
        {/* <View styles={styles.banner}>
          <Text style={styles.logo}>W A N D R E R</Text>
        </View> */}
        <LinearGradient
          id="swipeArea"
          colors={['rgba(19, 52, 26,1)', 'rgba(19, 52, 26,0.1)', 'transparent']}
          start={[0, 0.5]}
          end={[1, 0.5]}
          style={styles.thumbBar}
        />
        <MapView
          ref={mapView}
          style={styles.map}
          initialRegion={{
            ...location,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }}
          // accesses seperate mapstyle.js file for customising the maps appearance
          customMapStyle={mapStyle}
          onPress={handleMapPress}
        >
          <Marker
            coordinate={{
              latitude: markerCoord.latitude,
              longitude: markerCoord.longitude,
            }}
            pinColor={'#6ca9ff'}
          />
          <Polyline
            coordinates={mapTrail}
            strokeColor={'#30f797'}
            strokeWidth={3}
          />
        </MapView>
      </View>
      {/* MUSIC PLAYER */}
      <View style={styles.player}>
        <View style={styles.divider} />
        <View style={styles.buttons}>
          <TouchableOpacity onPress={stopSound}>
            <SvgStopButton height="50" width="50" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => nextLocation()}>
            <SvgSkipButton height="50" width="50" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handlePlayButton(currentTrack)}>
            <SvgPlayButton height="50" width="50" />
          </TouchableOpacity>
        </View>
        <View style={styles.trackinfo}>
          <Text style={styles.track}>
            {currentTrack
              ? 'Current track ~ ' + currentTrack.name
              : 'Wander...'}
          </Text>
          <Text style={styles.user}>
            {currentTrack ? 'by ' + currentTrack.username : ''}
          </Text>
          <Text style={styles.coordinates}>
            {currentTrack ? '( ' + currentTrack.geotag + ' )' : ''}
          </Text>
          <Text>{currentMessage}</Text>
        </View>
        <Text> </Text>
        <Button
          style={styles.search}
          color="#f0a82b"
          title="SEARCH FOR NEW SOUNDS"
          onPress={() => handleFetchAPI(100)} // 100 is the default search radius
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6c6b83',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackinfo: {
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 5,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.66,
  },
  divider: {
    width: Dimensions.get('window').width,
    height: 2,
    backgroundColor: '#b6b6d8',
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
  thumbBar: {
    position: 'absolute',
    backgroundColor: 'rgba(40, 89, 127, 0)',
    top: 0,
    left: 0,
    height: Dimensions.get('window').height * 0.66,
    width: Dimensions.get('window').width * 0.12,
    zIndex: 100,
  },
  logo: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    height: Dimensions.get('window').height * 0.7,
    width: Dimensions.get('window').width,
    zIndex: 100,
  },
  banner: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 25,
    width: Dimensions.get('window').width,
    zIndex: 110,
  },
  track: {
    color: '#e8e8f4',
    fontWeight: 'bold',
  },
  user: {
    color: '#e8e8f4',
  },
  coordinates: {
    color: '#7681b6',
  },
});

export default Main;
