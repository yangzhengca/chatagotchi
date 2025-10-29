import axios, { AxiosResponse } from 'axios';

const AUTH_SERVER_URL = 'http://localhost:3001';

interface GenLoginCodeResponse {
  email: string;
  success: boolean;
  userExist: boolean;
}

interface VerifyTokenResponse {
  jwt: string;
  stytchJwt: string;
  profileId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    img?: string;
  };
}

const api = axios.create({
  baseURL: AUTH_SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
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
  verifyToken: async (email: string, token: string): Promise<VerifyTokenResponse> => {
    const response: AxiosResponse<VerifyTokenResponse> = await api.post(
      '/auth/verify-token',
      {
        email,
        token,
      }
    );
    return response.data;
  }
};
