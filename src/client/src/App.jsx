import { usePlayerStore } from './stores/playerStore'
import LoginScreen from './components/LoginScreen'
import MenuScreen from './components/MenuScreen'

export default function App() {
  const { player, setPlayer, clearPlayer } = usePlayerStore()

  if (!player) return <LoginScreen onLogin={setPlayer} />
  return <MenuScreen player={player} onLogout={clearPlayer} />
}
