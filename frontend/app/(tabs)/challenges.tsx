import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const COLORS = { primary: '#006400', white: '#FFFFFF', text: '#333333', accent: '#FFD700', background: '#F5F5F5', gray: '#A9A9A9' };
const API_BASE_URL = 'http://192.168.0.19:8000';

type Challenge = {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location_name: string;
};

// Componente para exibir um único desafio
const ChallengeCard = ({ item }: { item: Challenge }) => {
  // Formata a data para um formato mais legível
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Ionicons name="leaf-outline" size={24} color={COLORS.primary} />
        <Text style={styles.cardTitle}>{item.title}</Text>
      </View>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.footerInfo}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
          <Text style={styles.footerText}>
            {formatDate(item.start_date)} - {formatDate(item.end_date)}
          </Text>
        </View>
        <View style={styles.footerInfo}>
          <Ionicons name="location-outline" size={16} color={COLORS.gray} />
          <Text style={styles.footerText}>{item.location_name}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.participateButton}>
        <Text style={styles.buttonText}>Participar</Text>
      </TouchableOpacity>
    </View>
  );
};


export default function ChallengesScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const fetchChallenges = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/challenges/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      setChallenges(response.data);
    } catch (err) {
      console.error("Erro ao buscar desafios:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchChallenges();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Desafios Comunitários</Text>
      </View>
      <FlatList
        data={challenges}
        renderItem={({ item }) => <ChallengeCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum desafio disponível no momento.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  list: { paddingHorizontal: 20 },
  emptyText: { textAlign: 'center', marginTop: 50, color: COLORS.gray },
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 10,
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
    marginBottom: 15,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 12,
    color: COLORS.gray,
  },
  participateButton: {
    marginTop: 15,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
