import { FastifyReply, FastifyRequest } from "fastify";
import { projectService } from "../services/project.service";

const tenantHandler = async (req: FastifyRequest, rep: FastifyReply) => {
  try {
    const { tenant_code } = req.params as { tenant_code: string };
    if (tenant_code) {
      const project = await projectService.findOneByTenantCode(tenant_code);
      if (!project) {
        rep.code(400).send("Invalid tenant code");
        return;
      }

      if (project.user_id !== req.user.id) {
        rep.code(400).send("Invalid tenant code");
        return;
      }

      req.project = project.id;
    } else {
      rep.code(404).send();
    }
  } catch (error) {
    rep.code(404).send(error);
  }
};

export default tenantHandler;
