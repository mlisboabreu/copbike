import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { primary: '#006400', white: '#FFFFFF', text: '#333333', accent: '#FFD700', background: '#F5F5F5' };

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | undefined>(undefined);

  useEffect(() => {
    // Função auto-executável para pedir permissão e pegar a localização
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('A permissão para acessar a localização foi negada. Por favor, habilite nas configurações do seu celular.');
        return;
      }

      // Pega a localização atual do usuário
      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        // Define a região inicial do mapa com base na localização do usuário
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01, // Zoom do mapa
          longitudeDelta: 0.01, // Zoom do mapa
        });
      } catch (error) {
        setErrorMsg('Não foi possível obter a localização. Verifique se o GPS está ativado.');
        console.error(error);
      }
    })();
  }, []);


  // Renderização condicional baseada no estado
  let content;
  if (errorMsg) {
    // Mostra mensagem de erro
    content = <Text style={styles.infoText}>{errorMsg}</Text>;
  } else if (region) {
    // Mostra o mapa se a localização foi obtida
    content = (
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true} // Mostra o ponto azul padrão do GPS
      />
    );
  } else {
    // Mostra um indicador de carregamento enquanto busca a localização
    content = <ActivityIndicator size="large" color={COLORS.primary} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Painel Principal</Text>
      </View>
      <View style={styles.mapContainer}>
        {content}
      </View>
      <TouchableOpacity style={styles.startButton}>
         <Ionicons name="bicycle" size={24} color={COLORS.primary} />
         <Text style={styles.startButtonText}>Iniciar Pedalada</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0' // Cor de fundo enquanto o mapa carrega
  },
  map: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
    color: COLORS.text,
  },
  startButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    // Sombra
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButtonText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  }
});

