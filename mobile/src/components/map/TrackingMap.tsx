import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors, FontSize, FontWeight } from '../../constants/theme';
import { DriverLocation } from '../../types';

interface TrackingMapProps {
  restaurantLat: number;
  restaurantLng: number;
  customerLat: number;
  customerLng: number;
  driverLocation?: DriverLocation | null;
  showDriver?: boolean;
}

export function TrackingMap({
  restaurantLat,
  restaurantLng,
  customerLat,
  customerLng,
  driverLocation,
  showDriver = false,
}: TrackingMapProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const coords = [
      { latitude: restaurantLat, longitude: restaurantLng },
      { latitude: customerLat, longitude: customerLng },
      ...(showDriver && driverLocation
        ? [{ latitude: driverLocation.lat, longitude: driverLocation.lng }]
        : []),
    ];
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
      animated: true,
    });
  }, [driverLocation, showDriver]);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: (restaurantLat + customerLat) / 2,
        longitude: (restaurantLng + customerLng) / 2,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      showsCompass
      showsScale
    >
      {/* Restaurant Marker */}
      <Marker
        coordinate={{ latitude: restaurantLat, longitude: restaurantLng }}
        title="Al Samaha Restaurant"
      >
        <View style={[styles.markerContainer, { backgroundColor: Colors.secondary }]}>
          <Text style={styles.markerText}>🍽</Text>
        </View>
      </Marker>

      {/* Customer Marker */}
      <Marker
        coordinate={{ latitude: customerLat, longitude: customerLng }}
        title="Delivery Location"
      >
        <View style={[styles.markerContainer, { backgroundColor: Colors.error }]}>
          <Text style={styles.markerText}>📍</Text>
        </View>
      </Marker>

      {/* Driver Marker */}
      {showDriver && driverLocation && (
        <Marker
          coordinate={{ latitude: driverLocation.lat, longitude: driverLocation.lng }}
          title="Your Driver"
          rotation={driverLocation.heading ?? 0}
        >
          <View style={[styles.markerContainer, { backgroundColor: Colors.primary }]}>
            <Text style={styles.markerText}>🛵</Text>
          </View>
        </Marker>
      )}

      {/* Route line driver → customer */}
      {showDriver && driverLocation && (
        <Polyline
          coordinates={[
            { latitude: driverLocation.lat, longitude: driverLocation.lng },
            { latitude: customerLat, longitude: customerLng },
          ]}
          strokeColor={Colors.primary}
          strokeWidth={3}
          lineDashPattern={[8, 4]}
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: { fontSize: 18 },
});
