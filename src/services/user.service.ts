import prisma from "../db";
import { UserSignin, UserSignup } from "../models/user.model";

const findOneByEmail = async ({ email }: Partial<UserSignin>) => {
  return await prisma.user.findFirst({
    where: {
      email,
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
}: Partial<UserSignup>) => {
  return await prisma.user.create({
    data: {
      email: email!,
      password,
      image,
      firstname,
      surname,
      ...(provider && { provider, is_provider: true }),
      verified,
    },
  });
};

const setNewSignin = async (id: number) => {
  return await prisma.user.update({
    where: {
      id,
    },
    data: {
      last_login: new Date(),
      count_login: { increment: 1 },
    },
  });
};

export const userService = {
  createOne,
  findOneByEmail,
  setNewSignin,
};
