import { FastifyInstance } from "fastify";
import authHandler from "../handlers/auth.handler";
import tenantHandler from "../handlers/tenant.handler";
import {
  ProjectCreate,
  ProjectFindMany,
  ProjectUpdate,
} from "../models/project.model";
import { Queryparams } from "../models/queryparams.model";
import { projectService } from "../services/project.service";
import { roleService } from "../services/role.service";

export const projectController = async (fastify: FastifyInstance) => {
  // Find many
  fastify.get<{ Params: Queryparams; Querystring: ProjectFindMany }>(
    "/",
    { preHandler: [authHandler] },
    async (req, rep) => {
      const projects = await projectService.findMany({
        ...req.query,
        user_id: req.user.id,
      });
      return projects;
    }
  );

  // Find one
  fastify.get<{ Params: Queryparams }>(
    "/:id",
    { preHandler: [authHandler] },
    async (req, rep) => {
      const { id } = req.params;
      const project = await projectService.findOne(Number(id));

      if (!project || project?.user_id !== req.user.id) {
        rep.code(404).send("Project not found");
        return;
      }

      return project;
    }
  );

  // Create new project
  fastify.post<{ Body: ProjectCreate }>(
    "/",
    { preHandler: [authHandler] },
    async (req, rep) => {
      const { id: user_id } = req.user;
      const {
        google_client_id,
        google_secret_id,
        facebook_client_id,
        facebook_secret_id,
        twitch_client_id,
        twitch_secret_id,
        github_client_id,
        github_secret_id,
        is_google_active,
        is_facebook_active,
        is_twitch_active,
        is_password_active,
        is_magic_link_active,
        redirect_url,
        name,
        description,
      } = req.body;
      const project = await projectService.createOne({
        google_client_id,
        google_secret_id,
        facebook_client_id,
        facebook_secret_id,
        twitch_client_id,
        twitch_secret_id,
        github_client_id,
        github_secret_id,
        is_google_active,
        is_facebook_active,
        is_twitch_active,
        is_password_active,
        is_magic_link_active,
        redirect_url,
        user_id,
        name,
        description,
      });

      await roleService.createOne({
        name: "Admin",
        project_id: project.id,
        is_default: false,
      });

      await roleService.createOne({
        name: "User",
        project_id: project.id,
        is_default: true,
      });

      return project;
    }
  );

  // Update project
  fastify.patch<{ Params: Queryparams; Body: ProjectUpdate }>(
    "/:id",
    { preHandler: [authHandler] },
    async (req, rep) => {
      const { id } = req.params;
      const project = await projectService.findOne(Number(id));

      if (!project || project.user_id !== req.user.id) {
        rep.code(404).send("Project not found");
        return;
      }

      const projectUpdated = await projectService.updateOne({
        ...req.body,
        id: Number(id),
      });

      return projectUpdated;
    }
  );

  // Delete project
  fastify.delete<{ Params: Queryparams }>(
    "/:id",
    { preHandler: [authHandler, tenantHandler] },
    async (req, rep) => {
      const { id } = req.params;
      const project = await projectService.findOne(Number(id));

      if (!project || project.user_id !== req.user.id) {
        rep.code(404).send("Project not found");
        return;
      }

      const projectDeleted = await projectService.deleteOne(Number(id));

      return projectDeleted;
    }
  );
};
