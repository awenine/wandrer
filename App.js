import { StatusBar } from 'expo-status-bar';
import { View, Dimensions } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import Main from './Main.js';

export default function App() {
  const Drawer = createDrawerNavigator();

  //todo use drawer as 'history' tab to show tracks that have been played
  //todo set draw to swipe even when over map
  //todo add visual cue (slight shadow?) where drawer can be swiped from
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Main"
        edgeWidth={Dimensions.get('window').width * 0.2}
        drawerStyle={{
          backgroundColor: 'seashell',
          width: Dimensions.get('screen').width * 0.45,
        }}
      >
        <Drawer.Screen name="Main" component={Main} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

// const styles = StyleSheet.create({
// });
