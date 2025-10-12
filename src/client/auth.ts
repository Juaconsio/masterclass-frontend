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
    try {
      const resTokenValidate = await httpClient.post('auth/validate', { token: existingToken });
      if (resTokenValidate.status == 200) return { ok: true, token: existingToken };
    } catch (error) {
      // Token inválido o error en la validación, proceder a obtener un nuevo token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  try {
    const res = await httpClient.post('auth/login', payload);
    const userData = JSON.stringify(jwtDecode(res.data.token));
    localStorage.setItem('user', userData);
    localStorage.setItem('token', res.data.token);
    return { ok: true, token: res.data.token };
  } catch (error: any) {
    return { ok: false, message: error.response?.data?.message || 'Error desconocido' };
  }
}

export { registerUser, getToken };
