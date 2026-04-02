import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

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
