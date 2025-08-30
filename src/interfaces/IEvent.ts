export interface IEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location: string;
  participants: string[];
  description: string;
  color: string;
  slotUsed: number;
}
