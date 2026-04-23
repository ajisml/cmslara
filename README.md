# CMS Lara

CMS Admin berbasis Laravel 12 + Inertia + React untuk pengelolaan konten website.

## Stack
- PHP 8.2+
- Laravel 12
- Inertia.js + React 18
- Tailwind CSS
- Zustand
- Summernote
- SweetAlert2
- MySQL / MariaDB

## Fitur Utama
- Dashboard admin.
- Manajemen user (profil foto, gender, nomor HP).
- Role & permission.
- Web settings (logo, favicon, meta, kontak, sosial media).
- Kelola menu.
- Kelola kategori.
- Kelola hashtag.
- Kelola postingan blog.
- Kelola laman.
- Kelola gallery dan gambar gallery.
- Kelola notifikasi.
- Kontak masuk + detail + read/unread.
- Audit log aktivitas admin.
- Workflow konten: `draft -> review -> approved -> published`.
- Revisi/versioning konten + rollback versi.
- Dark mode / light mode.

## Demo Screenshot

### Dashboard
![Dashboard CMSLara](./Dashboard%20-%20CMSLara.png)

### Kelola Menu (Drag & Drop)
![Kelola Menu CMSLara](./Kelola%20Menu%20(Drag%26Drop)%20-%20CMSLara.png)

### Audit Log
![Audit Log CMSLara](./Audit%20Log%20-%20CMSLara.png)

## Struktur Konten
- Postingan: `Kelola Postingan`.
- Laman: `Kelola Laman`.
- Media visual: `Kelola Gallery` dan `Gambar Management`.

## Setup Lokal
1. Clone repository.
2. Masuk ke direktori project.
3. Install dependency backend dan frontend.
4. Konfigurasi `.env`.
5. Jalankan migrate + seed.
6. Jalankan server Laravel dan Vite.

Perintah cepat:

```bash
cp .env.example .env
composer install
npm install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
npm run dev
```

Alternatif satu perintah setup dari `composer.json`:

```bash
composer run setup
```

## Akun Default Seeder
Password default untuk akun seed: `password`

- Superadmin: `superadmin@cmslara.test`
- Admin: `admin@cmslara.test`
- Editor: `editor@cmslara.test`

## Workflow Konten
- Author/owner submit konten ke review.
- Editor/Admin/Superadmin melakukan approval.
- Admin/Superadmin melakukan publish.
- Konten bisa dikembalikan ke draft.

## Versioning & Rollback
- Setiap perubahan penting membuat versi baru.
- History versi bisa dilihat dari tombol `History` di list post/laman.
- Rollback dapat dilakukan per versi.

## Build Production
```bash
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Catatan Keamanan
- File sensitif sudah diabaikan melalui `.gitignore` (`.env`, `vendor`, `node_modules`, build output, dan cache/log lokal).
- Pastikan `APP_ENV`, `APP_DEBUG`, database credential, dan mail credential diset sesuai environment.

## Lisensi
Project ini menggunakan lisensi MIT kecuali ditentukan lain oleh pemilik repository.
