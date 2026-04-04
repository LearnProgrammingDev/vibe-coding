# [Feature] API Logout User

## Tujuan
Membuat fitur (API Endpoint) fungsional agar *user* bisa melakukan proses *logout*. Saat berhasil, akses *session* pengguna yang tersimpan di dalam database akan dihancurkan.

## Spesifikasi Endpoint

- **Metode HTTP**: `DELETE`
- **Path Endpoint**: `/api/v1/users/logout` *(Note: Menyesuaikan prefix api/v1 yang sudah ada agar rapi)*
- **Header Dibutuhkan**:
  - `Authorization`: `Bearer <token>` (Token merupakan UUID yang didapatkan *user* saat Login).

### Format Respon
Untuk menjaga **konsistensi**, kita tetap membungkus balikan dalam format standar aplikasi (status, message, data).

**1. Jika Sukses (HTTP Status 200)**
```json
{
    "status": "success",
    "message": "Logout successful",
    "data": "ok"
}
```

**2. Jika Gagal (Cth: Tidak Ada Header / Token Tidak Valid) (HTTP Status 401)**
```json
{
    "status": "error",
    "message": "unauthorized",
    "data": null
}
```

---

## Ketentuan Struktur File (Konsisten)
Pastikan kode ditulis pada folder dan file yang tepat (dan sudah ada sebelumnya):
- **Routing**: Letakkan pada `src/routes/users.route.ts` *(berisi rute ElysiaJS Controller).*
- **Business Logic**: Letakkan pada `src/services/user-service.ts` *(berisi interaksi Database / Drizzle).*

---

## 🛠️ Tahapan Implementasi untuk Junior Programmer / AI
Harap ikuti langkah kerja (*Workflow*) terstruktur di bawah ini satu-persatu agar kode tidak acak-acakan:

### Tahap 1: Eksekusi Logika Bisnis & Database
Tugas Anda adalah menempatkan proses *query* ini di ranah *Services*.

1. Buka file `src/services/user-service.ts`.
2. Buat dan *export* sebuah fungsi asinkron dengan nama `logoutUser(token: string)`.
3. Di dalam skripnya, gunakan sintaks pembantu ORM (Drizzle) untuk menghapus kolom pada tabel `session`.
   - Contoh Drizzle Query: `await db.delete(session).where(eq(session.token, token));`
4. Cek hasil operasi *delete* tersebut. 
   - Jika proses gagal atau tidak ada row yang cocok dengan token, kembalikan objek JSON error `unauthorized`.
   - Jika *delete* berhasil, kembalikan JSON *return success* yang di dalamnya memuat `"data": "ok"`.

### Tahap 2: Pembuatan Routing / Controller API
Tugas Anda ini menangani permintaan masuk dari Client di ranah *Routes*.

1. Buka file `src/routes/users.route.ts`.
2. Lakukan *chaining endpoint* baru `.delete('/logout', async ({ headers, set }) => { ... })` ke dalam blok Elysia instance yang sudah ada.
3. Ambil `headers.authorization`. Validasi jika isinya **kosong** atau **bukan berawalan "Bearer "**. Bila benar tidak sesuai, set `set.status = 401` lalu berikan objek *return error authorized*.
4. Lakukan pemisahan string (*split*) untuk membuang teks `"Bearer "` dan murni mengambil nilai `<token>`.
5. Panggil method pembantu `logoutUser(token)` yang sudah dibuat di Tahap 1.
6. Periksa balikan objeknya (kondisi sukses atau gagal), dan kembalikan secara langsung balikan dari *service* tersebut ke Client Response. (Ingat untuk menyesuaikan `set.status = 200` jika aman, dan `401` jika error).

### Tahap 3: Verifikasi dan Testing Lokal
1. Hidupkan server dengan command `bun run dev` (atau command yang relevan di `package.json`).
2. Login pengguna menggunakan Postman/cURL ke `POST /api/v1/auth/login`. Salin nilai token dari respon API tersebut.
3. Jalankan request ke endpoint baru Anda `DELETE /api/v1/users/logout` menggunakan JWT/Bearer hasil di atas. Pastikan ia merespons sukses `data: ok`.
4. Ulangi menembak header tersebut (atau coba tanpa otorisasi), pastikan respon beralih menjadi 401 Unathorized. 
5. Cek database tabel `session` untuk validasi akhir token benar-benar terhapus.
