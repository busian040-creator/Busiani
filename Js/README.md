# BUSIAN — Frontend Supabase-Ready

This package is the corrected frontend base for BUSIAN before Supabase integration.

## Important structure
- `index.html` — application shell
- `css/busian.css` — the single active stylesheet
- `Js/busian.js` — application/navigation logic
- `Js/data.js` — temporary seed data shaped for the future Supabase records
- `Assets/` — BUSIAN branding and product assets

## Deployment
Upload the **contents of this folder** to the root of the GitHub Pages repository.
Do not create another `Busiani-main` folder inside the repository.

## Supabase next
The next stage will replace the seed/local cart behavior with Supabase Auth, PostgreSQL/RLS, Storage, orders, deliveries, payments, commissions and notifications.
