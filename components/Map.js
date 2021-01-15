import React, { useRef, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import mapStyle from '../mapstyle';

const Map = () => {
  const [markerCoord, setMarkerCoord] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });
  const [mapTrail, setMapTrail] = useState([markerCoord]);
  //? used to access methods on the MapView component (for animation)
  const mapView = useRef(null);

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

  return (
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
  );
};

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width * 0.85,
    height: Dimensions.get('window').height * 0.2,
    marginBottom: 10,
  },
});

export default Map;
