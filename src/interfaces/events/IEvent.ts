export interface IEvent {
  id: number; // Prisma usa Int autoincrement
  classId: number;
  professorId: number;
  startTime: string;
  endTime: string;
  modality: 'ONLINE' | 'PRESENTIAL' | 'HYBRID' | 'remote' | 'onsite';
  studentsGroup?: 'group' | 'private';
  status:
    | 'CANDIDATE'
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'COMPLETED'
    | 'candidate'
    | 'confirmed'
    | 'cancelled'
    | 'completed'; // depende de tu enum SlotStatus
  minStudents?: number;
  maxStudents: number;
  reservations: IReservation[];
  class?: IClass;
  professor?: IProfessor;
}

export interface IReservation {
  id: number;
  studentId: number;
  slotId: number;
  // ...otros campos de Reservation
}

export interface IClass {
  id: number;
  name: string;
  professors: IProfessor[];
  title: string;
  // otros campos del modelo Class
}

export interface IProfessor {
  id: number;
  name: string;
  // otros campos del modelo Professor
}

export type EventFormValues = {
  classId: number | null;
  professorId: number | null;
  start: Date;
  end: Date;
  modality: string;
  studentsGroup: string;
  status: string;
  minStudents?: number;
  maxStudents: number;
};

export type FormValues = {
  title: string;
  start: Date;
  end: Date;
  location: string;
  participants: string;
  description: string;
  color: string;
};

export interface EventCreatePayload {
  classId: number | null;
  professorId: number | null;
  startTime: string;
  endTime: string;
  modality: string;
  studentsGroup: string;
  status: string;
  minStudents?: number;
  maxStudents: number;
}
