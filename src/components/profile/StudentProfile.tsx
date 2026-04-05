import BaseProfile, { type ProfileConfig } from './BaseProfile';
import { getMe, updateMe } from '@/client/students';

const studentProfileConfig: ProfileConfig = {
  title: 'Mi Perfil',
  fetchProfile: getMe,
  updateProfile: updateMe,
  fields: [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Ingresa tu nombre completo',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'ejemplo@correo.com',
      required: true,
    },
    {
      name: 'rut',
      label: 'RUT',
      type: 'text',
      placeholder: '12.345.678-9',
      required: true,
      format: 'rut',
      helpText: 'Formato chileno con puntos y guion',
    },
    {
      name: 'phone',
      label: 'Teléfono',
      type: 'tel',
      placeholder: '+56 9 1234 5678',
      optional: true,
      maxLength: 17,
      format: 'phone',
      helpText: 'Formato chileno',
    },
    {
      name: 'address',
      label: 'Dirección',
      type: 'text',
      placeholder: 'Av. Providencia 1234, Santiago',
      required: true,
      helpText: 'Necesaria para facturación',
    },
  ],
};

export default function StudentProfile() {
  return <BaseProfile config={studentProfileConfig} />;
}
