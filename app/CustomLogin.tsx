import { useState } from 'react';

const AUTH_SERVER_URL = 'http://localhost:3001'; // Replace with your auth server URL

export async function verifyStytchSession(appJwt: string): Promise<string> {
  const response = await fetch(`${AUTH_SERVER_URL}/auth/generate-stytch-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', "authorization": `Bearer ${appJwt}` },
  }).then(async (res) => {
    if (!res.ok) {
      throw new Error('Failed to verify Stytch session');
    }
    return res;
  });
  const data = await response.json();
  return data.stytchJwt;
}

export function CustomLogin() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'email' | 'token'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${AUTH_SERVER_URL}/auth/generate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        if (!data.userExist) {
          setError('User not found. Please create an account at datalab.biggeo.com');
          // Optionally redirect
          setTimeout(() => {
            window.location.href = 'https://datalab.biggeo.com';
          }, 3000);
        } else {
          setError(data.message || 'Failed to send token');
        }
        return;
      }

      setStep('token');
    } catch (err) {
      setError('Failed to send token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Verify token with your auth server
      const response = await fetch(`${AUTH_SERVER_URL}/auth/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      const data = await response.json();

      // Step 2: Store both tokens
      localStorage.setItem('app_jwt', data.jwt); // Your app JWT
      localStorage.setItem('stytch_session', data.stytchJwt); // Stytch jwt
      localStorage.setItem('user', JSON.stringify(data.user));

      const returnTo = localStorage.getItem('returnTo');
      // Redirect to app
      window.location.href = returnTo || '/';
    } catch (err) {
      setError('Invalid token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'email') {
    return (
      <div className="login-container">
        <h2>Sign In</h2>
        <form onSubmit={handleSendToken}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Login Token'}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h2>Verify Token</h2>
      <p>Check your email for the login token</p>
      <form onSubmit={handleVerifyToken}>
        <input
          type="text"
          placeholder="Enter token from email"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify & Sign In'}
        </button>
        {error && <p className="error">{error}</p>}
        <button type="button" onClick={() => setStep('email')}>
          Back to email
        </button>
      </form>
    </div>
  );
}