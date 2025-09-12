export interface IEvent {
  id: number; // Prisma usa Int autoincrement
  classId: number;
  professorId: number;
  startTime: string;
  endTime: string;
  modality: 'ONLINE' | 'PRESENTIAL' | 'HYBRID'; // depende de tu enum SlotModality
  status: 'CANDIDATE' | 'CONFIRMED' | 'CANCELLED'; // depende de tu enum SlotStatus
  minStudents?: number;
  maxStudents: number;
  reservations: IReservation[]; // reflejando la relación
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
  // otros campos del modelo Class
}

export interface IProfessor {
  id: number;
  name: string;
  // otros campos del modelo Professor
}

export type EventFormValues = {
  classId: number;
  professorId: number;
  start: Date;
  end: Date;
  modality: 'ONLINE' | 'PRESENTIAL' | 'HYBRID';
  status: 'CANDIDATE' | 'CONFIRMED' | 'CANCELLED';
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
