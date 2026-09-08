import { Hono } from "hono";
import { userRoutes } from "@/modules/users";

const apiRouter = new Hono();

apiRouter.route("/users", userRoutes);

export default apiRouter;
