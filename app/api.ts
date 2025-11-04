import axios, { AxiosResponse } from 'axios';
import { authServerUrl } from './StytchProvider';

interface GenLoginCodeResponse {
  email: string;
  success: boolean;
  userExist: boolean;
}

interface VerifyTokenResponse {
  jwt: string;
  stytchJwt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    img?: string;
  };
}

const api = axios.create({
  baseURL: authServerUrl,
  headers: {
    'Content-Type': 'application/json',
    'x-client-id': 'mcp',
  },
});

export const authApi = {
  genLoginCode: async (email: string): Promise<GenLoginCodeResponse> => {
    const response: AxiosResponse<GenLoginCodeResponse> = await api.post(
      '/auth/generate-token',
      {
        email,
      }
    );
    return response.data;
  },
  verifyToken: async (
    email: string,
    token: string
  ): Promise<VerifyTokenResponse> => {
    const response: AxiosResponse<VerifyTokenResponse> = await api.post(
      '/auth/verify-token',
      {
        email,
        token,
      }
    );
    return response.data;
  },
};
