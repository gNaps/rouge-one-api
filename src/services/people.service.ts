import prisma from "../db";
import {
  PeopleFindMany,
  PeopleSignin,
  PeopleSignup,
  PeopleUpdate,
} from "../models/people.model";

const findMany = async ({
  email,
  project_id,
  page = 1,
  take = 500,
  sortField = "",
  sortOrder = 1,
}: PeopleFindMany) => {
  console.log("PAGE", page);
  console.log("TAKE", take);
  console.log("SKIP", (Number(page) - 1) * Number(take));
  const data = await prisma.people.findMany({
    where: {
      ...(email ? { email: { contains: email, mode: "insensitive" } } : {}),
      project_id,
    },
    select: {
      id: true,
      email: true,
      firstname: true,
      surname: true,
      image: true,
      verified: true,
      last_login: true,
      count_login: true,
      role: true,
      is_provider: true,
      provider: true,
      created_at: true,
    },
    skip: Number(page) * Number(take),
    take: Number(take),
    orderBy: {
      ...(sortField
        ? { [sortField]: Number(sortOrder) === 1 ? "asc" : "desc" }
        : { id: "asc" }),
    },
  });

  const total = await prisma.people.count({
    where: {
      ...(email ? { email: { contains: email, mode: "insensitive" } } : {}),
      project_id,
    },
  });

  return {
    data,
    total,
  };
};

const findOne = async (id: number) => {
  return await prisma.people.findUnique({
    where: {
      id,
    },
  });
};

const createOne = async ({
  email,
  password,
  image,
  firstname,
  surname,
  provider,
  verified,
  project_id,
  role_id,
}: Partial<PeopleSignup>) => {
  return await prisma.people.create({
    data: {
      email: email!,
      password,
      image,
      firstname,
      surname,
      ...(provider && { provider, is_provider: true }),
      verified,
      project_id: project_id!,
      role_id: role_id!,
    },
  });
};

const updateOne = async ({
  firstname,
  surname,
  meta_data,
  verified,
  last_login,
  count_login,
  id,
}: Partial<PeopleUpdate>) => {
  return await prisma.people.update({
    data: {
      firstname,
      surname,
      meta_data,
      verified,
      last_login,
      count_login,
    },
    where: { id },
  });
};

const deleteOne = async (id: number) => {
  return await prisma.people.delete({
    where: { id },
  });
};

// DOMAIN LOGIC

const setNewSignin = async (id: number) => {
  return await prisma.people.update({
    where: {
      id,
    },
    data: {
      last_login: new Date(),
      count_login: { increment: 1 },
    },
  });
};

const findOneByProject = async ({
  email,
  project_id,
}: Partial<PeopleSignin>) => {
  return await prisma.people.findFirst({
    where: {
      email,
      project_id,
    },
  });
};

export const peopleService = {
  createOne,
  findOneByProject,
  setNewSignin,
  findMany,
  updateOne,
  deleteOne,
  findOne,
};
