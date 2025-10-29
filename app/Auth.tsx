import {
  OAuthProviders,
  OTPMethods,
  Products,
  StytchEvent,
  StytchLoginConfig,
  parseOAuthAuthorizeParams,
} from '@stytch/vanilla-js';
import { StytchLogin, useStytch, useStytchUser } from '@stytch/react';
import { useEffect, useMemo, useState } from 'react';
import { CustomLogin } from './CustomLogin';

/**
 * A higher-order component that enforces a login requirement for the wrapped component.
 * If the user is not logged in, the user is redirected to the login page and the
 * current URL is stored in localStorage to enable return after authentication.
 */
export const withLoginRequired = (Component: React.FC) => () => {
  const { user, fromCache } = useStytchUser();

  useEffect(() => {
    if (!user && !fromCache) {
      localStorage.setItem('returnTo', window.location.href);
      window.location.href = '/login';
    }
  }, [user, fromCache]);

  if (!user) {
    return null;
  }
  return <Component />;
};

/**
 * The other half of the withLoginRequired flow
 * Redirects the user to a specified URL stored in local storage or a default location.
 * Behavior:
 * - Checks for a `returnTo` entry in local storage to determine the redirection target.
 * - If `returnTo` exists, clears its value from local storage and navigates to the specified URL.
 * - If `returnTo` does not exist, redirects the user to the default '/home' location.
 */
export const onLoginComplete = () => {
  const returnTo = localStorage.getItem('returnTo');
  if (returnTo) {
    localStorage.setItem('returnTo', '');
    window.location.href = returnTo;
  } else {
    window.location.href = '/home';
  }
};

// If the user is unauthenticated, store the full location to return to
// query parameters and all
export const redirectToLogin = (returnState: string) => {
  localStorage.setItem('returnTo', returnState);
  window.location.href = '/login'
}

/**
 * The Login page implementation. Wraps the StytchLogin UI component.
 * View all configuration options at https://stytch.com/docs/sdks/ui-configuration
 */
export function Login() {
  // const loginConfig = useMemo<StytchLoginConfig>(
  //   () => ({
  //     products: [Products.otp, Products.oauth],
  //     otpOptions: {
  //       expirationMinutes: 10,
  //       methods: [OTPMethods.Email],
  //     },
  //     oauthOptions: {
  //       providers: [{ type: OAuthProviders.Google }],
  //       loginRedirectURL: window.location.origin + '/authenticate',
  //       signupRedirectURL: window.location.origin + '/authenticate',
  //     },
  //   }),
  //   []
  // );

  // const handleOnLoginComplete = (evt: StytchEvent) => {
  //   if (evt.type !== 'AUTHENTICATE_FLOW_COMPLETE') return;
  //   onLoginComplete();
  // };

  return <>
    {/* <StytchLogin
      config={loginConfig}
      callbacks={{ onEvent: handleOnLoginComplete }}
    /> */}
    <CustomLogin />
  </>;
}

/**
 * The OAuth Authorization page implementation with custom whimsical UI
 */
export const Authorize = withLoginRequired(function () {
  const stytch = useStytch();
  const [loading, setLoading] = useState(true);
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse OAuth params from URL
  const params = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return parseOAuthAuthorizeParams(searchParams).result;
  }, []);

  // Call oauthAuthorizeStart on mount to get client info
  useEffect(() => {
    const fetchAuthInfo = async () => {
      try {
        const response = await stytch.idp.oauthAuthorizeStart({
          ...params,
          response_type: 'code',
        });
        setAuthInfo(response);
      } catch (err) {
        console.error('OAuth authorize start failed:', err);
        setError('Failed to load authorization details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAuthInfo();
  }, [stytch, params]);

  const handleConsent = async (granted: boolean) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await stytch.idp.oauthAuthorizeSubmit({
        ...params,
        response_type: 'code',
        consent_granted: granted,
      });
      window.location.href = response.redirect_uri;
    } catch (err) {
      console.error('OAuth authorize submit failed:', err);
      setError('Oops! Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        {/* <div className="text-8xl animate-spin">🐣</div> */}
        <p className="mt-4 text-xl text-gray-600">
          Loading authorization request...
        </p>
      </div>
    );
  }

  if (error && !authInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-6xl mb-4">😢</div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          Authorization Error
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative p-8 overflow-hidden">
      {/* Consent Card */}
      <div className="relative max-w-2xl mx-auto bg-white rounded-3xl p-8 border-4 border-purple-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {authInfo?.client_name || 'ChatGPT'} wants to connect!
          </h1>
          <p className="text-lg text-gray-600">
            Allow access to your BigGeo MCP Server account
          </p>
        </div>

        {/* Permissions Section */}
        <div className="bg-purple-50 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">🔐</span>
            This will allow {authInfo?.client_name || 'the app'} to:
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className='ml-5'>
                <div className="font-semibold text-gray-800">
                  Access your email address
                </div>
                <div className="text-sm text-gray-600">
                  We'll use this to send you important updates
                </div>
              </div>
            </li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => handleConsent(true)}
            disabled={submitting}
            className="flex-1 px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {submitting ? 'Authorizing...' : 'Allow'}
          </button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Your data is safe! We'll never share your data without
          permission.
        </p>
      </div>
    </div>
  );
});

/**
 * The Authentication callback page implementation. Handles completing the login flow after OAuth
 */
export function Authenticate() {
  const client = useStytch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) return;

    client.oauth
      .authenticate(token, { session_duration_minutes: 60 })
      .then(onLoginComplete);
  }, [client]);

  return <>Loading...</>;
}

export const Logout = function () {
  const stytch = useStytch();
  const { user } = useStytchUser();

  if (!user) return null;
  const handleLogout = () => {
    localStorage.setItem('app_jwt', ""); // Your app JWT
    localStorage.setItem('stytch_tat', ""); // Stytch jwt
    localStorage.setItem('returnTo', "");
    localStorage.setItem('user', "");
    stytch.session.revoke();

  };

  return (
    <button
      className="ml-2 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 underline"
      onClick={handleLogout}
    >
      Log Out
    </button>
  );
};
