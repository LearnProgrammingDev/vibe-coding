# 🦊 Vibe Engineering - Authentication Backend API

Repository ini berisikan *source code* platform Backend Authentication yang dibangun menggunakan performa tingkat tinggi dari kerangka kerja **ElysiaJS** di atas **Bun Runtime**. Aplikasi ini mendemonstrasikan implementasi menyeluruh sistem pengelolahan profil pengguna, pelacakan *state* menggunakan *database sessions*, serta arsitektur kode modern.

---

## 🛠️ Teknologi & Stack

Aplikasi ini tidak beroperasi pada ruang *Node.js* standar, melainkan menggunakan tumpukan sistem operasi generasi baru:
- **Runtime & Package Manager**: [Bun](https://bun.sh)
- **Web Framework**: [ElysiaJS](https://elysiajs.com/) (Beserta *TypeBox* untuk *schema validation*)
- **Database**: MySQL
- **ORM & Migrations**: [Drizzle ORM](https://orm.drizzle.team/) + `mysql2` driver
- **Unit Testing**: Bawaan murni dari `bun:test`
- **Language**: TypeScript

---

## 📂 Arsitektur Proyek (Struktur dan Pola Penamaan File)

Kode dipecah menggunakan metodologi **Controller-Service Pattern** guna memudahkan perawatan. Alur data bergerak dari Router -> Services -> Database.

```
/
├─ src/
│  ├─ db/             # Konektivitas Sistem Database
│  │  ├─ index.ts     # Konfigurasi `mysql2` Drizzle Object Mappers
│  │  └─ schema.ts    # Deklarasi struktur tabel (*Users*, *Session*)
│  ├─ routes/         # Layer Controllers (Endpoint ElysiaJS)
│  │  ├─ auth.route.ts     
│  │  └─ users.route.ts     
│  ├─ services/       # Layer Business Logics (Implementasi logikal murni)
│  │  ├─ auth-service.ts    
│  │  └─ user-service.ts    
│  └─ index.ts        # Entrypoint; Penghubung seluruh pilar rute (`app.use()`)
├─ test/              # Koleksi Unit Testing
│  └─ api.test.ts     # Script pengujian `bun test` interaktif
├─ drizzle.config.ts  # File konfigurasi utama untuk sinkronisasi db (drizzle-kit)
└─ package.json / bun.lock
```

💡 **Aturan Penamaan File**:  
- Ekstensi kontrol rute API dideskripsikan berakhiran `.route.ts`.
- Ekstensi penulisan layanan pangkalan data dan *logic* fungsional berakhiran `-service.ts`.

---

## 🗄️ Skema Database (Database Schema)
Didesain solid dengan relasi berantai (*Cascade Deletion*) antar 2 buah tabel utama:
1. **Tabel `users`**: Menghimpun seluruh data pengguna yang telah diregistrasikan.
   - `id` (INT Auto Increment, Primary Key)
   - `name` (VARCHAR 255)
   - `email` (VARCHAR 255, Unique)
   - `password` (VARCHAR 255) — *Hashed* secara aman menggunakan Native Crypt Bun.
   - `createdAt` (Timestamp Now)

2. **Tabel `session`**: Mewakili sesi yang tervalidasi setelah sandi tepat (*Login*).
   - `id` (INT Auto Increment, Primary Key)
   - `token` (VARCHAR 255) — String UUID V4 Acak.
   - `userId` (INT) — Foreign Key yang menunjuk ke `users.id` (ON DELETE CASCADE).
   - `createdAt` (Timestamp Now)

---

## 🌐 Kumpulan Rute API (Endpoints Available)
Dokumentasi di bawah ini merupakan ringkasan dari semua layanan URL yang diproteksi dan yang dibuka publik. Base URL berjalan di `http://localhost:3000`.

### 1. Autentikasi Pengguna (Public)
| Endpoint | Method | Tujuan | Payload |
| --- | --- | --- | --- |
| `/api/v1/auth/register` | `POST` | Mendaftarkan pengguna baru (_Sign Up_) | `name`, `email`, `password` |
| `/api/v1/auth/login`    | `POST` | Mendapatkan token (_Sign In_) | `email`, `password` |

### 2. Sesi Terproteksi Kredensial (Sistem Privat)
_*(Catatan: Semua akses di bawah membutuhkan Header `Authorization: Bearer <token_uuid>` dari hasil Login!)*_

| Endpoint | Method | Tujuan | 
| --- | --- | --- | 
| `/api/v1/users/me`     | `GET`    | Membaca rincian profil autentikasi *(ID, name, URL)* dari _database_. |
| `/api/v1/users/logout` | `DELETE` | Menghapus token dari tabel `session` secara terstruktur dan merusak akses login. |

---

## ⚙️ Persiapan & Setup Proyek (Development Guide)

### 1. Konfigurasi Awal
*Clone* repositori ini, lalu konfigurasi _Environment Variables_:
1. Salin format `cp .env.example .env` atau buat file `.env` baru.
2. Tambahkan pengaturan ke MySQL lokal Anda:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=vibe_db_coding
   ```
   *(Catatan: Pastikan Anda secara mandiri membuat database kosong bernama `vibe_db_coding` di perangkat administrasi MySQL).*

### 2. Instalasi Paket Dependensi
Gunakan package manager bawaan kerangka kerja Bun untuk sinkronisasi asinkron super cepat.
```bash
bun install
```

### 3. Migrasi Skema Drizzle ke Database
Integrasikan barisan abstraksi skema Drizzle milik TypeScript (`src/db/schema.ts`) ke wujud entitas relasional MySQL Anda menggunakan perintah pendorong (push):
```bash
bunx drizzle-kit push
```

---

## 🚀 Cara Menjalankan Aplikasi
Menyalakan *Live API Server* dengan dukungan muat-ulang (*hot-reload*) aktif, cukup mengeksekusi:

```bash
bun run dev
```
Bila sistem sehat, terminal akan menampilkan konfirmasi `"🦊 Elysia is running at http://localhost:3000"`. Selamat! API Anda kini aktif.

---

## 🧪 Menguji Stabilitas Layanan (Unit Testing)
Arsitektur API kami menjungjung tinggi integritas data dan terintegrasi standar penuh dengan *Automated End-to-End Unit Testing* yang melancarkan pengujian per blok skenario dan otomatis melibas (*cleanup*) *test-data* dari *database*. 

Pastikan Server dan Database MySQL terbuka, dan eksekusi skrip pengujian:
```bash
bun test
```

Hal ini akan memerintahkan runner menavigasikan alur 12 baris tes—pendaftaran error, limit input, penolakan token, penguakan profil, rekayasa sesi *Login* dan keamanan penutupan sesi *Logout*.
