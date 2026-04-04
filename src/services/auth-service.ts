import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, session } from "../db/schema";
import crypto from "crypto";

/**
 * Memvalidasi kredensial login pengguna terhadap data yang ada di database.
 * Setelah proses verifikasi kata sandi (*hash*) berhasil, fungsi ini akan membuatkan 
 * token sesi unik yang terhubung dengan pengguna dan menyimpannya secara aman.
 * 
 * @param {any} payload - Paket kredensial yang diminta, berisi `.email` dan `.password`.
 * @returns {Promise<object>} Respons standar API yang memuat info/profil pengguna beserta token aktifnya.
 */
export const loginUser = async (payload: any) => {
  // Cek eksistensi user berdasar email
  const [user] = await db.select().from(users).where(eq(users.email, payload.email));
  
  if (!user) {
    return {
      status: "error",
      message: "email atau password salah",
      data: null
    };
  }

  // Verifikasi hash password
  const isMatch = await Bun.password.verify(payload.password, user.password);
  
  if (!isMatch) {
    return {
      status: "error",
      message: "email atau password salah",
      data: null
    };
  }

  // Lolos, buat token UUID
  const token = crypto.randomUUID();

  // Simpan record login (Session)
  await db.insert(session).values({
    token,
    userId: user.id
  });

  return {
    status: "success",
    message: "User logged in successfully",
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      token,
      created_at: user.createdAt
    }
  };
};

/**
 * Mendaftarkan akun pengguna baru ke dalam sistem.
 * Melakukan pengecekan duplikasi *email*, menyandikan (*encrypt*) kata sandi secara aman 
 * menggunakan *hash bcrypt* bawaan Bun, lalu menyimpannya ke tabel `users`.
 * 
 * @param {any} payload - Data registrasi pengguna, biasanya terdiri dari `.name`, `.email`, dan `.password`.
 * @returns {Promise<object>} Objek sukses yang mengembalikan rincian pengguna baru, atau error apabila terjadi konflik (duplikasi).
 */
export const registerUser = async (payload: any) => {
  // Cek apakah email sudah terdaftar
  const existingUser = await db.select().from(users).where(eq(users.email, payload.email));
  
  if (existingUser.length > 0) {
    return {
      status: "error",
      message: "User already exists",
      data: null
    };
  }

  // Hash password menggunakan native Bun
  const hashedPassword = await Bun.password.hash(payload.password, "bcrypt");

  // Simpan payload ke database
  const [insertResult] = await db.insert(users).values({
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
  });

  // Ambil user yang baru dimasukkan berdasar ID
  const [newUser] = await db.select().from(users).where(eq(users.id, insertResult.insertId));

  return {
    status: "success",
    message: "User created successfully",
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      created_at: newUser.createdAt
    }
  };
};
