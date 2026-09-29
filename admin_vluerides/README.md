# VlueRides Admin

React + JavaScript admin panel for the VlueRides local delivery platform (Trento, Agusan del Sur). Converted from the original Flutter admin app — same Firebase project, same Firestore/Storage/Cloud Functions, same business rules.

## Running the app

```
cd react-admin
npm install
npm start
```

Then open the URL printed in the terminal (defaults to http://localhost:5173).

## Project layout

- `react-admin/` — the admin panel (Vite + React + MUI)
- `functions/` — Firebase Cloud Functions (account deletion for stores/riders/customers), shared backend, called by the admin panel via `httpsCallable`
- `scripts/` — one-off Node maintenance scripts against the Firestore project
- `firestore.rules`, `storage.rules`, `database.rules.json`, `firebase.json`, `cors.json` — Firebase project configuration
