import { httpClient } from './config';
import { jwtDecode } from 'jwt-decode';

// phone no esta entrando como string
async function registerUser(payload: any) {
  const res = await httpClient.post('auth/register', payload);
  return { ok: true };
}

// falta ver caso de credenciales incorrectas
async function getToken(payload: any) {
  const existingToken = localStorage.getItem('token');
  if (existingToken) {
    return { ok: true, token: existingToken };
  }
  try {
    const res = await httpClient.post('auth/login', payload);
    if (res.status == 200) {
      const userData = JSON.stringify(jwtDecode(res.data.token));
      localStorage.setItem('user', userData);
      return { ok: true };
    }
    return { ok: false, message: res.data?.message };
  } catch (error: any) {
    return { ok: false };
  }
}

export { registerUser, getToken };
