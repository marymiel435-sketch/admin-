# Vlue Rides — Store Owner Web Portal

A React + Firebase web application for store owners in Trento, Agusan del Sur to register their store and manage their menu.

This was originally a Flutter mobile app; it has been fully ported to a React (Vite) web app in [`react-app/`](react-app/), backed by the same Firebase project (Auth, Firestore, Storage).

## Getting Started

```bash
cd react-app
npm install
npm run dev
```

Build for production:

```bash
cd react-app
npm run build
```

## Firebase

- `firestore.rules` — Firestore security rules
- `storage.rules` — Storage security rules
- `firebase.json` — Firebase Hosting config (serves `react-app/dist`)

Deploy with the Firebase CLI from the project root:

```bash
firebase deploy
```
