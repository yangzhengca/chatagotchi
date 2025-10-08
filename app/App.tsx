import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StytchProvider } from '@stytch/react';
import { StytchUIClient } from '@stytch/vanilla-js';
import Home from './Home';
import { Login, Authorize, Authenticate } from './Auth';

const stytch = new StytchUIClient(
  import.meta.env.VITE_STYTCH_PUBLIC_TOKEN ?? ''
);

function App() {
  return (
    <StytchProvider stytch={stytch}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/authenticate" element={<Authenticate />} />
          <Route path="/oauth/authorize" element={<Authorize />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </StytchProvider>
  );
}

export default App;
