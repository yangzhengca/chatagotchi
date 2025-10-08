import { createRoot } from 'react-dom/client';
import '../index.css';
import { useOpenAiGlobal } from '../utils/use-openai-global.ts';

function App() {
  const input = useOpenAiGlobal('toolInput');
  const output = useOpenAiGlobal('toolOutput');
  return (
    <div className="antialiased w-full text-black px-4 py-4 border border-black/10 rounded-2xl sm:rounded-3xl overflow-hidden bg-white">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="text-8xl">🐣</div>
        <div className="w-full space-y-2 text-xs">
          <div>
            <div className="font-semibold">Input:</div>
            <pre className="bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(input, null, 2)}
            </pre>
          </div>
          <div>
            <div className="font-semibold">Output:</div>
            <pre className="bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(output, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('pet-root')!).render(<App />);
