import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Link, useRouter } from 'expo-router'; // Importar Link e useRouter

const COLORS = { primary: '#006400', background: '#F5F5F5', text: '#333333', white: '#FFFFFF', gray: '#A9A9A9' };
const FONT_SIZES = { body: 16 };

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter(); // Hook para navegação

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login(username, password);
      // O redirecionamento após o login é gerido pelo AuthContext/_layout
    } catch (e) {
      // O Alert de erro já é mostrado no AuthContext
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        <Text style={styles.title}>copbike</Text>
        <Text style={styles.subtitle}>Bem-vindo à COP30 sobre duas rodas</Text>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Utilizador</Text>
          <TextInput
            placeholder="Digite seu nome de utilizador"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <Text style={styles.label}>Senha</Text>
          <TextInput
            placeholder="Digite sua senha"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'A entrar...' : 'Entrar'}</Text>
          </TouchableOpacity>
        </View>

        {/* A CORREÇÃO ESTÁ AQUI */}
        <Link href="/(auth)/register" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}>Não tem uma conta? Cadastre-se</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  formContainer: { width: '100%', marginTop: 40, marginBottom: 20 },
  label: { // Estilo para as novas etiquetas
    fontSize: 14,
    color: COLORS.primary, // Alterado para a cor primária para maior contraste
    marginBottom: 5,
    fontWeight: '500',
    alignSelf: 'flex-start',
  },
  input: { backgroundColor: COLORS.white, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: COLORS.gray, fontSize: FONT_SIZES.body },
  button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: COLORS.gray },
  buttonText: { color: COLORS.white, fontSize: FONT_SIZES.body, fontWeight: 'bold' },
  title: { fontSize: 48, fontWeight: 'bold', color: COLORS.primary },
  subtitle: { fontSize: 16, color: COLORS.text, marginTop: 8, textAlign: 'center' },
  linkText: { color: COLORS.primary, fontSize: 16, marginTop: 10 },
});

