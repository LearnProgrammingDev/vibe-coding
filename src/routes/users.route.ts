import { Elysia } from "elysia";
import { getCurrentUser } from "../services/user-service";

export const usersRoutes = new Elysia({ prefix: "/api/v1/users" })
  .get("/me", async ({ headers, set }) => {
    try {
      const authHeader = headers.authorization;
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return {
          status: "error",
          message: "an authorization header is missing or invalid",
          data: null
        };
      }

      const token = authHeader.split(" ")[1];
      const result = await getCurrentUser(token);
      
      if (result.status === "error") {
        set.status = 401;
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
  });
