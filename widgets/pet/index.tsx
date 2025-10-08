import { createRoot } from 'react-dom/client';
import '../index.css';

function App() {
  return (
    <div className="antialiased w-full text-black px-4 py-4 border border-black/10 rounded-2xl sm:rounded-3xl overflow-hidden bg-white">
      <div className="flex items-center justify-center">
        <div className="text-8xl">🐣</div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('pet-root')!).render(<App />);
