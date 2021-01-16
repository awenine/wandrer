import { StatusBar } from 'expo-status-bar';
import { View, Dimensions } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import Main from './Main.js';

export default function App() {
  const Drawer = createDrawerNavigator();

  //todo set up navigation
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
