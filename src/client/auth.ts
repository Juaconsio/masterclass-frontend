import { httpClient } from './config';

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
    localStorage.setItem('token', res.data.token);
    return { ok: true, token: res.data.token };
  } catch (error: any) {
    return { ok: false };
  }
}

export { registerUser, getToken };
