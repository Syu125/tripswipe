export interface TripCard {
  id: string;
  emoji: string;
  name: string;
  date: string;
  address: string;
  time: string;
  link: string;
  notes: string;
  tripId: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  createdAt: number;
}

export type SwipeDirection = 'done' | 'skip';
