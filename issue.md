# [Task] Implementasi Swagger/OpenAPI Documentation

## Deskripsi
Untuk memudahkan pengembang lain atau tim frontend dalam memahami dan menguji API, kita perlu menambahkan sistem dokumentasi otomatis menggunakan Swagger (OpenAPI). Dengan fitur ini, siapa pun dapat melihat daftar endpoint, parameter yang dibutuhkan, serta mencoba API secara langsung dari browser.

Di ElysiaJS, kita akan menggunakan plugin resmi: `@elysiajs/swagger`.

---

## Tahapan Implementasi (Detail untuk Junior/AI)

### 1. Instalasi Dependensi
Jalankan perintah berikut di terminal untuk menginstal plugin swagger:
```bash
bun add @elysiajs/swagger
```

### 2. Registrasi Plugin di App Utama
Buka file `src/index.ts` dan lakukan langkah berikut:
- Import `swagger` dari `@elysiajs/swagger`.
- Tambahkan `.use(swagger())` pada instance `app` sebelum rute lain atau di bagian awal plugin.
- Konfigurasikan informasi dasar API seperti `title`, `version`, dan `description` agar terlihat profesional.

**Contoh Struktur:**
```typescript
app.use(swagger({
    documentation: {
        info: {
            title: 'Vibe Engineering API',
            version: '1.0.0',
            description: 'Dokumentasi untuk sistem Authentication dan User Management'
        },
        tags: [
            { name: 'Auth', description: 'Endpoint untuk Registrasi dan Login' },
            { name: 'Users', description: 'Endpoint untuk Manajemen Profil User' }
        ]
    }
}))
```

### 3. Menambahkan Metadata pada Routes
Agar Swagger UI rapi dan deskriptif, tambahkan properti `detail` pada setiap route di file `src/routes/auth.route.ts` dan `src/routes/users.route.ts`.

Gunakan tag yang sesuai:
- Rute di `auth.route.ts` harus menggunakan `tags: ['Auth']`.
- Rute di `users.route.ts` harus menggunakan `tags: ['Users']`.

**Contoh di dalam route:**
```typescript
.post("/login", async (...) => { ... }, {
    body: t.Object({ ... }),
    detail: {
        tags: ['Auth'],
        summary: 'Melakukan login untuk mendapatkan access token',
        description: 'Endpoint ini memvalidasi email dan password lalu mengembalikan UUID token.'
    }
})
```

### 4. Pengujian
1. Jalankan aplikasi dengan `bun run dev`.
2. Buka browser dan akses alamat: `http://localhost:3000/swagger`.
3. Pastikan semua rute (Register, Login, Me, Logout) muncul dan deskripsinya sesuai.
4. Coba lakukan *Try it out* untuk memastikan dokumentasi selaras dengan fungsionalitas aslinya.

---

## Kriteria Keberhasilan (Definition of Done)
- Halaman `/swagger` dapat diakses tanpa error 404.
- Setiap endpoint memiliki `summary` dan `tags` yang jelas.
- Dokumentasi mencerminkan validasi TypeBox yang sudah kita buat (misalnya: `maxLength: 255` pada name).
- Tidak ada *breaking changes* pada API yang sudah ada.
