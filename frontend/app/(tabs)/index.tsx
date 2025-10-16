import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import MapView, { Region, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { haversineDistance } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const COLORS = { primary: '#006400', white: '#FFFFFF', text: '#333333', accent: '#FFD700', background: '#F5F5F5', red: '#D32F2F' };

const API_BASE_URL = 'http://192.168.0.19:8000';

const BELEM_REGION: Region = {
  latitude: -1.4558,
  longitude: -48.5039,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// MODO DE DESENVOLVIMENTO: Mude para 'false' para usar o GPS real
const IS_SIMULATING = true;

export default function HomeScreen() {
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isRideActive, setIsRideActive] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Location.LocationObjectCoords[]>([]);
  const [distance, setDistance] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);

  const { token } = useAuth();
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const simulationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        setErrorMsg('Permissão de localização negada. Mostrando mapa de Belém.');
        setRegion(BELEM_REGION);
        setIsLoadingLocation(false);
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({ timeout: 10000 });
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        setErrorMsg('Não foi possível obter sua localização. Mostrando mapa de Belém.');
        setRegion(BELEM_REGION);
        console.error("Erro ao obter localização:", error);
      } finally {
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  const startRealTracking = async () => {
    // ... (O código de rastreamento real permanece aqui para uso futuro)
  };

  const startSimulation = () => {
    console.log("Iniciando simulação de pedalada...");
    // Pega o ponto inicial do mapa
    const startPoint = {
      latitude: region!.latitude,
      longitude: region!.longitude,
      altitude: null, accuracy: null, altitudeAccuracy: null, heading: null, speed: null,
    };
    setRouteCoordinates([startPoint]);

    simulationInterval.current = setInterval(() => {
      setRouteCoordinates(prevCoords => {
        const lastCoord = prevCoords[prevCoords.length - 1];
        // Gera um novo ponto ligeiramente ao norte do anterior
        const newCoord = { ...lastCoord, latitude: lastCoord.latitude + 0.0001 };
        
        const newCoords = [...prevCoords, newCoord];
        
        setDistance(prevDistance => prevDistance + haversineDistance(lastCoord, newCoord));

        mapRef.current?.animateToRegion({
          latitude: newCoord.latitude,
          longitude: newCoord.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        return newCoords;
      });
    }, 2000); // Adiciona um novo ponto a cada 2 segundos
  };

  const stopTracking = async () => {
    if (IS_SIMULATING) {
      if (simulationInterval.current) clearInterval(simulationInterval.current);
    } else {
      locationSubscription.current?.remove();
    }

    if (routeCoordinates.length < 2 || distance < 0.01) {
      Alert.alert("Pedalada muito curta", "Não há dados suficientes para salvar.");
      setIsRideActive(false); // Reseta o estado do botão
      return;
    }

    const co2Saved = distance * 0.15;
    const routeData = JSON.stringify(routeCoordinates.map(c => ({ lat: c.latitude, lon: c.longitude })));
    const payload = {
      distance_km: parseFloat(distance.toFixed(2)),
      co2_saved_kg: parseFloat(co2Saved.toFixed(2)),
      route_points: routeData,
    };

    try {
      await axios.post(`${API_BASE_URL}/api/rides/`, payload, {
        headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
      });
      Alert.alert("Pedalada Salva com Sucesso!", `Você percorreu ${distance.toFixed(2)} km e evitou ${co2Saved.toFixed(2)} kg de CO₂.`);
    } catch (error) {
      console.error("Erro ao salvar pedalada:", error.response?.data || error.message);
      Alert.alert("Erro", "Não foi possível salvar sua pedalada no servidor.");
    }
  };

  const handleToggleRide = () => {
    if (isRideActive) {
      stopTracking();
    } else {
      setRouteCoordinates([]);
      setDistance(0);
      if (IS_SIMULATING) {
        startSimulation();
      } else {
        startRealTracking(); // Chamaria o rastreamento real
      }
    }
    setIsRideActive(!isRideActive);
  };

  // ... (o resto do código de renderização permanece o mesmo)
  let content;
  if (isLoadingLocation) {
    content = <ActivityIndicator size="large" color={COLORS.primary} />;
  } else if (region) {
    content = (
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={permissionStatus === 'granted'}
      >
        <Polyline
          coordinates={routeCoordinates}
          strokeColor={COLORS.primary}
          strokeWidth={5}
        />
      </MapView>
    );
  } else {
    content = <Text style={styles.infoText}>Ocorreu um erro ao carregar o mapa.</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Painel Principal</Text>
        {isRideActive && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>Distância: {distance.toFixed(2)} km</Text>
          </View>
        )}
        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      </View>
      <View style={styles.mapContainer}>
        {content}
      </View>
      <TouchableOpacity
        style={[styles.rideButton, isRideActive ? styles.stopButton : styles.startButton]}
        onPress={handleToggleRide}
        disabled={permissionStatus !== 'granted'}
      >
         <Ionicons name="bicycle" size={24} color={isRideActive ? COLORS.white : COLORS.primary} />
         <Text style={[styles.rideButtonText, isRideActive ? styles.stopButtonText : styles.startButtonText]}>
          {isRideActive ? 'Parar Pedalada' : 'Iniciar Pedalada'}
         </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  statsContainer: { marginTop: 10 },
  statsText: { fontSize: 18, color: COLORS.primary },
  errorText: { fontSize: 12, color: COLORS.red, marginTop: 8 },
  mapContainer: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: '100%' },
  infoText: { fontSize: 16, textAlign: 'center', padding: 20, color: COLORS.text },
  rideButton: { position: 'absolute', bottom: 30, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, elevation: 5 },
  startButton: { backgroundColor: COLORS.accent },
  stopButton: { backgroundColor: COLORS.red },
  rideButtonText: { marginLeft: 10, fontSize: 18, fontWeight: 'bold' },
  startButtonText: { color: COLORS.primary },
  stopButtonText: { color: COLORS.white },
});

