import prisma from "../prisma";

export const findPromotor = async (username: string, email: string) => {
  const promotor = await prisma.promotor.findFirst({
    where: { OR: [{ username: username }, { email: email }] },
  });

  return promotor;
};
