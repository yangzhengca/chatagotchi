import { createRoot } from 'react-dom/client';
import '../index.css';
import { useOpenAiGlobal } from '../utils/use-openai-global.ts';
import type { PetState } from './types';

const PET_EMOJIS = {
  BABY: '🐣',
  CHILD: '🐥',
  ADULT: '🐔',
  DEAD: '💀',
  COMPLETE: '🏆',
};

function App() {
  const input = useOpenAiGlobal('toolInput');
  const output = useOpenAiGlobal('toolOutput');

  const petState = output?.petState as PetState | undefined;
  const action = input?.action as string | undefined;

  // Show action feedback
  const actionEmoji = action === 'feed' ? '🍔' : action === 'play' ? '🎮' : null;

  return (
    <div className="antialiased w-full text-black px-4 py-4 border border-black/10 rounded-2xl sm:rounded-3xl overflow-hidden bg-white">
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Pet Display */}
        <div className="flex items-center gap-2">
          <div className="text-8xl">
            {petState ? PET_EMOJIS[petState.state] : '❓'}
          </div>
          {actionEmoji && (
            <div className="text-4xl animate-bounce">{actionEmoji}</div>
          )}
        </div>

        {/* Pet Info */}
        {petState && (
          <div className="w-full space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{petState.name}</div>
              <div className="text-sm text-gray-600">{petState.state}</div>
            </div>

            {/* Stats */}
            {petState.state !== 'DEAD' && petState.state !== 'COMPLETE' && (
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>🍔 Hunger</span>
                    <span className="font-mono">{Math.round(petState.hunger)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        petState.hunger > 50
                          ? 'bg-green-500'
                          : petState.hunger > 20
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${petState.hunger}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>😊 Happiness</span>
                    <span className="font-mono">{Math.round(petState.happiness)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        petState.happiness > 50
                          ? 'bg-blue-500'
                          : petState.happiness > 20
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${petState.happiness}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Game Over Messages */}
            {petState.state === 'DEAD' && (
              <div className="text-center p-4 bg-red-100 rounded-lg">
                <div className="text-lg font-bold">Game Over</div>
                <div className="text-sm">Your pet has died from neglect</div>
              </div>
            )}

            {petState.state === 'COMPLETE' && (
              <div className="text-center p-4 bg-yellow-100 rounded-lg">
                <div className="text-lg font-bold">Congratulations!</div>
                <div className="text-sm">Your pet has grown up successfully!</div>
              </div>
            )}
          </div>
        )}

        {!petState && (
          <div className="text-center text-gray-500">
            <div className="text-sm">No pet found</div>
            <div className="text-xs">Start a new game to get started</div>
          </div>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('pet-root')!).render(<App />);
