import { httpClient } from './config';
import { jwtDecode } from 'jwt-decode';
import type { UserRole } from '../interfaces/enums';

async function registerUser(payload: any) {
  try {
    const res = await httpClient.post('auth/register', payload);
    if (res.status === 201) return { ok: true };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al registrar usuario');
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

async function getToken(payload: {
  email: string;
  password: string;
  accountType: UserRole;
}): Promise<{ ok: boolean; token?: string; message?: string }> {
  const tokenValidation = await validateToken();
  if (tokenValidation) return { ok: true, token: tokenValidation };
  try {
    const res = await httpClient.post('auth/login', payload);
    const userData = JSON.stringify(jwtDecode(res.data.token));
    localStorage.setItem('user', userData);
    localStorage.setItem('token', res.data.token);
    return { ok: true, token: res.data.token };
  } catch (error: any) {
    return {
      ok: false,
      message: error.response?.data?.message,
    };
  }
}

async function updatePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  try {
    await httpClient.patch('auth/change-password', payload);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al actualizar contraseña');
  }
}

async function requestPasswordReset(email: string): Promise<void> {
  try {
    await httpClient.post('auth/request-password-reset', { email });
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Error al solicitar restablecimiento de contraseña'
    );
  }
}

async function resetPassword(payload: {
  token: string;
  newPassword: string;
  accountType: UserRole;
}): Promise<void> {
  try {
    await httpClient.post('auth/reset-password', payload);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al restablecer contraseña');
  }
}

export {
  registerUser,
  getToken,
  validateToken,
  updatePassword,
  requestPasswordReset,
  resetPassword,
};
