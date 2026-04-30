# Centraldev Assessment System

Sistem analisa bisnis ritel untuk mengukur tingkat kematangan operasional dan estimasi investasi sistem yang tepat.

## Tech Stack

- **Framework**: TanStack Start (React + Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database/Auth**: Supabase
- **UI Components**: Shadcn/UI (Radix UI)
- **Deployment**: Cloudflare Pages / Workers

## Pengembangan Lokal

1. Install dependensi:
   ```bash
   bun install
   ```

2. Setup Environment Variables:
   Salin `.env` dan isi kredensial Supabase Anda.

3. Jalankan server development:
   ```bash
   bun run dev
   ```

## Struktur Proyek

- `src/routes/`: Definisi routing menggunakan TanStack Router.
- `src/components/`: Komponen UI reusable.
- `src/integrations/`: Konfigurasi layanan eksternal (Supabase).
- `src/server/`: Logika server-side / API functions.

---
© 2026 Centraldev Team
