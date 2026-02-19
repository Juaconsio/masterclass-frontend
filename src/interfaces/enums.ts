// Enums matching Prisma schema
export type SlotModality = 'remote' | 'onsite';
export type SlotStudentsGroup = 'group' | 'private';
export type SlotStatus = 'candidate' | 'confirmed' | 'completed' | 'cancelled';
export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'reschedule_pending'
  | 'to_refund'
  | 'refunded'
  | 'attended'
  | 'no_show';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type MaterialType = 'guide' | 'slides' | 'exercises' | 'solutions' | 'recording';
export type AccessPolicy = 'pre_class' | 'post_class' | 'no_show_restricted';

// User role (not in Prisma but useful for frontend)
export type UserRole = 'user' | 'professor' | 'admin';
