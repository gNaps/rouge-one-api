import { FastifyInstance } from "fastify";
import authHandler from "../handlers/auth.handler";
import tenantHandler from "../handlers/tenant.handler";
import { PeopleFindMany, PeopleUpdate } from "../models/people.model";
import { Queryparams } from "../models/queryparams.model";
import { peopleService } from "../services/people.service";

export const peopleController = async (fastify: FastifyInstance) => {
  // Find many
  fastify.get<{ Params: Queryparams; Querystring: PeopleFindMany }>(
    "/:tenant_code",
    { preHandler: [authHandler, tenantHandler] },
    async (req, rep) => {
      const people = await peopleService.findMany({
        ...req.query,
        project_id: req.project,
      });
      return people;
    }
  );

  // Find one
  fastify.get<{ Params: Queryparams }>(
    "/:tenant_code/:id",
    { preHandler: [authHandler, tenantHandler] },
    async (req, rep) => {
      const { id } = req.params;
      const people = await peopleService.findOne(Number(id));

      if (!people || people?.project_id !== req.project) {
        rep.code(404).send("People not found");
        return;
      }

      return people;
    }
  );

  // Update people
  fastify.patch<{ Params: Queryparams; Body: PeopleUpdate }>(
    "/:tenant_code/:id",
    { preHandler: [authHandler, tenantHandler] },
    async (req, rep) => {
      const { id } = req.params;
      const { project } = req;

      const people = await peopleService.findOne(id);
      if (!people || people.project_id !== project) {
        rep.code(404).send("People not found");
        return;
      }

      const peopleUpdated = await peopleService.updateOne({
        ...req.body,
        id: Number(id),
      });

      return peopleUpdated;
    }
  );

  // Delete role
  fastify.delete<{ Params: Queryparams }>(
    "/:tenant_code/:id",
    { preHandler: [authHandler, tenantHandler] },
    async (req, rep) => {
      const { id } = req.params;
      const { project } = req;

      const people = await peopleService.findOne(Number(id));
      if (!people || people.project_id !== project) {
        rep.code(404).send("People not found");
        return;
      }

      const peopleDeleted = await peopleService.deleteOne(id);

      return peopleDeleted;
    }
  );
};
