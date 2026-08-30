import { GameProvider } from './context/GameContext';
import { GameLayout } from './components/layout/GameLayout';

export default function App() {
  return (
    <GameProvider>
      <GameLayout />
    </GameProvider>
  );
}
