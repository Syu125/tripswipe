# TripSwipe 🗺️

A Tinder-style travel itinerary app. Create cards for every stop on your trip, swipe right when you're done, and browse your archive.

## Features

- **Multiple trips** — create and manage separate trips (Seattle, Tokyo, etc.)
- **Swipe to complete** — swipe right to archive a stop, left to push it to the back of the deck
- **Action buttons** — tap ✓ or ⏭ if swiping isn't your thing
- **Archive tab** — browse completed stops and restore any of them
- **Add manually** — fill in name, address, time, and a booking link
- **Paste & parse** — paste a comma-separated list and auto-generate cards
- **Persistent storage** — everything saved via AsyncStorage, survives restarts
- **Dark mode** — automatic system-level support

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- [Expo Go](https://expo.dev/client) app on your phone (iOS or Android)

### Install & run

```bash
git clone https://github.com/YOUR_USERNAME/tripswipe.git
cd tripswipe
npm install
npx expo start
```

Scan the QR code with:
- **iOS** → Camera app
- **Android** → Expo Go app

### Project structure

```
TripSwipe/
├── app/
│   ├── _layout.tsx       # Expo Router root layout
│   ├── index.tsx         # Trips list screen
│   └── deck.tsx          # Swipe deck screen
├── src/
│   ├── components/
│   │   ├── SwipeCard.tsx  # Draggable card with Reanimated gestures
│   │   └── AddCardSheet.tsx # Bottom sheet to add cards
│   ├── hooks/
│   │   └── useCards.ts   # Business logic + AsyncStorage hooks
│   ├── screens/
│   │   ├── TripsScreen.tsx
│   │   └── DeckScreen.tsx
│   ├── store/
│   │   └── storage.ts    # AsyncStorage read/write helpers
│   ├── types/
│   │   └── index.ts      # Shared TypeScript types
│   └── theme.ts          # Colors, spacing, typography
├── app.json
├── babel.config.js
├── package.json
└── tsconfig.json
```

## Paste format

In the "Paste list" tab, each line becomes a card:

```
Name, Address, Time, Link
Pike Place Market, 85 Pike St Seattle, 10:00 AM – 12:00 PM, pikeplacemarket.org
Space Needle, 400 Broad St Seattle, 1:00 PM – 2:30 PM, spaceneedle.com
```

Only Name is required — the other fields are optional.

## Building for production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build for iOS & Android
eas build --platform all
```

See [Expo docs](https://docs.expo.dev/build/introduction/) for full EAS build setup.
