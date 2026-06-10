import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, TripCard } from '../types';

const TRIPS_KEY = 'tripswipe_trips';
const CARDS_KEY = (tripId: string) => `tripswipe_cards_${tripId}`;
const ARCHIVED_KEY = (tripId: string) => `tripswipe_archived_${tripId}`;

export async function loadTrips(): Promise<Trip[]> {
  try {
    const raw = await AsyncStorage.getItem(TRIPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveTrips(trips: Trip[]): Promise<void> {
  await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

export async function loadCards(tripId: string): Promise<TripCard[]> {
  try {
    const raw = await AsyncStorage.getItem(CARDS_KEY(tripId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveCards(tripId: string, cards: TripCard[]): Promise<void> {
  await AsyncStorage.setItem(CARDS_KEY(tripId), JSON.stringify(cards));
}

export async function loadArchived(tripId: string): Promise<TripCard[]> {
  try {
    const raw = await AsyncStorage.getItem(ARCHIVED_KEY(tripId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveArchived(tripId: string, cards: TripCard[]): Promise<void> {
  await AsyncStorage.setItem(ARCHIVED_KEY(tripId), JSON.stringify(cards));
}

export async function deleteTrip(tripId: string): Promise<void> {
  await AsyncStorage.multiRemove([CARDS_KEY(tripId), ARCHIVED_KEY(tripId)]);
}
