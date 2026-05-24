import { useState } from 'react'
import { usePlayerStore } from './stores/playerStore'
import LoginScreen from './components/LoginScreen'
import MenuScreen from './components/MenuScreen'
import CharacterCreate from './components/CharacterCreate'

export default function App() {
  const { player, setPlayer, clearPlayer } = usePlayerStore()
  const [screen, setScreen] = useState('menu') // 'menu' | 'character-create'

  if (!player) return <LoginScreen onLogin={(p) => { setPlayer(p); setScreen('menu') }} />

  if (screen === 'character-create')
    return (
      <CharacterCreate
        player={player}
        onComplete={(updated) => { setPlayer(updated); setScreen('menu') }}
        onBack={() => setScreen('menu')}
      />
    )

  return (
    <MenuScreen
      player={player}
      onLogout={clearPlayer}
      onNavigate={setScreen}
    />
  )
}
