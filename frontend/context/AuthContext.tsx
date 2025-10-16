import React, { createContext, useState, useContext, useEffect, PropsWithChildren } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'copbike-auth-token'; // Chave para guardar o token
const API_BASE_URL = 'http://192.168.0.19:8000';

interface AuthContextType {
  token: string | null;
  login: (username, password) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Função que corre quando o app inicia para verificar se já existe um token guardado
    async function loadToken() {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (e) {
        console.error("Erro ao carregar o token:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadToken();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login/`, {
        username,
        password,
      });
      const newToken = response.data.key;
      setToken(newToken);
      // Guarda o novo token no armazenamento seguro
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    } catch (error) {
      console.error('Erro no login:', error.response?.data || error.message);
      Alert.alert('Erro no Login', 'Utilizador ou senha inválidos.');
      throw new Error('Falha no login');
    }
  };

  const logout = async () => {
    setToken(null);
    // Apaga o token do armazenamento seguro
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  };

  const value = {
    token,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

