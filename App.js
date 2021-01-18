import { StatusBar } from 'expo-status-bar';
import { View, Dimensions, Text, FlatList } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Main from './Main.js';

export default function App() {
  const Drawer = createDrawerNavigator();

  // mock local storage
  const [mockStore, setMockStore] = useState([1, 2, 3, 4, 7, 1123]);

  //todo use drawer as 'history' tab to show tracks that have been played
  //todo set draw to swipe even when over map
  //todo add visual cue (slight shadow?) where drawer can be swiped from
  return (
    <NavigationContainer>
      <Drawer.Navigator
        // drawerContent is callback passed props (not needed) & returning component
        drawerContent={() => (
          <FlatList
            // style={styles.flatlist}
            data={mockStore}
            keyExtractor={(item) => item + ''} // NOTE: id expects string, must be unique
            renderItem={({ item, index }) => <Text>{item}</Text>}
          />
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

// const styles = StyleSheet.create({
// });
