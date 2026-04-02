import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";
import { authRoutes } from "./routes/auth.route";

const app = new Elysia()
  .use(authRoutes)
  .get("/", () => {
    return { message: "Hello Elysia!", status: "ok" };
  })
  .get("/users", async () => {
    const allUsers = await db.select().from(users);
    return allUsers;
  })
  .listen(3000);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
