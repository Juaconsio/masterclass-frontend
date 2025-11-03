// Main barrel export for all interfaces
export * from './enums';
export * from './models';
export type { IEvent } from './events/IEvent';

// Convenience re-exports with common names
export type {
  IProfessor as Professor,
  IStudent as Student,
  ICourse as Course,
  IClass as Class,
  ISlot as Slot,
  IReservation as Reservation,
  IPayment as Payment,
  IMaterial as Material,
  IAdmin as Admin,
} from './models';
