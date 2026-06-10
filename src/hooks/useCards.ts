import { useState, useEffect, useCallback } from 'react';
import uuid from 'react-native-uuid';
import { Trip, TripCard } from '../types';
import * as storage from '../store/storage';

function getSortValue(card: TripCard): number {
  const dateText = card.date?.trim();
  if (!dateText) return Number.MAX_SAFE_INTEGER;

  const baseDate = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(baseDate.getTime())) return Number.MAX_SAFE_INTEGER;

  const timeText = card.time?.trim();
  if (!timeText) return baseDate.getTime();

  const parsed = timeText.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!parsed) return baseDate.getTime();

  let hour = Number(parsed[1]);
  const minute = Number(parsed[2] ?? '0');
  const ampm = parsed[3]?.toUpperCase();

  if (ampm === 'PM' && hour < 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return baseDate.getTime();

  const withTime = new Date(baseDate);
  withTime.setHours(hour, minute, 0, 0);
  return withTime.getTime();
}

function sortCardsBySchedule(cards: TripCard[]): TripCard[] {
  return [...cards].sort((a, b) => getSortValue(a) - getSortValue(b));
}

function normalizeCard(card: TripCard): TripCard {
  return {
    ...card,
    date: card.date ?? '',
    notes: card.notes ?? '',
  };
}

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.loadTrips().then((t) => {
      setTrips(t);
      setLoading(false);
    });
  }, []);

  const addTrip = useCallback(async (name: string, destination: string): Promise<Trip> => {
    const trip: Trip = {
      id: uuid.v4() as string,
      name,
      destination,
      createdAt: Date.now(),
    };
    const updated = [trip, ...trips];
    setTrips(updated);
    await storage.saveTrips(updated);
    return trip;
  }, [trips]);

  const removeTrip = useCallback(async (tripId: string) => {
    const updated = trips.filter((t) => t.id !== tripId);
    setTrips(updated);
    await storage.saveTrips(updated);
    await storage.deleteTrip(tripId);
  }, [trips]);

  return { trips, loading, addTrip, removeTrip };
}

export function useTripCards(tripId: string) {
  const [cards, setCards] = useState<TripCard[]>([]);
  const [archived, setArchived] = useState<TripCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) return;
    Promise.all([
      storage.loadCards(tripId),
      storage.loadArchived(tripId),
    ]).then(([c, a]) => {
      setCards(sortCardsBySchedule(c.map(normalizeCard)));
      setArchived(a.map(normalizeCard));
      setLoading(false);
    });
  }, [tripId]);

  const addCard = useCallback(async (card: Omit<TripCard, 'id' | 'tripId'>) => {
    const newCard: TripCard = { ...card, id: uuid.v4() as string, tripId };
    const updated = sortCardsBySchedule([...cards, newCard]);
    setCards(updated);
    await storage.saveCards(tripId, updated);
  }, [cards, tripId]);

  const markDone = useCallback(async (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    const newCards = cards.filter((c) => c.id !== cardId);
    const newArchived = [card, ...archived];
    setCards(newCards);
    setArchived(newArchived);
    await storage.saveCards(tripId, newCards);
    await storage.saveArchived(tripId, newArchived);
  }, [cards, archived, tripId]);

  const skipCard = useCallback(async (cardId: string) => {
    const idx = cards.findIndex((c) => c.id === cardId);
    if (idx === -1) return;
    const updated = [...cards];
    const [card] = updated.splice(idx, 1);
    updated.push(card);
    setCards(updated);
    await storage.saveCards(tripId, updated);
  }, [cards, tripId]);

  const restoreCard = useCallback(async (cardId: string) => {
    const card = archived.find((c) => c.id === cardId);
    if (!card) return;
    const newArchived = archived.filter((c) => c.id !== cardId);
    const newCards = sortCardsBySchedule([card, ...cards]);
    setCards(newCards);
    setArchived(newArchived);
    await storage.saveCards(tripId, newCards);
    await storage.saveArchived(tripId, newArchived);
  }, [archived, cards, tripId]);

  const deleteCard = useCallback(async (cardId: string) => {
    const newArchived = archived.filter((c) => c.id !== cardId);
    setArchived(newArchived);
    await storage.saveArchived(tripId, newArchived);
  }, [archived, tripId]);

  const parsePaste = useCallback(async (text: string) => {
    const lines = text.trim().split('\n').filter((l) => l.trim());
    const EMOJIS = ['📍','🍜','🏛️','🏞️','☕','🎵','🛍️','🎨','🍻','🌊','🚂','🏔️','🌆'];
    const newCards: TripCard[] = lines.map((line) => {
      const parts = line.split(',').map((s) => s.trim());
      return {
        id: uuid.v4() as string,
        tripId,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        name: parts[0] || line,
        date: parts[1] || '',
        address: '',
        time: parts[2] || '',
        link: parts[3] || '',
        notes: parts.slice(4).join(', '),
      };
    });
    const updated = sortCardsBySchedule([...cards, ...newCards]);
    setCards(updated);
    await storage.saveCards(tripId, updated);
  }, [cards, tripId]);

  return {
    cards,
    archived,
    loading,
    addCard,
    markDone,
    skipCard,
    restoreCard,
    deleteCard,
    parsePaste,
  };
}
