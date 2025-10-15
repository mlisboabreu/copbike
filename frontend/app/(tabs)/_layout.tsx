import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Cores para a barra de abas
const COLORS = {
  primary: '#006400',
  gray: '#A9A9A9',
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Esconde o título no topo de cada tela
        tabBarActiveTintColor: COLORS.primary, // Cor do ícone ativo
        tabBarInactiveTintColor: COLORS.gray,   // Cor do ícone inativo
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 65,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index" // Refere-se ao arquivo index.tsx
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile" // Refere-se ao arquivo profile.tsx
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}