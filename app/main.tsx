import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main>
      <App />
    </main>
  </StrictMode>
);

if (import.meta.env.DEV) {
  createRoot(document.getElementById('dev')!).render(
    <div className="fixed bottom-0 left-0 right-0 z-50 m-6 p-4 border-2 rounded-lg">
      <h1 className="font-bold">[[Dev Mode]] Embeddable Component Links</h1>
      <ul className="list-disc list-inside">
        <li>
          <a href="/widgets/pet">🔗 Pet</a>
        </li>
        <li>
          <a href="/widgets/achievements">🔗 Achievements</a>
        </li>
      </ul>
    </div>
  );
}
