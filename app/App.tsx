import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import { Login, Authorize, Authenticate } from './Auth';
import StytchProvider from './StytchProvider';
import { AuthorizePage } from './AuthorizePage';

function App() {
  return (
    <StytchProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/authenticate" element={<Authenticate />} />
          {/* <Route path="/oauth/authorize" element={<Authorize />} /> */}
          <Route path="/oauth/authorize" element={<AuthorizePage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </StytchProvider>
  );
}

export default App;
