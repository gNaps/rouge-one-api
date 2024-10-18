import prisma from "../db";
import {
  PermissionCreate,
  PermissionFindMany,
  PermissionUpdate,
} from "../models/permission.model";

const findOne = async (id: number) => {
  return await prisma.role.findUnique({
    where: {
      id,
    },
  });
};

const findMany = async ({
  name,
  project_id,
  page = 1,
  take = 500,
  sortField = "",
  sortOrder = 1,
}: PermissionFindMany) => {
  const data = await prisma.permission.findMany({
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

  const total = await prisma.permission.count({
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

const createOne = async ({ name, role_id, project_id }: PermissionCreate) => {
  return await prisma.permission.create({
    data: {
      name,
      ...(role_id && { role_id }),
      project_id,
    },
  });
};

const updateOne = async ({ name, role_id, id }: Partial<PermissionUpdate>) => {
  return await prisma.permission.update({
    data: {
      name,
      ...(role_id && { role_id }),
    },
    where: { id },
  });
};

const deleteOne = async (id: number) => {
  return await prisma.permission.delete({
    where: { id },
  });
};

export const permissionService = {
  createOne,
  findOne,
  findMany,
  updateOne,
  deleteOne,
};
