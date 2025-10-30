import { useState } from 'react';
import { onLoginComplete } from './Auth';
import { useAuth } from './AuthContext';
import BigGeoLogo from './BigGeoLogo';

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
      <div className="w-full flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-200">
            {/* Logo/Brand Section */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 sm:mb-6 shadow-lg">
                {/* <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg> */}
                <BigGeoLogo />
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight">Welcome Back</h2>
              <p className="text-gray-600 text-base sm:text-lg">Sign in to continue to BigGeo</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSendToken} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white shadow-sm hover:border-gray-400"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm flex items-start gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 sm:py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Login Token
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Footer Info */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                By signing in, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Terms</a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-200">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 sm:mb-6 shadow-lg animate-pulse">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight">Check Your Email</h2>
            <p className="text-gray-600 text-sm sm:text-base mb-2">
              We've sent a verification token to
            </p>
            <div className="inline-flex items-center gap-2 bg-blue-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold text-gray-900 text-xs sm:text-sm break-all">{email}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleVerifyToken} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="token" className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                Enter Verification Token
              </label>
              <input
                id="token"
                type="text"
                placeholder="000000"
                value={loginToken}
                onChange={(e) => setLoginToken(e.target.value)}
                required
                maxLength={6}
                className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-300 text-center text-2xl sm:text-3xl font-mono tracking-[0.3em] sm:tracking-[0.5em] font-bold bg-white shadow-sm hover:border-gray-400"
              />
              <p className="text-xs text-gray-500 text-center mt-2">Enter the 6-digit code from your email</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm flex items-start gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 sm:py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verify & Sign In
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 sm:py-3 px-4 rounded-xl transition-all duration-200 border border-gray-300 hover:border-gray-400 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Email
              </button>
            </div>
          </form>

          {/* Resend hint */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-center">Didn't receive the email? Check your spam folder</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}