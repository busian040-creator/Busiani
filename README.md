# BUSIAN Frontend Foundation

This version reorganizes the frontend around the BUSIAN product architecture agreed for the next Supabase stage.

## Current frontend structure

- Customer home: search, Busia delivery location, visual categories, local stores, products and trust signals.
- Mobile navigation: Home / Shop / Orders / Account bottom bar.
- Mobile side drawer: account, categories, stores, delivery and join-BUSIAN actions.
- Product detail, store pages, cart and checkout preparation.
- Merchant workspace shell: dashboard, orders, products, inventory, sales/payments and profile.
- Rider workspace shell: dashboard, deliveries, active delivery, earnings and profile.
- Admin workspace shell: users, merchants, riders/orders, payments, verification and commissions.
- Role selection is currently frontend-only and stored locally only to preview the workspaces.
- Cart is currently stored in localStorage only. It is NOT the final order system.

## Next stage: Supabase

The frontend is deliberately shaped around the future records and workflows:

`profiles -> roles -> merchants -> products -> orders -> order_items -> deliveries -> payments -> commissions -> notifications`

The next implementation should replace seed data and local state with Supabase Auth, PostgreSQL, Row Level Security, Storage and server-side Edge Functions.

M-Pesa/Daraja credentials must be kept server-side in an Edge Function or equivalent secure backend. Never place privileged credentials in `index.html` or public JavaScript.

## Important

This frontend does not claim that payments, authentication, rider assignment or merchant operations are live yet. Those become live after the Supabase/backend stage.
