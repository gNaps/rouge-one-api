import { FastifyInstance } from "fastify";
import authHandler from "../handlers/auth.handler";
import tenantHandler from "../handlers/tenant.handler";
import { Queryparams } from "../models/queryparams.model";
import { RoleCreate, RoleFindMany } from "../models/role.model";
import { roleService } from "../services/role.service";

export const roleController = async (fastify: FastifyInstance) => {
  // Find many
  fastify.get<{ Params: Queryparams; Querystring: RoleFindMany }>(
    "/:tenant_code",
    { preHandler: [authHandler, tenantHandler] },
    async (req, rep) => {
      const roles = await roleService.findMany({
        ...req.query,
        project_id: req.project,
      });
      return roles;
    }
  );

  // Find one
  fastify.get<{ Params: Queryparams }>(
    "/:tenant_code/:id",
    { preHandler: [authHandler, tenantHandler] },
    async (req, rep) => {
      const { id } = req.params;
      const role = await roleService.findOne(id);

      if (!role || role?.project_id !== req.project) {
        rep.code(404).send("Role not found");
        return;
      }

      return role;
    }
  );

  // Create new role
  fastify.post<{ Params: Queryparams; Body: RoleCreate }>(
    "/:tenant_code",
    { preHandler: [authHandler, tenantHandler] },
    async (req, rep) => {
      const { name, is_default } = req.body;

      const roleCreated = await roleService.createOne({
        name,
        project_id: req.project,
        is_default: is_default ?? false,
      });

      return roleCreated;
    }
  );

  // Update role
  fastify.patch<{ Params: Queryparams; Body: RoleCreate }>(
    "/:tenant_code/:id",
    { preHandler: [authHandler, tenantHandler] },
    async (req, rep) => {
      const { id } = req.params;
      const { name, is_default } = req.body;
      const { project } = req;

      const role = await roleService.findOne(id);
      if (!role || role.project_id !== project) {
        rep.code(404).send("Role not found");
        return;
      }

      if (is_default) {
        const oldRoleDefault = await roleService.findDefault(req.project);
        if (oldRoleDefault) {
          await roleService.updateOne({
            id: oldRoleDefault.id,
            is_default: false,
          });
        }
      }

      const roleUpdated = await roleService.updateOne({
        id,
        name,
        is_default: is_default ?? false,
      });

      return roleUpdated;
    }
  );

  // Delete role
  fastify.delete<{ Params: Queryparams }>(
    "/:tenant_code/:id",
    { preHandler: [authHandler, tenantHandler] },
    async (req, rep) => {
      const { id } = req.params;
      const { project } = req;

      const role = await roleService.findOne(id);
      if (!role || role.project_id !== project) {
        rep.code(404).send("Role not found");
        return;
      }

      const roleDeleted = await roleService.deleteOne(id);

      return roleDeleted;
    }
  );
};
