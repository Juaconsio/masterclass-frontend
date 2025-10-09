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

// falta ver caso de credenciales incorrectas
async function getToken(payload: any): Promise<{ ok: boolean; token?: string; message?: string }> {
  const existingToken = localStorage.getItem('token');
  if (existingToken) {
    return { ok: true, token: existingToken };
  }
  try {
    const res = await httpClient.post('auth/login', payload);
    if (res.status == 200 && res.data?.token) {
      const userData = JSON.stringify(jwtDecode(res.data.token));
      localStorage.setItem('user', userData);
      localStorage.setItem('token', res.data.token);
      return { ok: true, token: res.data.token };
    }
    return { ok: false, message: res.data?.message };
  } catch (error: any) {
    return { ok: false };
  }
}

export { registerUser, getToken };
