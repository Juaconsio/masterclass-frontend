import { httpClient } from './config';
import { jwtDecode } from 'jwt-decode';

// phone no esta entrando como string
async function registerUser(payload: any) {
  try {
    const res = await httpClient.post('auth/register', payload);
    if (res.status == 201) return { ok: true };
    throw new Error('Error en el registro' + res.data?.message);
  } catch (error) {
    return { ok: false };
  }
}

async function validateToken() {
  const existingToken = localStorage.getItem('token');
  if (!existingToken) return null;

  try {
    const decoded: { exp: number } = jwtDecode(existingToken);
    const now = Math.floor(Date.now() / 1000);
    const shouldValidateWithServer = decoded.exp - now < 5 * 60;
    if (!shouldValidateWithServer) {
      return existingToken;
    }
    const resTokenValidate = await httpClient.get('auth/validate');
    if (resTokenValidate.status == 200) return existingToken;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
}

async function getToken(payload: any): Promise<{ ok: boolean; token?: string; message?: string }> {
  const tokenValidation = await validateToken();
  if (tokenValidation) return { ok: true, token: tokenValidation };
  try {
    const res = await httpClient.post('auth/login', payload);
    const userData = JSON.stringify(jwtDecode(res.data.token));
    localStorage.setItem('user', userData);
    localStorage.setItem('token', res.data.token);
    console.log('User data stored in localStorage:', userData);
    return { ok: true, token: res.data.token };
  } catch (error: any) {
    return { ok: false, message: error.response?.data?.message || 'Error desconocido' };
  }
}

export { registerUser, getToken, validateToken };
