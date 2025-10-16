import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const COLORS = { primary: '#006400', white: '#FFFFFF', text: '#333333', accent: '#FFD700', background: '#F5F5F5', gray: '#A9A9A9' };
const API_BASE_URL = 'http://192.168.0.19:8000'; // IP correto que você confirmou

// Definimos um tipo para os dados do ranking para ajudar o TypeScript
type RankingItem = {
  user_id: number;
  username: string;
  total_distance_km: number;
};

export default function RankingScreen() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { token } = useAuth(); // Assume-se que o AuthContext também exporta o username ou id do utilizador
  
  // O username 'teste' é um placeholder. Numa app real, obteríamos o username do AuthContext.
  const currentUsername = 'teste'; 

  const fetchRanking = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/ranking/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      setRanking(response.data);
      setError(null); // Limpa erros anteriores em caso de sucesso
    } catch (err) {
      setError('Não foi possível carregar o ranking. Tente novamente.');
      console.error("Erro ao buscar ranking:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // useFocusEffect é um hook do Expo Router que executa sempre que a tela fica em foco
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchRanking();
    }, [])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchRanking();
  };

  const renderItem = ({ item, index }: { item: RankingItem, index: number }) => (
    <View style={[styles.itemContainer, item.username === currentUsername && styles.userItem]}>
      <Text style={styles.position}>{index + 1}º</Text>
      <Ionicons name="person-circle-outline" size={24} color={COLORS.primary} style={styles.avatar} />
      <Text style={styles.username}>{item.username}</Text>
      <Text style={styles.distance}>{item.total_distance_km.toFixed(1)} km</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ranking Semanal</Text>
      </View>
      <FlatList
        data={ranking}
        renderItem={renderItem}
        keyExtractor={(item) => item.user_id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Ainda não há dados no ranking. Comece a pedalar!</Text>}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, padding: 20 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  userItem: {
    backgroundColor: '#FFFBEA', // Um amarelo claro para destacar
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  position: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gray,
    width: 35,
  },
  avatar: {
    marginRight: 10,
  },
  username: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  distance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: COLORS.gray,
  }
});

