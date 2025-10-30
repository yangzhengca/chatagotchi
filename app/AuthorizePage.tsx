'use client';

import { useEffect, useState } from 'react';
import { IdentityProvider } from '@stytch/react';
import { profileId, stytch } from './StytchProvider';
import { redirectToLogin } from './Auth';
import { useAuth } from './AuthContext';

export const AuthorizePage = () => {
  const { user, token, loading, logout } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const attest = async () => {
      if (token && !loading) {
        const hasStytchSession = stytch.session.getInfo().session;
        if (!hasStytchSession) {
          await stytch.session.attest({
            profile_id: profileId,
            token,
            session_duration_minutes: 60,
          });
        }
        setIsReady(true);
      }
    };
    attest();
  }, [loading, token]);

  if (!loading && !user) {
    redirectToLogin(window.location.href);
  }

  if (loading || !isReady) {
    return (
      <div className="flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Preparing OAuth authorization...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <div className="text-gray-500 mb-8 mt-4">If you saw this page for a long time, please click below button to refresh the page.</div>
          <button
            onClick={async () => {
              await logout();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const isProfileScope = (scope: string) => scope === 'openid' || scope === 'email' || scope === 'profile';
  // const isDataScope = (scope: string) => !isProfileScope(scope);

  const getScopeDescription = (scope: string) => {
    switch (scope) {
      case 'openid':
        return 'Your account ID';
      case 'email':
        return 'Your email address';
      case 'profile':
        return 'Your name and profile picture';
      case 'read:data':
        return 'Read access to your data';
      case 'write:data':
        return 'Write access to your data';
      default:
        return `The ${scope} permission`;
    }
  };

  const getManifest = ({ scopes, clientName }: { scopes: string[]; clientName: string }) => [
    {
      header: `${clientName} wants to view your Profile`,
      items: [
        {
          text: 'View information stored in your Profile about your account and your user.',
          details: scopes.filter(isProfileScope).map(getScopeDescription),
        },
      ],
    },
    // {
    //   header: `${clientName} wants to access your Data`,
    //   items: scopes.filter(isDataScope).map(getScopeDescription),
    // },
  ];


  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <h1 className="header">Stytch OAuth Authorization</h1>
          <IdentityProvider
            authTokenParams={{
              trustedAuthToken: token!,
              tokenProfileID: profileId,
            }}
            getIDPConsentManifest={getManifest}
          />
        </div>
      </div>
    </div>
  );
};