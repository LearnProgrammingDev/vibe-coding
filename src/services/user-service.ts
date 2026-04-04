import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, session } from "../db/schema";

/**
 * Mengambil profil pengguna saat ini berdasarkan token sesi yang valid.
 * Memvalidasi keberadaan token tersebut pada tabel `session` dan mengembalikan detail pengguna yang terkait.
 * 
 * @param {string} token - Token UUID unik yang didapatkan saat pengguna melakukan login.
 * @returns {Promise<object>} Mengembalikan objek respons terstandarisasi (sukses beserta data atau error).
 */
export const getCurrentUser = async (token: string) => {
  const [sessionRecord] = await db.select().from(session).where(eq(session.token, token));
  
  if (!sessionRecord || !sessionRecord.userId) {
    return {
      status: "error",
      message: "an authorization token is invalid",
      data: null
    };
  }

  const [user] = await db.select().from(users).where(eq(users.id, sessionRecord.userId));

  if (!user) {
    return {
      status: "error",
      message: "user not found",
      data: null
    };
  }

  return {
    status: "success",
    message: "User fetched successfully",
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.createdAt
    }
  };
};

/**
 * Menghapus sesi pengguna yang aktif dengan memusnahkan rekaman token dari database.
 * Digunakan untuk melakukan *logout* dengan aman serta mencabut hak akses pengguna terkait.
 * 
 * @param {string} token - String token *bearer* aktif yang akan dibatalkan/dihapus.
 * @returns {Promise<object>} Mengembalikan respons "ok" apabila penghapusan berhasil, atau error jika token tidak ditemukan.
 */
export const logoutUser = async (token: string) => {
  const [result] = await db.delete(session).where(eq(session.token, token));

  if (result.affectedRows === 0) {
    return {
      status: "error",
      message: "unauthorized",
      data: null
    };
  }

  return {
    status: "success",
    message: "Logout successful",
    data: "ok"
  };
};
