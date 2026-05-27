import { useState } from 'react'
import { usePlayerStore } from './stores/playerStore'
import LoginScreen from './components/LoginScreen'
import MenuScreen from './components/MenuScreen'
import CharacterCreate from './components/CharacterCreate'
import FactionScreen from './components/FactionScreen'
import CharacterSelect from './components/CharacterSelect'
import GameCanvas from './components/GameCanvas'

export default function App() {
  const { player, setPlayer, clearPlayer } = usePlayerStore()
  const [screen,    setScreen]    = useState('menu')
  const [character, setCharacter] = useState('varen')

  if (!player)
    return <LoginScreen onLogin={(p) => { setPlayer(p); setScreen('menu') }} />

  if (screen === 'character-select')
    return (
      <CharacterSelect
        player={player}
        onSelect={(charId) => { setCharacter(charId); setScreen('game') }}
      />
    )

  if (screen === 'game')
    return (
      <GameCanvas
        player={player}
        character={character}
        onBack={() => setScreen('menu')}
      />
    )

  if (screen === 'character-create')
    return (
      <CharacterCreate
        player={player}
        onComplete={(updated) => { setPlayer(updated); setScreen('menu') }}
        onBack={() => setScreen('menu')}
      />
    )

  if (screen === 'factions')
    return (
      <FactionScreen
        player={player}
        onUpdate={(updated) => setPlayer(updated)}
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
