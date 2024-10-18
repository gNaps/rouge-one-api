import { v4 as uuidv4 } from "uuid";
import prisma from "../db";
import {
  ProjectCreate,
  ProjectFindMany,
  ProjectUpdate,
} from "../models/project.model";

const findOne = async (id: number) => {
  return await prisma.project.findUnique({
    where: {
      id,
    },
  });
};

const findOneByTenantCode = async (tenant_code: string) => {
  return await prisma.project.findFirst({
    where: {
      tenant_code,
    },
  });
};

const findMany = async ({
  name,
  page = 1,
  take = 500,
  sortField,
  sortOrder,
  user_id,
}: ProjectFindMany) => {
  const data = await prisma.project.findMany({
    where: {
      ...(name ? { name: { contains: name, mode: "insensitive" } } : {}),
      user_id,
    },
    skip: (Number(page) - 1) * Number(take),
    take: Number(take),
    orderBy: {
      ...(sortField
        ? { [sortField]: Number(sortOrder) === 1 ? "asc" : "desc" }
        : { id: "asc" }),
    },
  });

  const total = await prisma.project.count({
    where: {
      ...(name ? { name: { contains: name, mode: "insensitive" } } : {}),
      user_id,
    },
  });

  return {
    data,
    total,
  };
};

const createOne = async ({
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
}: ProjectCreate) => {
  return await prisma.project.create({
    data: {
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
      user_id,
      tenant_code: uuidv4(),
    },
  });
};

const updateOne = async ({
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
  description,
  id,
}: ProjectUpdate) => {
  return await prisma.project.update({
    data: {
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
      description,
    },
    where: { id },
  });
};

const deleteOne = async (id: number) => {
  return await prisma.project.delete({
    where: { id },
  });
};

export const projectService = {
  createOne,
  findOne,
  findOneByTenantCode,
  findMany,
  updateOne,
  deleteOne,
};
