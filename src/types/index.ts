export interface TripCard {
  id: string;
  emoji: string;
  name: string;
  address: string;
  time: string;
  link: string;
  tripId: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  createdAt: number;
}

export type SwipeDirection = 'done' | 'skip';
