import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

const COLORS = { primary: '#006400', background: '#F5F5F5', text: '#333333', white: '#FFFFFF', gray: '#A9A9A9', red: '#D32F2F' };
const API_BASE_URL = 'http://192.168.0.19:8000'; // IP correto

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !email || !password || !password2) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    if (password !== password2) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/registration/`, {
        username,
        email,
        password1: password,
        password2,
      });

      Alert.alert(
        'Registo Concluído!',
        'A sua conta foi criada com sucesso. Por favor, faça login.',
        [{ text: 'OK', onPress: () => router.back() }]
      );

    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = 'Ocorreu um erro ao tentar registar.';
      if (errorData) {
        if (errorData.username) errorMessage = `Nome de utilizador: ${errorData.username[0]}`;
        else if (errorData.email) errorMessage = `Email: ${errorData.email[0]}`;
        else if (errorData.password) errorMessage = `Senha: ${errorData.password[0]}`;
      }
      
      console.error('Erro no registo:', errorData || error.message);
      Alert.alert('Erro no Registo', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Junte-se ao movimento Copbike</Text>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Nome de utilizador</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Text style={styles.label}>Confirme a senha</Text>
          <TextInput
            style={styles.input}
            value={password2}
            onChangeText={setPassword2}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'A registar...' : 'Registar'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Já tem uma conta? Faça login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  formContainer: { width: '100%', marginTop: 40, marginBottom: 20 },
  label: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 5,
    fontWeight: '500',
    alignSelf: 'flex-start',
  },
  input: { backgroundColor: COLORS.white, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: COLORS.gray, fontSize: 16 },
  button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: COLORS.gray },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.text, textAlign: 'center' },
  linkText: { color: COLORS.primary, fontSize: 16, marginTop: 10 },
});