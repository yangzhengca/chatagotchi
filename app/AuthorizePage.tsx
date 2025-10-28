'use client';

import { useEffect, useState } from 'react';
import { IdentityProvider } from '@stytch/react';
import { profileId } from './StytchProvider';
import { verifyStytchSession } from './CustomLogin';

export const AuthorizePage = () => {
  const [token, setToken] = useState<string | null>(null);

  const appJwt = localStorage.getItem('app_jwt');

  useEffect(() => {
    const checkAuthentication = async () => {
      if (typeof window === 'undefined') return;

      if (appJwt) {
        const stytchJwt = await verifyStytchSession(appJwt);
        setToken(stytchJwt);
      }

    };

    checkAuthentication();
  }, [appJwt]);

  //this will be triggerred while not signed in before
  if (!token) {
    return null;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <h1 className="header">Stytch OAuth Authorization</h1>
          <IdentityProvider
            authTokenParams={{
              trustedAuthToken: token,
              tokenProfileID: profileId,
            }}
          />
        </div>
      </div>
    </div>
  );
};