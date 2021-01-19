/* eslint-disable prettier/prettier */
import { StatusBar } from 'expo-status-bar';
import { View, Dimensions, Text, FlatList } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import Main from './Main.js';

export default function App() {
  const Drawer = createDrawerNavigator();

  // mock local storage
  // const [mockStore, setMockStore] = useState([1, 2, 3, 4, 7, 1123]);

  const [drawTally, setDrawTally] = useState(0);
  const [drawHistory, setDrawHistory] = useState([]);

  useEffect(() => {
    loadTallyFromStorage();
  }, []);

  async function loadTallyFromStorage() {
    try {
      const itemsInHistory = await AsyncStorage.getItem('storedTally');
      // if (itemsInHistory) {
        await setDrawTally(JSON.parse(itemsInHistory));
      // }
      console.log('Tally Drawer set to', itemsInHistory);
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert(error);
    }
  }

  useEffect(() => { 
    loadDrawHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawTally]);

  async function loadDrawHistory() {
    const keys = [...Array(drawTally)].map((_, i) => (i + 1).toString());
    try {
      const tracks = await AsyncStorage.multiGet(keys);
      const tracksInfo = tracks.reverse().map((el) => JSON.parse(el[1]));
      setDrawHistory(() => tracksInfo);
    } catch (error) {
      alert(error);
    }
  }

  //todo use drawer as 'history' tab to show tracks that have been played
  //todo set draw to swipe even when over map
  //todo add visual cue (slight shadow?) where drawer can be swiped from
  return (
    <NavigationContainer
      onStateChange={(state) => loadTallyFromStorage()}
    > 
      <Drawer.Navigator
        // drawerContent is callback passed props (not needed) & returning component
        drawerContent={(props) => (
          // <FlatList
          //   data={drawHistory}
          //   keyExtractor={(item) => item.datePlayed + ''} // NOTE: id expects string, must be unique
          //   renderItem={({ item, index }) => (
          //     <View>
          //       <Text>{item.name}</Text>
          //       <Text>By {item.username}</Text>
          //       <Text>
          //         played on {new Date(item.datePlayed).toLocaleString('en-GB')}
          //       </Text>
          //       <Text>~~~</Text>
          //     </View>
          //   )}
          // />
          <HistoryList drawHistory={drawHistory} {...props} />
        )}
        initialRouteName="Main"
        edgeWidth={Dimensions.get('window').width * 0.2}
        drawerStyle={{
          backgroundColor: 'rgba(193, 66, 66, 0.72)', // colour of drawer w/ alpha
          width: Dimensions.get('screen').width * 0.55,
        }}
        overlayColor="rgba(40, 89, 127, 0.48)" // colour of transparency w/ alpha
      >
        <Drawer.Screen name="Main" component={Main} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}


const HistoryList = ({ navigation, drawHistory }) => {

  const isDrawerOpen = useIsDrawerOpen();
  // const isFocused = navigation.isFocused();

  useEffect(() => {
    console.log("isDrawerOpen: ",isDrawerOpen);
    (async () => {
      if (isDrawerOpen) {
        const itemsInHistory = await AsyncStorage.getItem('storedTally');
        // console.log('Tally Drawer in HistoryList set to', itemsInHistory);
      }
    })();
  }, [isDrawerOpen]);

  return (
    <FlatList 
      // style={styles.flatlist}
      data={drawHistory}
      keyExtractor={(item) => item.datePlayed + ''} // NOTE: id expects string, must be unique
      renderItem={({ item, index }) => (
        //todo Style this as link, favourites?
        <View>
          <Text>{item.name}</Text>
          <Text>By {item.username}</Text>
          <Text>
            played on {new Date(item.datePlayed).toLocaleString('en-GB')}
          </Text>
          <Text>~~~</Text>
        </View>
      )}
    />
  );
};
