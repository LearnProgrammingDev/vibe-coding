import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, session } from "../db/schema";

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
