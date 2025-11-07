// Main barrel export for all interfaces
export * from './enums';
export * from './models';
export * from './payments';
export * from './filters';
export * from './tableResponses';

// Events exports
export type { IEvent, EventFormValues, FormValues, EventCreatePayload } from './events/IEvent';

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
