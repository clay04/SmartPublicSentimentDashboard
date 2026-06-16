import prismaPackage from '@prisma/client';

const { PrismaClient } = prismaPackage;

const prisma = new PrismaClient();

export default prisma;