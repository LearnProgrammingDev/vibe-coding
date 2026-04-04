# [BUG] Error 500 saat Registrasi dengan Nama Lebih dari 255 Karakter

## Deskripsi Bug
Pada saat melakukan pendaftaran pengguna (`POST /api/v1/auth/register`), apabila pengguna mencoba mendaftar menggunakan jumlah teks nama (parameter `name`) yang sangat panjang melebihi 255 karakter, aplikasi tidak merespons secara mulus sebagai *Bad Request* melainkan *crash* pada koneksi database (MySQL). Ini berujung mengembalikan **HTTP Status 500 (Internal Server Error)** ke sisi *client*.

## Langkah-langkah Reproduksi
1. Buka Postman / cURL untuk menguji Endpoint lokal.
2. Lakukan operasi request `POST /api/v1/auth/register`.
3. Di dalam *body* JSON, sertakan payload dengan nama lebih dari 255 huruf (misal A x300).
   ```json
   {
     "name": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
     "email": "panjang@example.com",
     "password": "bebas"
   }
   ```
4. Kirim *request*.
5. Respons akan melempar kode `500` secara samar:
   ```json
   {
     "status": "error",
     "message": "Internal Server Error",
     "data": null
   }
   ```

## Akar Masalah (Root Cause)
Terjadi ketidakselarasan batasan data pada dua lapisan *backend*.
- **Database Layer**: Pada `src/db/schema.ts`, kolom sudah didefinisikan teguh sebagai `varchar("name", { length: 255 })`.
- **Controller/Route Layer**: Pada validasi skema TypeBox ElysiaJS (`src/routes/auth.route.ts`), parameter input hanya dicek menggunakan `t.String()` tanpa dibekali batas `maxLength: 255`.
- String berbahaya sepanjang 300 huruf sukses lolos dari perisai Elysia namun meremukkan MySQL *(error "Data too long")*. Karena error tidak tertangani secara spesifik, kode penangkap *catch global* merangkumnya menjadi HTTP 500.

## Ekspektasi Perbaikan (Expected Fix)
Lengkapi restriksi parameter `name` menggunakan properti TypeBox milik Elysia sehingga bisa divalidasi langsung di depan gerbang.

Disarankan mengubah blok validasinya di `auth.route.ts` menjadi:
```typescript
body: t.Object({
  name: t.String({ 
    maxLength: 255, 
    error: "Nama tidak boleh melebihi 255 karakter" 
  }),
  // ... parameter lain ...
})
```
