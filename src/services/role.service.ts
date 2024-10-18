import prisma from "../db";
import { RoleCreate, RoleFindMany, RoleUpdate } from "../models/role.model";

const findOne = async (id: number) => {
  return await prisma.role.findUnique({
    where: {
      id,
    },
  });
};

const findByProject = async (project_id: number) => {
  return await prisma.role.findMany({
    where: {
      project_id,
    },
  });
};

const findDefault = async (project_id: number) => {
  return await prisma.role.findFirst({
    where: {
      project_id,
      is_default: true,
    },
  });
};

const findMany = async ({
  name,
  project_id,
  page,
  take,
  sortField,
  sortOrder,
}: RoleFindMany) => {
  const data = await prisma.role.findMany({
    where: {
      ...(name ? { name: { contains: name, mode: "insensitive" } } : {}),
      project_id,
    },
    skip: (Number(page) - 1) * Number(take),
    take: Number(take),
    orderBy: {
      ...(sortField
        ? { [sortField]: Number(sortOrder) === 1 ? "asc" : "desc" }
        : { id: "asc" }),
    },
  });

  const total = await prisma.role.count({
    where: {
      ...(name ? { name: { contains: name, mode: "insensitive" } } : {}),
      project_id,
    },
  });

  return {
    data,
    total,
  };
};

const createOne = async ({ name, project_id, is_default }: RoleCreate) => {
  return await prisma.role.create({
    data: {
      name,
      project_id,
      is_default,
    },
  });
};

const updateOne = async ({ name, is_default, id }: Partial<RoleUpdate>) => {
  return await prisma.role.update({
    data: {
      name,
      is_default,
    },
    where: { id },
  });
};

const deleteOne = async (id: number) => {
  return await prisma.role.delete({
    where: { id },
  });
};

export const roleService = {
  createOne,
  findOne,
  findByProject,
  findDefault,
  findMany,
  updateOne,
  deleteOne,
};
