import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { primary: '#006400', white: '#FFFFFF', text: '#333333', accent: '#FFD700', background: '#F5F5F5', gray: '#A9A9A9' };
const API_BASE_URL = 'http://192.168.0.19:8000';

// Tipos para os dados que vêm da API
type RideHistory = {
  id: number;
  start_time: string;
  distance_km: number;
  co2_saved_kg: number;
};

type ProfileData = {
  username: string;
  email: string;
  total_distance_km: number;
  total_co2_saved_kg: number;
  rides: RideHistory[];
};

// Componente para o cartão de estatísticas
const StatCard = ({ icon, value, label }: { icon: any; value: string; label: string }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={24} color={COLORS.primary} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// Componente para um item do histórico de pedaladas
const RideHistoryItem = ({ item }: { item: RideHistory }) => {
  const rideDate = new Date(item.start_time).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
  return (
    <View style={styles.rideItem}>
      <Ionicons name="bicycle-outline" size={24} color={COLORS.primary} />
      <View style={styles.rideInfo}>
        <Text style={styles.rideDate}>{rideDate}</Text>
        <Text style={styles.rideDistance}>{item.distance_km.toFixed(2)} km</Text>
      </View>
      <Text style={styles.rideCo2}>{item.co2_saved_kg.toFixed(2)} kg CO₂</Text>
    </View>
  );
};

export default function ProfileScreen() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { token, logout } = useAuth();

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/profile/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      setProfileData(response.data);
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProfile();
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.centerContainer}>
        <Text>Não foi possível carregar os dados do perfil.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle" size={60} color={COLORS.primary} />
        <Text style={styles.username}>{profileData.username}</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard icon="bicycle" value={profileData.total_distance_km.toFixed(1)} label="Km Totais" />
        <StatCard icon="leaf" value={profileData.total_co2_saved_kg.toFixed(1)} label="CO₂ Evitado (kg)" />
      </View>

      <Text style={styles.historyTitle}>Histórico de Pedaladas</Text>

      <FlatList
        data={profileData.rides.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())}
        renderItem={({ item }) => <RideHistoryItem item={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Você ainda não tem pedaladas registadas.</Text>}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '45%',
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  list: {
    paddingHorizontal: 20,
  },
  rideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  rideInfo: {
    flex: 1,
    marginLeft: 15,
  },
  rideDate: {
    fontSize: 14,
    color: COLORS.gray,
  },
  rideDistance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  rideCo2: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray,
    marginTop: 20,
  },
  logoutButton: {
    margin: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

