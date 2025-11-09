import type {
  SlotModality,
  SlotStudentsGroup,
  SlotStatus,
  ReservationStatus,
  PaymentStatus,
  MaterialType,
  AccessPolicy,
} from './enums';

// Professor model
export interface IProfessor {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  rut: string;
  bio?: string | null;
  profilePictureUrl?: string | null;
  courses?: ICourse[];
  slots?: ISlot[];
}

// Student model
export interface IStudent {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  rut: string;
  address?: string | null;
  courses?: ICourse[];
  reservations?: IReservation[];
  payments?: IPayment[];
}

// Course model
export interface ICourse {
  id: number;
  title: string;
  acronym: string;
  description: string;
  isActive: boolean;
  professors?: IProfessor[];
  classes?: IClass[];
  students?: IStudent[];
}

// Class model
export interface IClass {
  id: number;
  courseId: number;
  title: string;
  description: string;
  objectives?: string | null;
  orderIndex: number;
  basePrice: number;
  course?: ICourse;
  professors?: IProfessor[];
  slots?: ISlot[];
  materials?: IMaterial[];
}

// Slot model
export interface ISlot {
  id: number;
  classId: number;
  professorId: number;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  modality: SlotModality;
  studentsGroup: SlotStudentsGroup;
  location?: string | null;
  status: SlotStatus;
  minStudents?: number | null;
  maxStudents: number;
  class?: IClass;
  professor?: IProfessor;
  reservations?: IReservation[];
}

// Reservation model
export interface IReservation {
  id: number;
  studentId: number;
  slotId: number;
  status: ReservationStatus;
  paymentId?: number | null;
  student?: IStudent;
  slot?: ISlot;
  payment?: IPayment;
}

// Payment model
export interface IPayment {
  id: number;
  studentId: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentProvider: string;
  transactionReference: string;
  createdAt: string; // ISO date string
  student?: IStudent;
  reservations?: IReservation[];
}

// Material model
export interface IMaterial {
  id: number;
  classId: number;
  type: MaterialType;
  url: string;
  accessPolicy: AccessPolicy;
  class?: IClass;
}

// Admin model
export interface IAdmin {
  id: number;
  name: string;
  email: string;
  rut: string;
  createdAt: string; // ISO date string
}
