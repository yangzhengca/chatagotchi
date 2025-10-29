import { useState } from 'react';
import { onLoginComplete } from './Auth';
import { useAuth } from './AuthContext';

// const AUTH_SERVER_URL = 'http://localhost:3001'; // Replace with your auth server URL

export function CustomLogin() {
  const [email, setEmail] = useState('');
  const [loginToken, setLoginToken] = useState('');
  const [step, setStep] = useState<'email' | 'token'>('email');
  const [loading, setLoading] = useState(false);
  // const [localError, setLocalError] = useState('');

  const { genLoginToken, verifyToken, error, setError } = useAuth();

  // const { error, setError } = useAuth();

  const handleSendToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await genLoginToken(email);

      // const response = await fetch(`${AUTH_SERVER_URL}/auth/generate-token`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });

      // const data = await response.json();

      // if (!response.success) {
      //   if (!response.userExist) {
      //     setError('User not found. Please create an account at datalab.biggeo.com');
      //     // Optionally redirect
      //     setTimeout(() => {
      //       window.location.href = 'https://datalab.biggeo.com';
      //     }, 3000);
      //   } else {
      //     setError('Failed to send token. Please try again.');
      //   }
      //   return;
      // }

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
      await verifyToken(email, loginToken);

      // Step 1: Verify token with your auth server
      // const response = await fetch(`${AUTH_SERVER_URL}/auth/verify-token`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, token }),
      // });

      // if (!response.ok) {
      //   throw new Error('Invalid token');
      // }

      // const data = await response.json();

      // Step 2: Store both tokens
      // localStorage.setItem('app_jwt', data.jwt); // Your app JWT
      // localStorage.setItem('stytch_tat', data.stytchJwt); // Stytch jwt
      // localStorage.setItem('user', JSON.stringify(data.user));

      onLoginComplete();

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
          value={loginToken}
          onChange={(e) => setLoginToken(e.target.value)}
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