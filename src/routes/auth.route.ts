import { Elysia, t } from "elysia";
import { registerUser, loginUser } from "../services/auth-service";

export const authRoutes = new Elysia({ prefix: "/api/v1/auth" })
  .post("/login", async ({ body, set }) => {
    try {
      const result = await loginUser(body);
      
      if (result.status === "error") {
        set.status = 400; // atau 401
        return result;
      }

      set.status = 200;
      return result;
    } catch (e: any) {
      set.status = 500;
      return {
        status: "error",
        message: "Internal Server Error",
        data: null
      };
    }
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String()
    })
  })
  .post("/register", async ({ body, set }) => {
    try {
      const result = await registerUser(body);
      
      if (result.status === "error") {
        set.status = 400;
        return result;
      }

      set.status = 201;
      return result;
    } catch (e: any) {
      set.status = 500;
      return {
        status: "error",
        message: "Internal Server Error",
        data: null
      };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: "email" }),
      password: t.String()
    })
  });
