import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Share, Alert } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = { primary: '#006400', secondary: '#2E8B57', white: '#FFFFFF', text: '#333333', accent: '#FFD700', background: '#F5F5F5', gray: '#A9A9A9' };
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
    <Ionicons name={icon} size={30} color={COLORS.primary} />
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

  const handleShare = async () => {
    if (!profileData) return;
    try {
      const message = `Já evitei ${profileData.total_co2_saved_kg.toFixed(1)} kg de CO₂ pedalando com o app Copbike para a COP30! 🌳🚴 #Copbike #COP30 #PedalePeloClima`;
      await Share.share({
        message: message,
        title: 'Minha conquista no Copbike!',
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível partilhar a sua conquista.');
    }
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
      <LinearGradient
        colors={['#ffffff', '#f0f0f0']}
        style={styles.header}
      >
        <Ionicons name="person-circle" size={80} color={COLORS.primary} />
        <Text style={styles.username}>{profileData.username}</Text>
      </LinearGradient>

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

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social" size={20} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Partilhar Conquista</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
           <Ionicons name="log-out-outline" size={20} color={COLORS.text} />
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  username: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginTop: -10,
  },
  statCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  list: {
    paddingHorizontal: 20,
  },
  rideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  rideInfo: { flex: 1, marginLeft: 15 },
  rideDate: { fontSize: 14, color: COLORS.gray },
  rideDistance: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  rideCo2: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
  emptyText: { textAlign: 'center', color: COLORS.gray, marginTop: 20 },
  actionsContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: COLORS.white,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    padding: 15,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});

