import React, { createContext, useState, useContext, useEffect, PropsWithChildren } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';

// IMPORTANTE: Mantenha o IP correto do seu backend
const API_BASE_URL = 'http://192.168.0.17:8000';

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
  const [isLoading, setIsLoading] = useState(true); // Usado para a verificação inicial

  useEffect(() => {
    // Em um app real, aqui verificaríamos se um token já está salvo no celular
    setIsLoading(false); // Finaliza a "verificação" inicial
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login/`, {
        username,
        password,
      });
      const newToken = response.data.key;
      setToken(newToken);
      // Aqui, no futuro, salvaremos o token no armazenamento do celular
    } catch (error) {
      console.error('Erro no login:', error.response?.data || error.message);
      Alert.alert('Erro no Login', 'Usuário ou senha inválidos.');
      throw new Error('Falha no login');
    }
  };

  const logout = () => {
    setToken(null);
    // Aqui, no futuro, limparíamos o token salvo
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

