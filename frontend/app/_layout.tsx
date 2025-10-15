import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Isso impede que a tela de splash suma automaticamente antes de estarmos prontos.
// É a chave para a nossa solução.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Este efeito é o coração da nossa lógica de autenticação.
    if (isLoading) {
      // Se ainda estamos na verificação inicial (ex: lendo do armazenamento), não fazemos nada.
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (token && inAuthGroup) {
      // Se o usuário TEM um token e está em uma tela de autenticação (login),
      // nós o redirecionamos para a tela principal.
      router.replace('/(tabs)');
    } else if (!token && !inAuthGroup) {
      // Se o usuário NÃO TEM um token e NÃO ESTÁ nas telas de autenticação,
      // nós o forçamos a ir para a tela de login.
      router.replace('/(auth)/login');
    }

    // A verificação terminou e o redirecionamento (se necessário) foi feito.
    // Agora, e somente agora, podemos esconder a tela de carregamento.
    SplashScreen.hideAsync();

  }, [token, isLoading, segments]);

  // Enquanto a verificação inicial acontece, podemos mostrar um spinner.
  // Graças ao SplashScreen, o usuário não verá esta tela piscar.
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#006400" />
      </View>
    );
  }

  // O Slot renderiza a rota atual (seja a de login ou as abas)
  // depois que o SplashScreen é escondido.
  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}