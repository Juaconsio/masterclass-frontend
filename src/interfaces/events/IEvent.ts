// Import from centralized models
import type { ISlot, IClass, IProfessor, IReservation } from '../models';
import type { SlotModality, SlotStatus, SlotStudentsGroup } from '../enums';

// Re-export for backwards compatibility
export type { ISlot, IClass, IProfessor, IReservation };

// Legacy alias - IEvent is now just an alias for ISlot
export interface IEvent extends ISlot {}

// Keep legacy naming exports for backwards compatibility
export type Slot = ISlot;
export type Class = IClass;
export type Professor = IProfessor;
export type Reservation = IReservation;

export type EventFormValues = {
  classId: number | null;
  courseId: number | null;
  professorId: number | null;
  start: Date;
  end: Date;
  modality: SlotModality;
  studentsGroup: SlotStudentsGroup;
  status: SlotStatus;
  location?: string | null;
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
  modality: SlotModality;
  studentsGroup: SlotStudentsGroup;
  status: SlotStatus;
  location?: string | null;
  minStudents?: number;
  maxStudents: number;
}
