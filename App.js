/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import { View, Dimensions, Text, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import Main from './Main.js';

export default function App() {
  const Drawer = createDrawerNavigator();
  const [drawTally, setDrawTally] = useState(0);
  const [drawHistory, setDrawHistory] = useState([]);

  useEffect(() => {
    loadTallyFromStorage();
  }, []);

  async function loadTallyFromStorage() {
    try {
      const itemsInHistory = await AsyncStorage.getItem('storedTally');
        await setDrawTally(JSON.parse(itemsInHistory));
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
  return (
    <NavigationContainer
      onStateChange={(state) => loadTallyFromStorage()}
    > 
      <Drawer.Navigator
        drawerContent={(props) => (
          <HistoryList drawHistory={drawHistory} {...props} />
        )}
        initialRouteName="Main"
        edgeWidth={Dimensions.get('window').width * 0.2}
        drawerStyle={{
          backgroundColor: 'rgba(170, 111, 75, 0.85)',
          width: Dimensions.get('screen').width * 0.55,
        }}
        overlayColor="rgba(118, 129, 182, 0.4)"
      >
        <Drawer.Screen name="Main" component={Main} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}


const HistoryList = ({ navigation, drawHistory }) => {
  const isDrawerOpen = useIsDrawerOpen();

  useEffect(() => {
    console.log('isDrawerOpen: ',isDrawerOpen);
    (async () => {
      if (isDrawerOpen) {
        const itemsInHistory = await AsyncStorage.getItem('storedTally');
      }
    })();
  }, [isDrawerOpen]);

  return (
    <View>
      <Text style={{marginTop:30, marginBottom:10, fontSize:25, fontWeight: 'bold', color: 'whitesmoke'}}>V I S I T E D</Text>
      <FlatList
        data={drawHistory}
        keyExtractor={(item) => item.datePlayed + ''}
        renderItem={({ item, index }) => (
          <View>
            <Text style={{fontWeight: 'bold'}}>{item.name}</Text>
            <Text>By {item.username}</Text>
            <Text>
              played on {new Date(item.datePlayed).toLocaleString('en-GB')}
            </Text>
            <Text style={{fontWeight: 'bold'}}>Description:</Text>
            <Text style={{color: '#dfe1f0'}}>{item.description}</Text>
            <Text>~~~</Text>
          </View>
        )}
      />
    </View>
  );
};
