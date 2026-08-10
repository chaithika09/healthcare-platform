import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user, token, refreshToken) => {
    await AsyncStorage.multiSet([
      ['token', token || ''],
      ['user', JSON.stringify(user)],
      ['refreshToken', refreshToken || ''],
    ]);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['token', 'user', 'refreshToken']);
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: async () => {
    try {
      const [[, token], [, userStr]] = await AsyncStorage.multiGet(['token', 'user']);
      if (token && userStr) {
        set({ user: JSON.parse(userStr), token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
}));
