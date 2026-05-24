import { create } from 'zustand'

export const MOCK_USER = {
  id: 'mock-001',
  username: 'Agente Teste',
  email: 'teste@arkon.io',
  level: 1,
  faction: 'none',
  class: 'none',
  influence: 150,
  reputation: 80,
}

export const usePlayerStore = create((set) => ({
  player: null,
  setPlayer: (player) => set({ player }),
  clearPlayer: () => set({ player: null }),
}))
