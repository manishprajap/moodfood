# Mood Food

A bilingual-ready Mood Food storefront and administration starter built with Next.js, TypeScript, Tailwind CSS, MySQL, and Drizzle ORM.

## What is included

- Responsive storefront, product categories, vegetarian/frozen filters, product details, shopping bag, 1 kg minimum, and WhatsApp order handoff.
- Initial menu items based on the provided menu artwork, with the supplied logo and menu graphics in `public/brand`.
- English/Hindi switch for the primary storefront copy.
- Protected admin sign-in and dashboard for products, orders, and promotions.
- MySQL schema and migrations for products, categories, customers, orders, order items, promotions, and site settings.
- Seed command for the initial product catalogue.

## Run locally

1. Install Node.js 20.9 or newer and start the local MySQL service (XAMPP/MariaDB is fine).
2. Install dependencies with `npm install`.
3. Open `.env.local` (or copy `.env.example` there if it does not exist). It points to your existing `moodfood` database at `127.0.0.1:3306` using the common XAMPP `root` account with no password. Update the connection URL if your local MySQL credentials or port differ. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and a unique `ADMIN_SESSION_SECRET` with at least 32 characters.
4. With the `moodfood` database available in MySQL/phpMyAdmin, run:

   ```sh
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. Start the website with `npm run dev`, then open `http://localhost:3000`. The admin login is at `/admin`.

## Business setup still required

- The 1 kg minimum and 48-hour advance notice are initial defaults based on the supplied meeting notes/menu; confirm them before launch.
- Replace the starter product photos and review product descriptions, prices, pack sizes, ingredients, allergens, and nutrition details against approved product information.
- Configure and verify the actual WhatsApp Business number and delivery coverage.
- Mobile OTP login currently returns an explicit “not configured” response. Connect an SMS/OTP provider before enabling customer sign-in.
- UPI collection, GST calculation, and downloadable invoices are not connected. Confirm GST applicability, payment provider, tax rate, and invoice rules before accepting online payments.
- `DATABASE_URL` and admin credentials are required for admin data management. Admin product/order/promotion APIs report setup errors instead of silently substituting in-memory data.

## Useful commands

- `npm run dev` — local development server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check
- `npm run build` — production build
- `npm run db:generate` — generate Drizzle migrations after schema edits
- `npm run db:migrate` — apply migrations
- `npm run db:seed` — add the starter catalogue (safe to run again)

# moodfood
