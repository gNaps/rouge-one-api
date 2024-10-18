import otpGenerator from "otp-generator";
import prisma from "../db";
import { MagicLinkCreate } from "../models/magic-link.model";

const findOneByToken = async (token: string) => {
  return await prisma.magicToken.findFirst({
    where: {
      token,
    },
  });
};

const createOne = async ({
  email = "",
  for_user = false,
  for_people = false,
  project_id,
}: Partial<MagicLinkCreate>) => {
  const expired_at = new Date();
  expired_at.setHours(expired_at.getHours() + 2);

  return await prisma.magicToken.create({
    data: {
      token: otpGenerator.generate(32, {
        digits: false,
        specialChars: false,
      }),
      expired_at,
      email,
      for_user,
      for_people,
      project_id,
    },
  });
};

const deleteOne = async (id: number) => {
  return await prisma.magicToken.delete({
    where: { id },
  });
};

export const magicLinkService = {
  createOne,
  findOneByToken,
  deleteOne,
};
