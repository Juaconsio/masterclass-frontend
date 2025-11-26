import BaseProfile, { type ProfileConfig } from './BaseProfile';
import { getMyProfessorProfile, updateMyProfessorProfile } from '@/client/professors';

const professorProfileConfig: ProfileConfig = {
  title: 'Mi Perfil de Profesor',
  fetchProfile: getMyProfessorProfile,
  updateProfile: updateMyProfessorProfile,
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
      name: 'bio',
      label: 'Biografía',
      type: 'textarea',
      placeholder: 'Describe tu experiencia y especialidades...',
      optional: true,
      rows: 5,
    },
  ],
};

export default function ProfessorProfile() {
  return <BaseProfile config={professorProfileConfig} />;
}
