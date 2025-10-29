'use client';

import { ReactNode } from 'react';
import { StytchProvider as ProviderActual } from '@stytch/react';
import { StytchUIClient } from '@stytch/vanilla-js';

export const stytch = new StytchUIClient(
  import.meta.env.VITE_STYTCH_PUBLIC_TOKEN ?? ''
);

export const profileId = import.meta.env.VITE_STYTCH_PROFILE_ID ?? ''

export const authServerUrl = import.meta.env.VITE_AUTH_SERVER_URL ?? '';

const StytchProvider = ({ children }: { children: ReactNode }) => {
  return <ProviderActual stytch={stytch}>{children}</ProviderActual>;
};

export default StytchProvider;