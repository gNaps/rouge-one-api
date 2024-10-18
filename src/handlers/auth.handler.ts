import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

const authHandler = (req: FastifyRequest, rep: FastifyReply, next: any) => {
  try {
    const token = req.headers.authorization!.replace("Bearer ", "");
    const data = jwt.verify(token, process.env.SECRET_KEY_JWT!);
    if (data) {
      req.user = { ...(data as any) };
      next();
    } else {
      rep.code(403).send("Unauthorized");
    }
  } catch (error) {
    rep.code(401).send(error);
  }
};

export default authHandler;
