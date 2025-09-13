import { httpClient } from './config';

async function registerUser() {
  const res = await httpClient.post('/register');
  return res.data;
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

export { getToken };
