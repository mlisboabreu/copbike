import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import MapView, { Region, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { haversineDistance } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const COLORS = { primary: '#006400', white: '#FFFFFF', text: '#333333', accent: '#FFD700', background: '#F5F5F5', red: '#D32F2F', gray: '#A9A9A9' };

const API_BASE_URL = 'http://192.160.0.19:8000';

const BELEM_REGION: Region = {
  latitude: -1.4558,
  longitude: -48.5039,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// MODO DE DESENVOLVIMENTO: Mude para 'false' para usar o GPS real
const IS_SIMULATING = true;

// Componente para exibir uma estatística individual
const StatDisplay = ({ value, unit, label }: { value: string; unit: string; label: string }) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>
      {value} <Text style={styles.statUnit}>{unit}</Text>
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);


export default function HomeScreen() {
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isRideActive, setIsRideActive] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Location.LocationObjectCoords[]>([]);
  const [distance, setDistance] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  
  // Novos estados para as estatísticas
  const [speed, setSpeed] = useState(0);
  const [calories, setCalories] = useState(0);
  const [co2Saved, setCo2Saved] = useState(0);
  const [pace, setPace] = useState('0\'00"');
  const [startTime, setStartTime] = useState<number | null>(null);


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
      } finally {
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  const startRealTracking = async () => {
    // ... (O código de rastreamento real permanece aqui para uso futuro)
  };

  const startSimulation = () => {
    if (!region) return;
    
    const startPoint = {
      latitude: region.latitude,
      longitude: region.longitude,
      altitude: null, accuracy: null, altitudeAccuracy: null, heading: null, speed: null,
    };
    setRouteCoordinates([startPoint]);

    simulationInterval.current = setInterval(() => {
      setRouteCoordinates(prevCoords => {
        if (!startTime) return prevCoords;

        const lastCoord = prevCoords[prevCoords.length - 1];
        const newCoord = { ...lastCoord, latitude: lastCoord.latitude + 0.0001 };
        const newCoords = [...prevCoords, newCoord];
        
        const newDistance = distance + haversineDistance(lastCoord, newCoord);
        setDistance(newDistance);
        
        // --- CÁLCULOS EM TEMPO REAL ---
        const elapsedTimeSeconds = (Date.now() - startTime) / 1000;
        const elapsedTimeMinutes = elapsedTimeSeconds / 60;

        // Velocidade (simulada em ~15 km/h)
        const simulatedSpeedKmh = newDistance > 0 ? (newDistance / (elapsedTimeSeconds / 3600)) : 0;
        setSpeed(simulatedSpeedKmh);

        // CO2 evitado
        setCo2Saved(newDistance * 0.15);

        // Calorias (estimativa com base num MET de 8.0 e 70kg de peso)
        setCalories(8.0 * 70 * (elapsedTimeSeconds / 3600));

        // Pace (ritmo)
        if (newDistance > 0) {
            const paceMinPerKm = elapsedTimeMinutes / newDistance;
            const paceMinutes = Math.floor(paceMinPerKm);
            const paceSeconds = Math.round((paceMinPerKm - paceMinutes) * 60);
            setPace(`${paceMinutes}'${paceSeconds.toString().padStart(2, '0')}"`);
        }
        
        mapRef.current?.animateToRegion({
          latitude: newCoord.latitude,
          longitude: newCoord.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        return newCoords;
      });
    }, 2000);
  };

  const stopTracking = async () => {
    // ... (código existente para parar e salvar)
  };

  const handleToggleRide = () => {
    if (isRideActive) {
      stopTracking();
    } else {
      // Reseta todos os estados antes de começar
      setRouteCoordinates([]);
      setDistance(0);
      setSpeed(0);
      setCalories(0);
      setCo2Saved(0);
      setPace('0\'00"');
      setStartTime(Date.now());

      if (IS_SIMULATING) {
        startSimulation();
      } else {
        startRealTracking();
      }
    }
    setIsRideActive(!isRideActive);
  };
  
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
       {/* O painel de estatísticas só aparece durante a pedalada */}
      {isRideActive ? (
        <View style={styles.statsContainer}>
          <StatDisplay value={distance.toFixed(2)} unit="km" label="Distância" />
          <StatDisplay value={speed.toFixed(1)} unit="km/h" label="Velocidade" />
          <StatDisplay value={calories.toFixed(0)} unit="kcal" label="Calorias" />
          <StatDisplay value={co2Saved.toFixed(2)} unit="kg" label="CO₂ Evitado" />
          <StatDisplay value={pace} unit="min/km" label="Pace" />
        </View>
      ) : (
        <View style={styles.header}>
          <Text style={styles.title}>Painel Principal</Text>
          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        </View>
      )}

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
  statsContainer: {
    backgroundColor: COLORS.white,
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statBox: {
    alignItems: 'center',
    width: '30%', // Para caber 3 por linha
    marginVertical: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statUnit: {
    fontSize: 14,
    color: COLORS.gray,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
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

