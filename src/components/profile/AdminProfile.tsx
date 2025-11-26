import BaseProfile, { type ProfileConfig } from './BaseProfile';
import { getMyAdminProfile, updateMyAdminProfile } from '@/client/admin/profile';

const adminProfileConfig: ProfileConfig = {
  title: 'Mi Perfil de Administrador',
  fetchProfile: getMyAdminProfile,
  updateProfile: updateMyAdminProfile,
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
      readOnly: true,
    },
  ],
};

export default function AdminProfile() {
  return <BaseProfile config={adminProfileConfig} />;
}
