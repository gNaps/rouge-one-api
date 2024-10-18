import cors from "@fastify/cors";
import * as dotenv from "dotenv";
import fastify from "fastify";
import { authController } from "./controllers/auth.controller";
import { peopleController } from "./controllers/people.controller";
import { permissionController } from "./controllers/permission.controller";
import { projectController } from "./controllers/project.controller";
import { roleController } from "./controllers/role.controller";

declare module "fastify" {
  interface FastifyRequest {
    user: any;
    project: any;
  }
}

const server = fastify({
  logger: true,
  bodyLimit: 30 * 1024 * 1024, // Default Limit set to 30MB
});
dotenv.config();

server.register(cors, {
  origin: "*",
});

server.register(authController, { prefix: "/auth" });
server.register(projectController, { prefix: "/projects" });
server.register(roleController, { prefix: "/roles" });
server.register(permissionController, { prefix: "/permissions" });
server.register(peopleController, { prefix: "/people" });

server.listen(
  { port: 8080, host: process.env.ENV_DEVELOP ? "127.0.0.1" : "0.0.0.0" },
  (error: any, address: any) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }
    console.log(`Server running on ${address}`);
  }
);
