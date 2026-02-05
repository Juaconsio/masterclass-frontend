export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Incorrect email.': 'El correo no está registrado.',
  'Incorrect password.': 'La contraseña es incorrecta.',
  'Please confirm your email address. A confirmation link was (re)sent to your email.':
    'Por favor confirma tu correo electrónico. Se ha enviado un enlace de confirmación a tu email.',
  'Por favor confirma tu correo electrónico. Se ha enviado un enlace de confirmación a tu email.':
    'Por favor confirma tu correo electrónico. Se ha enviado un enlace de confirmación a tu email.',
  'Email and password required': 'El correo y la contraseña son obligatorios.',
  'Invalid credentials': 'Credenciales inválidas. Verifica tu correo y contraseña.',
  'Login failed': 'Error al iniciar sesión. Por favor intenta nuevamente.',
  'No password set for user.':
    'Esta cuenta no tiene una contraseña configurada. Contacta al administrador.',
  'Email, password, RUT and name required': 'Correo, contraseña, RUT y nombre son obligatorios.',
  'Email already registered': 'Este correo ya está registrado.',
  'Registration failed': 'Error al registrar. Por favor intenta nuevamente.',
  'Error al registrar usuario': 'No se pudo completar el registro. Por favor intenta más tarde.',
  'Invalid token or token has expired': 'El enlace de recuperación es inválido o ha expirado.',
  'Reset failed': 'No se pudo restablecer la contraseña. Solicita un nuevo enlace.',
  'token, accountType and newPassword required':
    'Datos incompletos. Por favor usa el enlace del correo.',
  'Invalid accountType': 'Tipo de cuenta inválido.',
  'Error al restablecer contraseña':
    'No se pudo actualizar la contraseña. Por favor intenta más tarde.',
  'Error al solicitar restablecimiento de contraseña':
    'No se pudo enviar el correo. Por favor intenta más tarde.',
  'Error al actualizar contraseña':
    'No se pudo cambiar la contraseña. Por favor intenta más tarde.',
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return AUTH_ERROR_MESSAGES[error.message] || error.message;
  }
  if (typeof error === 'string') {
    return AUTH_ERROR_MESSAGES[error] || error;
  }
  return 'Ha ocurrido un error inesperado.';
}
